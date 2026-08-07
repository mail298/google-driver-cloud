import { Router } from 'express'
import { exec, spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { prisma } from '../../config/prisma.js'
import { decryptText, encryptText } from '../../utils/crypto.js'
import { getSystemAnalytics, sendTelegramNotification } from '../../services/telegram.service.js'
import { clearErrorLogs, getErrorLogs } from '../../utils/logger.js'
import Busboy from 'busboy'

import { addWhitelistedIp, getWhitelistedIps, removeWhitelistedIp } from '../../utils/ip-whitelist.store.js'

export const systemRouter = Router()

systemRouter.get('/ip-whitelist', requireAuth, (_req, res) => {
  const ips = getWhitelistedIps()
  return res.json({ ips, count: ips.length })
})

systemRouter.post('/ip-whitelist', requireAuth, (req, res) => {
  const { ip } = req.body ?? {}
  if (!ip || typeof ip !== 'string') {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'IP address string is required.' })
  }
  const result = addWhitelistedIp(ip)
  if (!result.success) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: result.message })
  }
  return res.json({ status: 'success', message: result.message, ips: result.ips })
})

systemRouter.delete('/ip-whitelist', requireAuth, (req, res) => {
  const { ip } = req.body ?? {}
  if (!ip || typeof ip !== 'string') {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'IP address string is required.' })
  }
  const result = removeWhitelistedIp(ip)
  if (!result.success) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: result.message })
  }
  return res.json({ status: 'success', message: result.message, ips: result.ips })
})

systemRouter.get('/analytics', requireAuth, async (_req, res, next) => {
  try {
    const analytics = await getSystemAnalytics()
    return res.json(analytics)
  } catch (error) {
    return next(error)
  }
})

systemRouter.post('/telegram-test', requireAuth, async (_req, res, next) => {
  try {
    const analytics = await getSystemAnalytics()
    const text = [
      `👤 <b>9Drive Telegram Test Notification</b>`,
      `✅ Telegram Bot integration is working properly!`,
      `📊 <b>Total Registered Users:</b> ${analytics.totalUsers}`
    ].join('\n')

    const success = await sendTelegramNotification(text)
    if (!success) {
      return res.status(400).json({
        code: 'TELEGRAM_CONFIG_MISSING',
        message: 'Failed to send Telegram message. Make sure TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables are set in your backend configuration.'
      })
    }
    return res.json({ status: 'success', message: 'Test message sent to Telegram successfully!' })
  } catch (error) {
    return next(error)
  }
})

systemRouter.get('/error-logs', requireAuth, (_req, res) => {
  const logs = getErrorLogs()
  return res.json({ logs, count: logs.length })
})

systemRouter.get('/error-logs/download', requireAuth, (_req, res) => {
  const logFile = path.resolve(process.cwd(), 'logs', 'error-log.json')
  if (!fs.existsSync(logFile)) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'No JSON error log file found.' })
  }
  res.setHeader('Content-Disposition', 'attachment; filename=error-log.json')
  res.setHeader('Content-Type', 'application/json')
  return res.sendFile(logFile)
})

systemRouter.delete('/error-logs', requireAuth, (_req, res) => {
  clearErrorLogs()
  return res.json({ status: 'success', message: 'Error log file cleared.' })
})



systemRouter.post('/update', requireAuth, (req, res, next) => {
  const projectRoot = path.resolve(process.cwd(), '..')
  const updateScript = path.join(projectRoot, 'update.sh')

  // Check if git is installed
  exec('git --version', (gitError) => {
    if (gitError) {
      return res.status(400).json({
        code: 'GIT_NOT_FOUND',
        message: 'Git is not installed inside the app container. Since you are running 9Drive in Docker, please update by running:\n\n1. ssh root@103.65.237.136\n2. cd 9drive\n3. git pull\n4. docker-compose down && docker-compose up -d --build\n\ndirectly in your VPS host terminal.'
      })
    }

    if (fs.existsSync(updateScript)) {
      try {
        // Clear old update log to prevent race conditions on frontend polling
        const logFile = path.join(projectRoot, 'update.log')
        fs.writeFileSync(logFile, 'Initiating update...\n')

        const child = spawn('bash', ['update.sh'], {
          cwd: projectRoot,
          detached: true,
          stdio: 'ignore'
        })
        child.unref()

        return res.json({
          status: 'success',
          message: 'System update initiated. Rebuilding and restarting backend & frontend in the background. Please wait ~1 minute and refresh the page.'
        })
      } catch (err: any) {
        return res.status(500).json({
          code: 'UPDATE_FAILED',
          message: 'Failed to start update script.',
          error: err.message
        })
      }
    } else {
      // Fallback to simple git pull if update.sh doesn't exist
      exec('git pull', { cwd: projectRoot }, (error, stdout, stderr) => {
        if (error) {
          console.error('System update failed:', error)
          return res.status(500).json({
            code: 'UPDATE_FAILED',
            message: 'Failed to run git pull. Make sure git is installed and configured.',
            error: error.message,
            stderr
          })
        }

        console.log('System update stdout:', stdout)
        if (stderr) {
          console.warn('System update stderr:', stderr)
        }

        return res.json({
          status: 'success',
          message: 'System code updated successfully. Dev servers will auto-restart.',
          stdout,
          stderr
        })
      })
    }
  })
})

