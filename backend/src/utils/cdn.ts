import { env } from '../config/env.js'
import { createHash } from 'node:crypto'

let _cdnOrigins: string[] | null = null

/**
 * Parse CDN_SUBDOMAINS env variable into an array of origins.
 * Strips trailing slashes. Returns empty array if not configured.
 */
function getCdnOrigins(): string[] {
  if (_cdnOrigins !== null) return _cdnOrigins

  const raw = env.CDN_SUBDOMAINS || process.env.CDN_SUBDOMAINS || ''
  _cdnOrigins = raw
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean)

  if (_cdnOrigins.length > 0) {
    console.log(`[CDN] Loaded ${_cdnOrigins.length} CDN origin(s):`, _cdnOrigins)
  }

  return _cdnOrigins
}

/**
 * Pick a CDN origin for a given fileId using a stable hash so the same file
 * always maps to the same CDN edge node (cache consistency).
 * Returns null if no CDN subdomains are configured.
 */
export function getCdnOriginForFile(fileId: string): string | null {
  const origins = getCdnOrigins()
  if (origins.length === 0) return null

  const hash = createHash('sha256').update(fileId).digest()
  const index = hash.readUInt32BE(0) % origins.length
  return origins[index]
}

/**
 * Build a CDN preview URL for a given preview token path.
 * Uses stable CDN origin based on fileId hash for cache consistency.
 * Falls back to null if CDN is not configured.
 */
export function buildCdnPreviewUrl(fileId: string, previewPath: string): string | null {
  const origin = getCdnOriginForFile(fileId)
  if (!origin) return null
  // previewPath should start with /files/preview/<token>
  return `${origin}${previewPath}`
}
