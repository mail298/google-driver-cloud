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

export async function streamGoogleFile(file: FileWithAccount, range: string | undefined, res: Response, options: StreamOptions = {}) {
  const exportTarget = (options.disposition === 'inline' ? googlePreviewExportMimeTypes : googleDownloadExportMimeTypes)[file.mimeType]
  const responseMimeType = exportTarget?.mimeType ?? file.mimeType
  const responseFileName = exportTarget ? withExtension(file.name, exportTarget.extension) : file.name

  let response: globalThis.Response | null = null

  // Fast-path for direct Google Drive CDN (videos, audio, large media files)
  if (!exportTarget) {
    try {
      const cdnUrl = `https://drive.google.com/uc?export=download&id=${file.providerFileId}`
      const cdnRes = await fetch(cdnUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          ...(range ? { Range: range } : {}),
        },
        redirect: 'follow',
      })
      if (cdnRes.ok || cdnRes.status === 206) {
        response = cdnRes
      }
    } catch (_) {
      // Fall back to OAuth API below if direct CDN fails
    }
  }

  if (!response) {
    const auth = await getAuthedGoogleClient(file.connectedAccount)
    const headers = normalizeHeaders(await auth.getRequestHeaders())
    const url = exportTarget
      ? `https://www.googleapis.com/drive/v3/files/${file.providerFileId}/export?mimeType=${encodeURIComponent(exportTarget.mimeType)}`
      : `https://www.googleapis.com/drive/v3/files/${file.providerFileId}?alt=media`
    response = await fetch(url, {
      headers: {
        ...headers,
        ...(range && !exportTarget ? { Range: range } : {}),
      },
    })
  }

  if (!response.ok && response.status !== 206) {
    const message = await response.text().catch(() => response.statusText)
    return res.status(response.status).json({ code: 'GOOGLE_FILE_STREAM_FAILED', message: message || response.statusText })
  }

  res.status(response.status)
  res.setHeader('Content-Type', responseMimeType)
  res.setHeader('Accept-Ranges', 'bytes')
  if (options.disposition === 'inline') {
    res.setHeader('Cache-Control', 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=2592000, immutable')
  }
  if (options.disposition) res.setHeader('Content-Disposition', contentDisposition(options.disposition, responseFileName))

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
