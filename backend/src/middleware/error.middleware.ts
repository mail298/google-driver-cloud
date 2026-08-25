import type { NextFunction, Request, Response } from 'express'
import { logError } from '../utils/logger.js'
import { notifyServerError } from '../services/telegram.service.js'

export function errorMiddleware(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const status = (error as any)?.status || 500
  const entry = logError(req, error, status)

  // Send real-time error alert notification to Telegram (only for server errors >= 500)
  if (status >= 500) {
    notifyServerError(entry).catch(() => undefined)
  }

  return res.status(status).json({
    code: entry.code,
    message: entry.message,
    timestamp: entry.timestamp,
    errorId: entry.id
  })
}

