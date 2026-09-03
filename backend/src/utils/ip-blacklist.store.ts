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

export function getBannedIps(): BannedIpEntry[] {
  ensureDirExists()
  if (!fs.existsSync(FILE_PATH)) {
    return []
  }

  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8')
    const list = JSON.parse(raw)
    if (Array.isArray(list)) {
      return list.filter((item) => item && typeof item.ip === 'string')
    }
    return []
  } catch {
    return []
  }
}

export function saveBannedIps(ips: BannedIpEntry[]): BannedIpEntry[] {
  ensureDirExists()
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
  try {
    fs.writeFileSync(FILE_PATH, JSON.stringify(result, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to save IP Blacklist file:', err)
  }
  return result
}

export function isIpBanned(clientIp: string): boolean {
  const cleanIp = clientIp.trim().replace(/^::ffff:/, '')
  if (!cleanIp || cleanIp === '127.0.0.1' || cleanIp === '::1') return false

  const list = getBannedIps()
  return list.some((entry) => entry.ip === cleanIp)
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

  const current = getBannedIps()
  const existing = current.find((item) => item.ip === cleanIp)
  if (existing) {
    return { success: true, list: current, message: `IP ${cleanIp} is already banned.` }
  }

  const newEntry: BannedIpEntry = {
    ip: cleanIp,
    bannedAt: new Date().toISOString(),
    reason
  }
  current.push(newEntry)
  const updated = saveBannedIps(current)
  return { success: true, list: updated, message: `IP ${cleanIp} banned successfully.` }
}

export function unbanIp(ip: string): { success: boolean; list: BannedIpEntry[]; message: string } {
  const cleanIp = ip.trim().replace(/^::ffff:/, '')
  if (!cleanIp) {
    return { success: false, list: getBannedIps(), message: 'Invalid IP address.' }
  }

  const current = getBannedIps()
  const filtered = current.filter((item) => item.ip !== cleanIp)
  if (filtered.length === current.length) {
    return { success: false, list: current, message: `IP ${cleanIp} is not in the ban list.` }
  }

  const updated = saveBannedIps(filtered)
  return { success: true, list: updated, message: `IP ${cleanIp} unbanned successfully.` }
}
