import type { Request } from 'express'

/**
 * Extracts the real client IP address from request headers.
 * Priority: Cloudflare CF-Connecting-IP → X-Forwarded-For → Express req.ip
 */
export function getClientIp(req: Request): string {
  const cfIp = req.header('cf-connecting-ip')
  if (cfIp) return String(cfIp).trim()
  const xForwarded = req.header('x-forwarded-for')
  if (xForwarded) return String(xForwarded).split(',')[0].trim()
  return String(req.ip || 'unknown').trim()
}
