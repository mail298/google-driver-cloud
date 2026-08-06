import { API_URL } from './api'

// Parse CDN Hosts from environment variable (comma separated)
// Example: VITE_CDN_HOSTS="img1.wn-cdn.net,img2.wn-cdn.net,img3.wn-cdn.net,img4.wn-cdn.net"
const rawCdnHosts = import.meta.env.VITE_CDN_HOSTS as string | undefined

const parsedHosts = rawCdnHosts
  ? rawCdnHosts.split(',').map((h) => h.trim()).filter(Boolean)
  : []

/**
 * Deterministic polynomial string hashing (matching cliend implementation).
 * Selects a CDN host index from CDN_HOSTS based on file ID or key.
 */
export function cdnHostFor(fileId?: string | number | null): string | null {
  if (!fileId || parsedHosts.length === 0) return null
  let h = 0
  const s = String(fileId)
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return parsedHosts[Math.abs(h) % parsedHosts.length]
}

export interface CdnUrlOptions {
  host?: string
  path?: string
  thumb?: boolean
  inline?: boolean
  raw?: boolean
  version?: string | number | Date | null
  token?: string
  params?: Record<string, string>
}

/**
 * Hash a version string (e.g. createdAt/updatedAt) into an 8-char hex string for cache busting.
 */
export function hashVersion(version: string | number | Date): string {
  let h = 0
  const s = String(version)
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(16).padStart(8, '0').slice(0, 8)
}

/**
 * Constructs a CDN URL for file downloads, previews, thumbnails, or shares.
 * Shards across configured CDN hosts deterministically per file ID.
 */
export function cdnUrl(fileId?: string | number | null, options: CdnUrlOptions = {}): string {
  const selectedHost = options.host || cdnHostFor(fileId)
  const defaultPath = fileId ? `files/${fileId}/inline` : ''
  const path = options.path || defaultPath

  // Base origin determination
  let origin = API_URL
  if (selectedHost) {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
    origin = selectedHost.startsWith('http://') || selectedHost.startsWith('https://')
      ? selectedHost
      : `${protocol}//${selectedHost}`
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${origin}${cleanPath}`)

  if (options.token) {
    url.searchParams.set('token', options.token)
  }
  if (options.thumb) {
    url.searchParams.set('thumb', '1')
  }
  if (options.inline) {
    url.searchParams.set('inline', '1')
  }
  if (options.raw) {
    url.searchParams.set('raw', '1')
  }
  if (options.version) {
    url.searchParams.set('v', hashVersion(options.version))
  }
  if (options.params) {
    for (let [k, v] of Object.entries(options.params)) {
      url.searchParams.set(k, v)
    }
  }

  return url.toString()
}

/**
 * Get origin host for a given file ID (CDN host or fallback API_URL).
 */
export function getCdnOrigin(fileId?: string | number | null): string {
  const selectedHost = cdnHostFor(fileId)
  if (!selectedHost) return API_URL
  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
  return selectedHost.startsWith('http://') || selectedHost.startsWith('https://')
    ? selectedHost
    : `${protocol}//${selectedHost}`
}
