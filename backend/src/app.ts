import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorMiddleware } from './middleware/error.middleware.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { providerConfigRouter } from './modules/provider-configs/provider-config.routes.js'
import { connectedAccountRouter } from './modules/connected-accounts/connected-account.routes.js'
import { storageRouter } from './modules/storage/storage.routes.js'
import { uploadRouter } from './modules/uploads/upload.routes.js'
import { fileRouter } from './modules/files/file.routes.js'
import { folderRouter } from './modules/folders/folder.routes.js'
import { publicRouter } from './modules/public/public.routes.js'
import { inviteRouter } from './modules/invites/invite.routes.js'
import { apiKeyRouter } from './modules/api-keys/api-key.routes.js'
import { publicApiRouter } from './modules/public-api/public-api.routes.js'
import { auditLogRouter } from './modules/audit-logs/audit-log.routes.js'
import { systemRouter } from './modules/system/system.routes.js'

export const app = express()
app.set('trust proxy', true)

app.use(cors({ origin: env.FRONTEND_URL }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api', publicApiRouter)
app.use('/public', publicRouter)
app.use('/auth', authRouter)
app.use('/api-keys', apiKeyRouter)
app.use('/provider-configs', providerConfigRouter)
app.use('/connected-accounts', connectedAccountRouter)
app.use('/storage', storageRouter)
app.use('/uploads', uploadRouter)
app.use('/files', fileRouter)
app.use('/folders', folderRouter)
app.use('/invites', inviteRouter)
app.use('/audit-logs', auditLogRouter)
app.use('/system', systemRouter)

// Fail-safe: Proxy non-API web requests to frontend Nginx container
app.use((req, res, next) => {
  const apiPaths = [
    '/api', '/public', '/auth', '/api-keys', '/provider-configs',
    '/connected-accounts', '/storage', '/uploads', '/files', '/folders',
    '/invites', '/audit-logs', '/system', '/health'
  ]
  const isApiPath = apiPaths.some((p) => req.path === p || req.path.startsWith(p + '/'))

  if (!isApiPath && (req.method === 'GET' || req.method === 'HEAD')) {
    const targetUrl = `http://frontend:80${req.originalUrl}`
    fetch(targetUrl)
      .then(async (proxyRes) => {
        if (!proxyRes.ok && proxyRes.status === 404 && !req.path.includes('.')) {
          const indexRes = await fetch('http://frontend:80/')
          res.setHeader('content-type', 'text/html; charset=utf-8')
          return res.send(await indexRes.text())
        }
        const contentType = proxyRes.headers.get('content-type')
        if (contentType) res.setHeader('content-type', contentType)
        res.status(proxyRes.status)
        const buffer = Buffer.from(await proxyRes.arrayBuffer())
        res.send(buffer)
      })
      .catch(() => next())
  } else {
    next()
  }
})

app.use(errorMiddleware)
