import type { NextFunction, Request, Response } from 'express'
import { getClientIp } from '../utils/ip.js'
import { banIp, isIpBanned } from '../utils/ip-blacklist.store.js'
import { detectAttackPattern } from '../utils/security-rules.js'
import { notifySecurityAttack } from '../services/telegram.service.js'

/**
 * Early-stage security middleware (Mini WAF / Intrusion Detector)
 * 1. Blocks any IP that has been blacklisted.
 * 2. Catches common scanner probes (WordPress, .env, phpMyAdmin, path traversal, RCE)
 *    and automatically bans the IP, sends Telegram alert, and terminates with 403 Forbidden.
 */
export function attackDetectorMiddleware(req: Request, res: Response, next: NextFunction) {
  const clientIp = getClientIp(req)

  // 1. Check if client IP is currently banned
  if (isIpBanned(clientIp)) {
    return res.status(403).json({
      code: 'IP_BANNED',
      message: 'Access denied: Your IP address has been banned.'
    })
  }

  // 2. Check for known scanner / exploit attack patterns
  const detected = detectAttackPattern(req)
  if (detected) {
    const userAgent = req.header('user-agent') || 'unknown'
    const originalPath = req.originalUrl || req.url

    // Auto-ban malicious scanner IP if probe pattern warrants immediate ban
    let autoBanned = false
    if (detected.autoBan) {
      const banResult = banIp(clientIp, `Auto-ban: ${detected.type} on ${originalPath}`)
      autoBanned = banResult.success
    }

    console.warn(
      `[SECURITY_PROBE_BLOCKED] Type: "${detected.type}" | Target: ${req.method} ${originalPath} | IP: ${clientIp} | AutoBanned: ${autoBanned} | UA: ${userAgent}`
    )

    // Notify Telegram with built-in anti-spam throttling
    notifySecurityAttack({
      type: detected.type,
      method: req.method,
      path: originalPath,
      ip: clientIp,
      userAgent,
      status: 403,
      autoBanned,
      timestamp: new Date().toISOString()
    }).catch(() => undefined)

    return res.status(403).json({
      code: 'SECURITY_PROBE_BLOCKED',
      message: autoBanned
        ? 'Access denied: Malicious probe detected. Your IP has been banned.'
        : 'Access denied: Malicious or probe pattern detected.'
    })
  }

  return next()
}

