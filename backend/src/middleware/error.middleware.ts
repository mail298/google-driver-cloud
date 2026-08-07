import type { NextFunction, Request, Response } from 'express'
import { logError } from '../utils/logger.js'

export function errorMiddleware(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const status = (error as any)?.status || 500
  const entry = logError(req, error, status)

  return res.status(status).json({
    code: entry.code,
    message: entry.message,
    timestamp: entry.timestamp,
    errorId: entry.id
  })
}

