import type { NextFunction, Request, Response } from 'express'
import { prisma } from '../config/prisma.js'
import { verifyAccessToken } from '../utils/jwt.js'

/**
 * AuthRequest — request type where `user` may or may not be set.
 * Use for middleware that optionally reads user identity.
 */
export type AuthRequest = Request & {
  user?: { id: string; sessionId: string }
}

/**
 * AuthenticatedRequest — request type where `user` is guaranteed to be set.
 * Use in route handlers that are protected by `requireAuth`.
 * This avoids the need for `req.user!` non-null assertions everywhere.
 */
export type AuthenticatedRequest = Request & {
  user: { id: string; sessionId: string }
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.header('Authorization')
    const rawToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined

    if (!rawToken) return res.status(401).json({ code: 'AUTH_REQUIRED', message: 'Bearer token required.' })
    const payload = verifyAccessToken(rawToken)
    const session = await prisma.userSession.findUnique({ where: { id: payload.sid } })
    if (!session || session.revokedAt || session.expiresAt < new Date()) return res.status(401).json({ code: 'AUTH_SESSION_EXPIRED', message: 'Session expired.' })
    req.user = { id: payload.sub, sessionId: payload.sid }
    return next()
  } catch {
    return res.status(401).json({ code: 'AUTH_INVALID_TOKEN', message: 'Invalid token.' })
  }
}