systemRouter.get('/update-log', requireAuth, (req, res) => {
  const projectRoot = path.resolve(process.cwd(), '..')
  const logFile = path.join(projectRoot, 'update.log')

  if (!fs.existsSync(logFile)) {
    return res.json({
      log: 'No update history found.'
    })
  }

  try {
    const logContent = fs.readFileSync(logFile, 'utf8')
    return res.json({
      log: logContent
    })
  } catch (error: any) {
    return res.status(500).json({
      code: 'READ_LOG_FAILED',
      message: 'Failed to read update log file.',
      error: error.message
    })
  }
})

systemRouter.get('/google-config', requireAuth, async (req, res, next) => {
  try {
    const config = await prisma.providerConfig.findFirst({
      where: { userId: null, provider: 'google_drive', status: 'active' },
      orderBy: { createdAt: 'desc' }
    })

    const defaultRedirect = `${req.protocol}://${req.get('host')}/connected-accounts/google/callback`

    if (!config) {
      return res.json({
        exists: false,
        defaultRedirectUri: defaultRedirect
      })
    }

    let clientId = ''
    try {
      clientId = decryptText(config.clientIdEncrypted)
    } catch {
      clientId = ''
    }

    return res.json({
      exists: true,
      clientId,
      redirectUri: config.redirectUri,
      hasSecret: !!config.clientSecretEncrypted,
      defaultRedirectUri: defaultRedirect
    })
  } catch (error) {
    return next(error)
  }
})

systemRouter.post('/google-config', requireAuth, async (req, res, next) => {
  try {
    const { clientId, clientSecret, redirectUri } = req.body

    if (!clientId) {
      return res.status(400).json({ code: 'BAD_REQUEST', message: 'Client ID is required.' })
    }

    const defaultRedirect = `${req.protocol}://${req.get('host')}/connected-accounts/google/callback`
    const finalRedirectUri = redirectUri || defaultRedirect

    const scopes = [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ]

    // Disable old global active config
    await prisma.providerConfig.updateMany({
      where: { userId: null, provider: 'google_drive', status: 'active' },
      data: { status: 'disabled' }
    })

    // Retrieve the old config to see if we need to reuse the secret if it was not provided in the request
    let finalSecret = clientSecret
    if (!finalSecret) {
      const oldConfig = await prisma.providerConfig.findFirst({
        where: { userId: null, provider: 'google_drive', status: 'disabled' },
        orderBy: { createdAt: 'desc' }
      })
      if (oldConfig) {
        try {
          finalSecret = decryptText(oldConfig.clientSecretEncrypted)
        } catch {
          // ignore
        }
      }
    }

    if (!finalSecret) {
      return res.status(400).json({ code: 'BAD_REQUEST', message: 'Client Secret is required for first-time setup.' })
    }

    const config = await prisma.providerConfig.create({
      data: {
        userId: null,
        provider: 'google_drive',
        clientIdEncrypted: encryptText(clientId),
        clientSecretEncrypted: encryptText(finalSecret),
        redirectUri: finalRedirectUri,
        scopes,
        status: 'active'
      }
    })

    return res.status(201).json({
      status: 'success',
      message: 'Global Google OAuth configuration updated successfully.',
      id: config.id
    })
  } catch (error) {
    return next(error)
  }
})

