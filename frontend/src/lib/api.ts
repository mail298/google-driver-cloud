import { clearAuthSession, getAccessToken, getRefreshToken, setAccessToken } from '@/lib/auth'

const isProd = import.meta.env.PROD
const rawApiUrl = import.meta.env.VITE_API_URL
export const API_URL = (rawApiUrl && rawApiUrl !== 'http://localhost:4000')
  ? rawApiUrl
  : (isProd ? 'https://googledrivebackend.ikan212.com' : 'http://localhost:4000')


type ApiOptions = RequestInit & { skipAuth?: boolean; retry?: boolean }

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  if (!response.ok) return false
  const data = await response.json() as { accessToken: string }
  setAccessToken(data.accessToken)
  return true
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = getAccessToken()
  if (!options.skipAuth && token) headers.set('Authorization', `Bearer ${token}`)
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (response.status === 401 && options.retry !== false && !options.skipAuth && await refreshAccessToken()) {
    return apiFetch<T>(path, { ...options, retry: false })
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    if (response.status === 401 && !options.skipAuth) clearAuthSession()
    if (response.status === 403 && error.code === 'IP_NOT_ALLOWED') {
      try {
        sessionStorage.setItem('ip_blocked_msg', error.message || 'IP Access Restricted')
      } catch {}
      window.dispatchEvent(new CustomEvent('ip-blocked', { detail: { message: error.message } }))
    } else {
      try {
        sessionStorage.removeItem('ip_blocked_msg')
      } catch {}
    }
    throw new Error(error.message ?? 'Request failed')
  } else {
    try {
      sessionStorage.removeItem('ip_blocked_msg')
    } catch {}
  }

  return response.json() as Promise<T>
}

export function formatBytes(input: string | number | bigint | null | undefined) {
  if (input === null || input === undefined) return '--'
  const bytes = Number(input)
  if (!Number.isFinite(bytes)) return '--'
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${units[index]}`
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function formatCdnUrl(originalUrl: string, keyId?: string) {
  if (!originalUrl) return originalUrl
  try {
    const cdnListRaw = import.meta.env.VITE_CDN_SUBDOMAINS as string | undefined
    if (!cdnListRaw) return originalUrl

    const cdnList = cdnListRaw.split(',').map((s) => s.trim()).filter(Boolean)
    if (cdnList.length === 0) return originalUrl

    const urlObj = new URL(originalUrl)
    const charCodeSum = (keyId || '0').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const selectedDomain = cdnList[charCodeSum % cdnList.length]

    if (selectedDomain.startsWith('http://') || selectedDomain.startsWith('https://')) {
      const targetObj = new URL(selectedDomain)
      urlObj.protocol = targetObj.protocol
      urlObj.host = targetObj.host
    } else {
      urlObj.host = selectedDomain
    }

    return urlObj.toString()
  } catch {
    return originalUrl
  }
}
