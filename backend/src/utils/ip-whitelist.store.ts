import fs from 'fs'
import path from 'path'
import { env } from '../config/env.js'

const LOG_DIR = path.resolve(process.cwd(), 'logs')
const FILE_PATH = path.join(LOG_DIR, 'ip-whitelist.json')

function ensureDirExists() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
}

// In-memory cache for fast lookups
let whitelistedIpsCache: string[] | null = null

function initCache(): string[] {
  if (whitelistedIpsCache !== null) {
    return whitelistedIpsCache
  }

  ensureDirExists()
  if (!fs.existsSync(FILE_PATH)) {
    const envIps = (env.ADMIN_ALLOWED_IPS || '')
      .split(',')
      .map((ip) => ip.trim())
      .filter(Boolean)

    whitelistedIpsCache = envIps
    saveToDiskAsync(envIps)
    return envIps
  }

  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8')
    const list = JSON.parse(raw)
    if (Array.isArray(list)) {
      whitelistedIpsCache = list.map((ip) => String(ip).trim()).filter(Boolean)
      return whitelistedIpsCache
    }
    whitelistedIpsCache = []
    return []
  } catch {
    whitelistedIpsCache = []
    return []
  }
}

function saveToDiskAsync(ips: string[]) {
  ensureDirExists()
  fs.promises
    .writeFile(FILE_PATH, JSON.stringify(ips, null, 2), 'utf-8')
    .catch((err) => console.error('[SECURITY] Failed to save IP Whitelist asynchronously:', err))
}

export function getWhitelistedIps(): string[] {
  return initCache()
}

export function saveWhitelistedIps(ips: string[]): string[] {
  const unique = Array.from(new Set(ips.map((ip) => ip.trim()).filter(Boolean)))
  whitelistedIpsCache = unique
  saveToDiskAsync(unique)
  return unique
}

export function addWhitelistedIp(ip: string): { success: boolean; ips: string[]; message: string } {
  const cleanIp = ip.trim().replace(/^::ffff:/, '')
  if (!cleanIp) {
    return { success: false, ips: getWhitelistedIps(), message: 'Invalid IP address.' }
  }

  const current = getWhitelistedIps()
  if (current.includes(cleanIp)) {
    return { success: true, ips: current, message: `IP ${cleanIp} is already whitelisted.` }
  }

  current.push(cleanIp)
  const updated = saveWhitelistedIps(current)
  return { success: true, ips: updated, message: `IP ${cleanIp} added to whitelist successfully.` }
}

export function removeWhitelistedIp(ip: string): { success: boolean; ips: string[]; message: string } {
  const cleanIp = ip.trim().replace(/^::ffff:/, '')
  if (!cleanIp) {
    return { success: false, ips: getWhitelistedIps(), message: 'Invalid IP address.' }
  }

  const current = getWhitelistedIps()
  const filtered = current.filter((item) => item.replace(/^::ffff:/, '') !== cleanIp)

  if (filtered.length === current.length) {
    return { success: false, ips: current, message: `IP ${cleanIp} not found in whitelist.` }
  }

  const updated = saveWhitelistedIps(filtered)
  return { success: true, ips: updated, message: `IP ${cleanIp} removed from whitelist successfully.` }
}

export function isIpAllowed(clientIp: string): boolean {
  const allowedList = getWhitelistedIps()

  // If no IPs are whitelisted, IP restriction is disabled (allow all)
  if (allowedList.length === 0) return true

  const normalizedClientIp = clientIp.replace(/^::ffff:/, '')

  return allowedList.some((allowedIp) => {
    const normalizedAllowed = allowedIp.replace(/^::ffff:/, '')
    if (normalizedAllowed === '*' || normalizedAllowed === 'all') return true
    if (normalizedAllowed === normalizedClientIp) return true
    if (normalizedAllowed.endsWith('*')) {
      const prefix = normalizedAllowed.slice(0, -1)
      return normalizedClientIp.startsWith(prefix)
    }
    return false
  })
}

