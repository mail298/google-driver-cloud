import type { NextFunction, Request, Response } from 'express'
import { isIpAllowed } from '../utils/ip-whitelist.store.js'

export function ipWhitelistMiddleware(req: Request, res: Response, next: NextFunction) {
  // Extract client IP address accurately from headers or req.ip
  const xForwardedForHeader = req.header('x-forwarded-for')
  const xForwardedFor = Array.isArray(xForwardedForHeader) ? xForwardedForHeader[0] : xForwardedForHeader
  const cfConnectingIpHeader = req.header('cf-connecting-ip')
  const cfConnectingIp = Array.isArray(cfConnectingIpHeader) ? cfConnectingIpHeader[0] : cfConnectingIpHeader
  const clientIp = cfConnectingIp || (xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.ip) || ''

  // Clean IPv6 prefix (e.g. ::ffff:192.168.1.1 -> 192.168.1.1)
  const normalizedClientIp = clientIp.replace(/^::ffff:/, '')

  if (!isIpAllowed(normalizedClientIp)) {
    return res.status(403).json({
      code: 'IP_NOT_ALLOWED',
      message: `Access to dashboard API is restricted for IP address (${normalizedClientIp || 'unknown'}).`,
    })
  }

  return next()
}

