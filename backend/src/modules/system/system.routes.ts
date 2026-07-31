import { Router } from 'express'
import { exec, spawn } from 'child_process'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { requireAuth } from '../../middleware/auth.middleware.js'
import { prisma } from '../../config/prisma.js'
import { decryptText, encryptText } from '../../utils/crypto.js'
import Busboy from 'busboy'

export const systemRouter = Router()

const IS_MYSQL = (process.env.DATABASE_URL || '').startsWith('mysql')


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

systemRouter.get('/backup', requireAuth, async (req, res, next) => {
  try {
    if (IS_MYSQL) {
      const sql = await generateMysqlDump()
      res.setHeader('Content-Disposition', 'attachment; filename=9drive-backup.sql')
      res.setHeader('Content-Type', 'application/sql')
      return res.send(sql)
    }
    const dbPath = getDatabaseFilePath()
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Database file not found.' })
    }
    res.setHeader('Content-Disposition', 'attachment; filename=9drive-backup.db')
    res.setHeader('Content-Type', 'application/octet-stream')
    const fileStream = fs.createReadStream(dbPath)
    fileStream.pipe(res)
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

    const busboy = Busboy({ headers: req.headers, limits: { files: 1 } })
    let fileReceived = false
    const dbPath = getDatabaseFilePath()
    const tempRestorePath = IS_MYSQL
      ? path.join(os.tmpdir(), `9drive-restore-${Date.now()}-${Math.random().toString(36).slice(2)}.sql`)
      : dbPath + '.tmp'
    const writeStream = fs.createWriteStream(tempRestorePath)

    busboy.on('file', (name, fileStream, info) => {
      fileReceived = true
      fileStream.pipe(writeStream)

      writeStream.on('finish', async () => {
        try {
          if (IS_MYSQL) {
            const content = fs.readFileSync(tempRestorePath, 'utf8')
            const statements = parseSqlStatements(content)
            let executed = 0
            await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=0')
            for (const statement of statements) {
              await prisma.$executeRawUnsafe(statement)
              executed += 1
            }
            await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS=1')
            return res.json({
              status: 'success',
              message: `Database restored successfully. ${executed} SQL statements executed.`
            })
          }

          // Disconnect prisma client first to release database lock
          await prisma.$disconnect()

          // Replace old database file with restored database file
          fs.renameSync(tempRestorePath, dbPath)

          res.json({
            status: 'success',
            message: 'Database restored successfully. Server will restart in 2 seconds.'
          })

          // Graceful exit after response is sent
          setTimeout(() => {
            console.log('Database restored. Exiting to allow PM2 restart.')
            process.exit(0)
          }, 2000)

        } catch (err: any) {
          if (fs.existsSync(tempRestorePath)) {
            try { fs.unlinkSync(tempRestorePath) } catch {}
          }
          console.error('Failed to restore database:', err)
          return res.status(500).json({
            code: 'RESTORE_FAILED',
            message: 'Failed to restore database.',
            error: err.message
          })
        }
      })

      writeStream.on('error', (err) => {
        if (fs.existsSync(tempRestorePath)) {
          try { fs.unlinkSync(tempRestorePath) } catch {}
        }
        console.error('Write error on temp DB:', err)
        return res.status(500).json({
          code: 'WRITE_ERROR',
          message: 'Failed to write temporary database file.',
          error: err.message
        })
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

function getDatabaseFilePath(): string {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'
  let cleanPath = dbUrl.replace(/^(sqlite|file):/, '')

  if (cleanPath.includes('?')) {
    cleanPath = cleanPath.split('?')[0]
  }

  if (!path.isAbsolute(cleanPath)) {
    let baseDir = path.resolve(process.cwd(), 'prisma')
    if (!fs.existsSync(baseDir)) {
      baseDir = path.resolve(process.cwd(), 'backend', 'prisma')
    }
    if (!fs.existsSync(baseDir)) {
      baseDir = path.resolve(process.cwd(), '..', 'backend', 'prisma')
    }
    return path.resolve(baseDir, cleanPath)
  }

  return cleanPath
}

async function generateMysqlDump(): Promise<string> {
  const tablesResult = await prisma.$queryRawUnsafe('SHOW TABLES') as Array<Record<string, unknown>>
  const tables = tablesResult.map((row) => Object.values(row)[0] as string)

  let sql = '-- 9Drive System Backup (MySQL)\n'
  sql += `-- Generated at: ${new Date().toISOString()}\n\n`
  sql += 'SET FOREIGN_KEY_CHECKS=0;\n\n'

  for (const table of tables) {
    const createRows = await prisma.$queryRawUnsafe(`SHOW CREATE TABLE \`${table}\``) as Array<Record<string, unknown>>
    if (createRows.length === 0) continue
    const createSql = Object.values(createRows[0])[1] as string

    sql += `DROP TABLE IF EXISTS \`${table}\`;\n`
    sql += createSql + ';\n\n'

    const rows = await prisma.$queryRawUnsafe(`SELECT * FROM \`${table}\``) as Array<Record<string, unknown>>
    for (const row of rows) {
      const keys = Object.keys(row).map((k) => `\`${k}\``).join(', ')
      const values = Object.values(row).map(mysqlLiteral).join(', ')
      sql += `INSERT INTO \`${table}\` (${keys}) VALUES (${values});\n`
    }
    sql += '\n'
  }

  sql += 'SET FOREIGN_KEY_CHECKS=1;\n'
  return sql
}

function mysqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL'
  if (typeof value === 'boolean') return value ? '1' : '0'
  if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    return `X'${Buffer.from(value).toString('hex')}'`
  }
  const str = String(value)
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\x00/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
  return `'${escaped}'`
}

function parseSqlStatements(sql: string): string[] {
  const clean = sql
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim()
      return trimmed !== '' && !trimmed.startsWith('--')
    })
    .join('\n')

  return clean
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}
