import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorMiddleware } from './middleware/error.middleware.js'
import { ipWhitelistMiddleware } from './middleware/ip-whitelist.middleware.js'
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

app.get('/robots.txt', (req, res) => {
  const hostHeader = req.header('x-forwarded-host') || req.header('host') || ''
  const host = hostHeader.split(',')[0].trim()
  const proto = req.header('x-forwarded-proto') || req.protocol || 'https'
  const baseUrl = host ? `${proto}://${host}` : env.FRONTEND_URL

  const content = `User-agent: *
Allow: /
Allow: /privacy
Allow: /terms
Disallow: /all-files
Disallow: /quota
Disallow: /shared
Disallow: /recent
Disallow: /starred
Disallow: /archived
Disallow: /trash
Disallow: /activity
Disallow: /settings
Disallow: /api

Sitemap: ${baseUrl}/sitemap.xml`

  res.header('Content-Type', 'text/plain')
  return res.send(content)
})

app.get('/sitemap.xml', (req, res) => {
  const hostHeader = req.header('x-forwarded-host') || req.header('host') || ''
  const host = hostHeader.split(',')[0].trim()
  const proto = req.header('x-forwarded-proto') || req.protocol || 'https'
  const baseUrl = host ? `${proto}://${host}` : env.FRONTEND_URL
  const today = new Date().toISOString().split('T')[0]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`

  res.header('Content-Type', 'application/xml')
  return res.send(xml)
})

app.use('/api', publicApiRouter)
app.use('/share', publicRouter)

// IP Whitelist protection for Dashboard & Admin Auth API routes
app.use(ipWhitelistMiddleware)

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
app.use(errorMiddleware)
