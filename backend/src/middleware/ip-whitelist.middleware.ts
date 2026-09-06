import type { NextFunction, Request, Response } from 'express'
import { getClientIp } from '../utils/ip.js'
import { isIpAllowed } from '../utils/ip-whitelist.store.js'

export function ipWhitelistMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIp = getClientIp(req)
  const normalizedClientIp = clientIp.replace(/^::ffff:/, '')

  if (!isIpAllowed(normalizedClientIp)) {
    return res.status(403).json({
      code: 'IP_NOT_ALLOWED',
      message: `Access to dashboard API is restricted for IP address (${normalizedClientIp || 'unknown'}).`,
    })
  }

  return next()
}


