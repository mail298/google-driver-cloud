import fs from 'fs'
import path from 'path'

const LOG_DIR = path.resolve(process.cwd(), 'logs')
const FILE_PATH = path.join(LOG_DIR, 'ip-blacklist.json')

function ensureDirExists() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
}

export type BannedIpEntry = {
  ip: string
  bannedAt: string
  reason: string
}

// In-memory cache for ultra-fast O(1) lookups without blocking the Node.js event loop
let bannedIpsCache: BannedIpEntry[] | null = null
let bannedIpSet = new Set<string>()

function initCache(): BannedIpEntry[] {
  if (bannedIpsCache !== null) {
    return bannedIpsCache
  }

  ensureDirExists()
  let loaded: BannedIpEntry[] = []

  if (!fs.existsSync(FILE_PATH)) {
    bannedIpsCache = []
    bannedIpSet = new Set()
    saveToDiskAsync([])
    return bannedIpsCache
  }

  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      loaded = parsed.filter((item) => item && typeof item.ip === 'string')
    }
  } catch (err) {
    console.error('[SECURITY] Error reading initial ip-blacklist.json:', err)
  }

  bannedIpsCache = loaded
  bannedIpSet = new Set(loaded.map((item) => item.ip.trim()))
  return bannedIpsCache
}

function saveToDiskAsync(list: BannedIpEntry[]) {
  ensureDirExists()
  fs.promises
    .writeFile(FILE_PATH, JSON.stringify(list, null, 2), 'utf-8')
    .catch((err) => console.error('[SECURITY] Failed to save IP Blacklist asynchronously:', err))
}

export function getBannedIps(): BannedIpEntry[] {
  return initCache()
}

export function saveBannedIps(ips: BannedIpEntry[]): BannedIpEntry[] {
  const uniqueMap = new Map<string, BannedIpEntry>()
  for (const item of ips) {
    const cleanIp = item.ip.trim().replace(/^::ffff:/, '')
    if (cleanIp && !uniqueMap.has(cleanIp)) {
      uniqueMap.set(cleanIp, {
        ...item,
        ip: cleanIp
      })
    }
  }
  const result = Array.from(uniqueMap.values())

  bannedIpsCache = result
  bannedIpSet = new Set(result.map((item) => item.ip))
  saveToDiskAsync(result)

  return result
}

export function isIpBanned(clientIp: string): boolean {
  const cleanIp = clientIp.trim().replace(/^::ffff:/, '')
  if (!cleanIp || cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') return false

  initCache()
  return bannedIpSet.has(cleanIp)
}

export function banIp(ip: string, reason = 'Malicious probe activity'): { success: boolean; list: BannedIpEntry[]; message: string } {
  const cleanIp = ip.trim().replace(/^::ffff:/, '')
  if (!cleanIp) {
    return { success: false, list: getBannedIps(), message: 'Invalid IP address.' }
  }

  // Prevent banning localhost / loopback
  if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') {
    return { success: false, list: getBannedIps(), message: 'Cannot ban localhost/loopback IP.' }
  }

  initCache()
  if (bannedIpSet.has(cleanIp)) {
    return { success: true, list: bannedIpsCache!, message: `IP ${cleanIp} is already banned.` }
  }

  const newEntry: BannedIpEntry = {
    ip: cleanIp,
    bannedAt: new Date().toISOString(),
    reason
  }

  const current = [...(bannedIpsCache || [])]
  current.push(newEntry)
  const updated = saveBannedIps(current)

  console.log(`[SECURITY] IP ${cleanIp} has been added to the blacklist. Reason: ${reason}`)
  return { success: true, list: updated, message: `IP ${cleanIp} banned successfully.` }
}

export function unbanIp(ip: string): { success: boolean; list: BannedIpEntry[]; message: string } {
  const cleanIp = ip.trim().replace(/^::ffff:/, '')
  if (!cleanIp) {
    return { success: false, list: getBannedIps(), message: 'Invalid IP address.' }
  }

  initCache()
  if (!bannedIpSet.has(cleanIp)) {
    return { success: false, list: bannedIpsCache!, message: `IP ${cleanIp} is not in the ban list.` }
  }

  const current = (bannedIpsCache || []).filter((item) => item.ip !== cleanIp)
  const updated = saveBannedIps(current)

  console.log(`[SECURITY] IP ${cleanIp} has been unbanned.`)
  return { success: true, list: updated, message: `IP ${cleanIp} unbanned successfully.` }
}

