import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'

export function ipWhitelistMiddleware(req: Request, res: Response, next: NextFunction) {
  const allowedIpsRaw = env.ADMIN_ALLOWED_IPS
  if (!allowedIpsRaw || allowedIpsRaw.trim() === '') return next()

  const allowedIps = allowedIpsRaw
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean)

  if (allowedIps.length === 0) return next()

  // Extract client IP address accurately from headers or req.ip
  const xForwardedFor = req.header('x-forwarded-for')
  const cfConnectingIp = req.header('cf-connecting-ip')
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