systemRouter.get('/backup', requireAuth, async (_req, res, next) => {
  try {
    const [
      users,
      userSessions,
      providerConfigs,
      connectedAccounts,
      storageAccounts,
      s3StorageConfigs,
      folders,
      files,
      fileShares,
      filePreviewTokens,
      auditLogs,
      workspaceInvites,
      allowedIps,
      apiKeys,
      uploadRoutingPolicies
    ] = await Promise.all([
      prisma.user.findMany(),
      prisma.userSession.findMany(),
      prisma.providerConfig.findMany(),
      prisma.connectedAccount.findMany(),
      prisma.storageAccount.findMany(),
      prisma.s3StorageConfig.findMany(),
      prisma.folder.findMany(),
      prisma.file.findMany(),
      prisma.fileShare.findMany(),
      prisma.filePreviewToken.findMany(),
      prisma.auditLog.findMany(),
      prisma.workspaceInvite.findMany(),
      prisma.allowedIp.findMany(),
      prisma.apiKey.findMany(),
      prisma.uploadRoutingPolicy.findMany()
    ])

    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        users,
        userSessions,
        providerConfigs,
        connectedAccounts,
        storageAccounts,
        s3StorageConfigs,
        folders,
        files,
        fileShares,
        filePreviewTokens,
        auditLogs,
        workspaceInvites,
        allowedIps,
        apiKeys,
        uploadRoutingPolicies
      }
    }

    const jsonString = JSON.stringify(
      backupData,
      (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
      2
    )

    const dateStr = new Date().toISOString().split('T')[0]
    res.setHeader('Content-Disposition', `attachment; filename=9drive-backup-${dateStr}.json`)
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).send(jsonString)
  } catch (error) {
    return next(error)
  }
})

systemRouter.post('/restore', requireAuth, (req, res, next) => {
  try {
    const contentType = req.headers['content-type']
    if (!contentType?.includes('multipart/form-data')) {
      return res.status(400).json({ code: 'BAD_REQUEST', message: 'multipart/form-data required.' })
    }

    const busboy = Busboy({ headers: req.headers, limits: { fileSize: 50 * 1024 * 1024 } })
    let fileReceived = false
    const chunks: Buffer[] = []

    busboy.on('file', (_name, fileStream) => {
      fileReceived = true
      fileStream.on('data', (chunk) => chunks.push(chunk))

      fileStream.on('end', async () => {
        try {
          const rawText = Buffer.concat(chunks).toString('utf-8')
          const backupObj = JSON.parse(rawText)
          const data = backupObj.data || backupObj

          if (!data || typeof data !== 'object') {
            return res.status(400).json({ code: 'INVALID_BACKUP', message: 'Invalid backup file format.' })
          }

          // Restore users
          if (Array.isArray(data.users)) {
            for (const item of data.users) {
              await prisma.user.upsert({
                where: { id: item.id },
                create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
                update: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) }
              }).catch(() => undefined)
            }
          }

          // Restore providerConfigs
          if (Array.isArray(data.providerConfigs)) {
            for (const item of data.providerConfigs) {
              await prisma.providerConfig.upsert({
                where: { id: item.id },
                create: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
                update: { ...item, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) }
              }).catch(() => undefined)
            }
          }

          // Restore connectedAccounts
          if (Array.isArray(data.connectedAccounts)) {
            for (const item of data.connectedAccounts) {
              await prisma.connectedAccount.upsert({
                where: { id: item.id },
                create: { ...item, tokenExpiresAt: item.tokenExpiresAt ? new Date(item.tokenExpiresAt) : null, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
                update: { ...item, tokenExpiresAt: item.tokenExpiresAt ? new Date(item.tokenExpiresAt) : null, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) }
              }).catch(() => undefined)
            }
          }

          // Restore folders
          if (Array.isArray(data.folders)) {
            for (const item of data.folders) {
              await prisma.folder.upsert({
                where: { id: item.id },
                create: { ...item, deletedAt: item.deletedAt ? new Date(item.deletedAt) : null, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
                update: { ...item, deletedAt: item.deletedAt ? new Date(item.deletedAt) : null, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) }
              }).catch(() => undefined)
            }
          }

          // Restore files
          if (Array.isArray(data.files)) {
            for (const item of data.files) {
              await prisma.file.upsert({
                where: { id: item.id },
                create: { ...item, sizeBytes: BigInt(item.sizeBytes || 0), deletedAt: item.deletedAt ? new Date(item.deletedAt) : null, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) },
                update: { ...item, sizeBytes: BigInt(item.sizeBytes || 0), deletedAt: item.deletedAt ? new Date(item.deletedAt) : null, createdAt: new Date(item.createdAt), updatedAt: new Date(item.updatedAt) }
              }).catch(() => undefined)
            }
          }

          return res.json({
            status: 'success',
            message: 'Database backup restored successfully.'
          })
        } catch (err: any) {
          console.error('Failed to parse and restore database backup:', err)
          return res.status(500).json({
            code: 'RESTORE_FAILED',
            message: 'Failed to restore database backup. Invalid JSON or schema mismatch.',
            error: err.message
          })
        }
      })
    })

    busboy.on('error', (err) => {
      console.error('Busboy error:', err)
      if (!res.headersSent) {
        next(err)
      }
    })

    busboy.on('finish', () => {
      if (!fileReceived && !res.headersSent) {
        return res.status(400).json({ code: 'BAD_REQUEST', message: 'No file uploaded.' })
      }
    })

    req.pipe(busboy)
  } catch (error) {
    return next(error)
  }
})
