import { Readable } from 'node:stream'
import type { Response } from 'express'
import type { ConnectedAccount, File } from '@prisma/client'
import { getAuthedGoogleClient } from '../google/google.service.js'

type FileWithAccount = File & { connectedAccount: ConnectedAccount }
type StreamOptions = { disposition?: 'inline' | 'attachment' }

export const googleDownloadExportMimeTypes: Record<string, { mimeType: string; extension: string }> = {
  'application/vnd.google-apps.document': { mimeType: 'application/pdf', extension: '.pdf' },
  'application/vnd.google-apps.spreadsheet': { mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extension: '.xlsx' },
  'application/vnd.google-apps.presentation': { mimeType: 'application/pdf', extension: '.pdf' },
  'application/vnd.google-apps.drawing': { mimeType: 'image/png', extension: '.png' },
}

const googlePreviewExportMimeTypes: Record<string, { mimeType: string; extension: string }> = {
  ...googleDownloadExportMimeTypes,
  'application/vnd.google-apps.spreadsheet': { mimeType: 'application/pdf', extension: '.pdf' },
}

function contentDisposition(type: 'inline' | 'attachment', fileName: string) {
  return `${type}; filename="${fileName.replaceAll('"', '')}"`
}

export function withExtension(fileName: string, extension: string) {
  return fileName.toLowerCase().endsWith(extension) ? fileName : `${fileName}${extension}`
}

export function normalizeHeaders(headers: Headers | Record<string, string>) {
  if (headers instanceof Headers) return Object.fromEntries(headers.entries())
  return headers
}

/**
 * Build an optimal Cache-Control value based on file MIME type and disposition.
 * - video/*  → browser 1 day, CDN 30 days (Cloudflare ignores max-age, uses s-maxage)
 * - image/*  → browser 1 day, CDN 30 days, immutable on CDN
 * - pdf/doc  → browser 1 hour, CDN 1 day
 * - attachment (download) → private, no CDN cache
 */
function buildCacheControl(mimeType: string, disposition: 'inline' | 'attachment' | undefined): string {
  if (disposition === 'attachment') {
    return 'private, no-store'
  }

  const type = mimeType.split('/')[0]

  if (type === 'video') {
    // Long CDN cache, moderate browser cache
    return 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400'
  }

  if (type === 'image') {
    // Long CDN cache, immutable once cached — images don't change
    return 'public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400, immutable'
  }

  if (mimeType === 'application/pdf') {
    return 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=3600'
  }

  // Generic inline (e.g. text, exports)
  return 'public, max-age=3600, s-maxage=86400'
}

export async function streamGoogleFile(file: FileWithAccount, range: string | undefined, res: Response, options: StreamOptions = {}) {
  const auth = await getAuthedGoogleClient(file.connectedAccount)
  const headers = normalizeHeaders(await auth.getRequestHeaders())
  const exportTarget = (options.disposition === 'inline' ? googlePreviewExportMimeTypes : googleDownloadExportMimeTypes)[file.mimeType]
  const responseMimeType = exportTarget?.mimeType ?? file.mimeType
  const responseFileName = exportTarget ? withExtension(file.name, exportTarget.extension) : file.name

  const url = exportTarget
    ? `https://www.googleapis.com/drive/v3/files/${file.providerFileId}/export?mimeType=${encodeURIComponent(exportTarget.mimeType)}`
    : `https://www.googleapis.com/drive/v3/files/${file.providerFileId}?alt=media`

  const response = await fetch(url, {
    headers: {
      ...headers,
      ...(range && !exportTarget ? { Range: range } : {}),
    },
  })

  if (!response.ok && response.status !== 206) {
    const message = await response.text().catch(() => response.statusText)
    return res.status(response.status).json({ code: 'GOOGLE_FILE_STREAM_FAILED', message: message || response.statusText })
  }

  res.status(response.status)
  res.setHeader('Content-Type', responseMimeType)
  res.setHeader('Accept-Ranges', 'bytes')
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Vary header — tells Cloudflare to cache separately for different Accept-Encoding
  res.setHeader('Vary', 'Accept-Encoding')

  // Cache-Control based on mime type and disposition
  const cacheControl = buildCacheControl(responseMimeType, options.disposition)
  res.setHeader('Cache-Control', cacheControl)

  // Forward Content-Disposition
  if (options.disposition) {
    res.setHeader('Content-Disposition', contentDisposition(options.disposition, responseFileName))
  }

  // Forward ETag from Google Drive — enables 304 Not Modified on browser/CDN revalidation
  const etag = response.headers.get('etag')
  if (etag) res.setHeader('ETag', etag)

  // Forward Last-Modified from Google Drive
  const lastModified = response.headers.get('last-modified')
  if (lastModified) res.setHeader('Last-Modified', lastModified)

  // Forward Content-Length and Content-Range for range requests (video seeking)
  const contentLength = response.headers.get('content-length')
  const contentRange = response.headers.get('content-range')
  if (contentLength) res.setHeader('Content-Length', contentLength)
  if (contentRange) res.setHeader('Content-Range', contentRange)

  if (!response.body) {
    res.end()
    return
  }

  return Readable.fromWeb(response.body as any).pipe(res)
}
