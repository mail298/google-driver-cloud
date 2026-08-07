import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'
import { prisma } from '../config/prisma.js'

let dbIpCache: { ips: string[]; timestamp: number } = { ips: [], timestamp: 0 }
const CACHE_TTL_MS = 15000

export async function getWhitelistedIps(): Promise<string[]> {
  const envIps = (env.ADMIN_ALLOWED_IPS || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean)

  const now = Date.now()
  if (now - dbIpCache.timestamp > CACHE_TTL_MS) {
    try {
      const records = await prisma.allowedIp.findMany({ select: { ip: true } })
      dbIpCache = {
        ips: records.map((r) => r.ip.trim()),
        timestamp: now,
      }
    } catch {
      // If DB read fails, fallback to cached or env IPs
    }
  }

  return Array.from(new Set([...envIps, ...dbIpCache.ips]))
}

export function invalidateIpCache() {
  dbIpCache.timestamp = 0
}

export async function ipWhitelistMiddleware(req: Request, res: Response, next: NextFunction) {
  const allowedIps = await getWhitelistedIps()

  // If no IPs are whitelisted in env or DB, IP restriction is disabled (allow all)
  if (allowedIps.length === 0) return next()

  // Extract client IP address accurately from headers or req.ip
  const xForwardedForHeader = req.header('x-forwarded-for')
  const xForwardedFor = Array.isArray(xForwardedForHeader) ? xForwardedForHeader[0] : xForwardedForHeader
  const cfConnectingIpHeader = req.header('cf-connecting-ip')
  const cfConnectingIp = Array.isArray(cfConnectingIpHeader) ? cfConnectingIpHeader[0] : cfConnectingIpHeader
  const clientIp = cfConnectingIp || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.ip) || ''

  // Clean IPv6 prefix (e.g. ::ffff:192.168.1.1 -> 192.168.1.1)
  const normalizedClientIp = clientIp.replace(/^::ffff:/, '')

  const isAllowed = allowedIps.some((allowedIp) => {
    const normalizedAllowed = allowedIp.replace(/^::ffff:/, '')
    if (normalizedAllowed === '*' || normalizedAllowed === 'all') return true
    if (normalizedAllowed === normalizedClientIp) return true
    // Subnet wildcard match (e.g. 103.44.55.*)
    if (normalizedAllowed.endsWith('*')) {
      const prefix = normalizedAllowed.slice(0, -1)
      return normalizedClientIp.startsWith(prefix)
    }
    return false
  })

  if (!isAllowed) {
    return res.status(403).json({
      code: 'IP_NOT_ALLOWED',
      message: `Access to dashboard API is restricted for IP address (${normalizedClientIp || 'unknown'}).`,
    })
  }

  return next()
}
