import fs from 'fs'
import path from 'path'
import type { Request } from 'express'

export type ErrorLogEntry = {
  id: string
  timestamp: string
  method: string
  path: string
  ip: string
  status: number
  code: string
  message: string
  stack?: string
}

const LOG_DIR = path.resolve(process.cwd(), 'logs')
const LOG_FILE = path.join(LOG_DIR, 'error-log.json')
const MAX_LOG_ENTRIES = 500

function ensureLogDirExists() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }
}

export function getErrorLogs(): ErrorLogEntry[] {
  ensureLogDirExists()
  if (!fs.existsSync(LOG_FILE)) return []
  try {
    const raw = fs.readFileSync(LOG_FILE, 'utf-8')
    return JSON.parse(raw) as ErrorLogEntry[]
  } catch {
    return []
  }
}

export function clearErrorLogs(): void {
  ensureLogDirExists()
  fs.writeFileSync(LOG_FILE, JSON.stringify([], null, 2), 'utf-8')
}

export function logError(req: Request, error: unknown, status = 500): ErrorLogEntry {
  ensureLogDirExists()

  const errObj = error instanceof Error ? error : new Error(String(error))
  const message = errObj.message || 'Internal server error'
  const code = (error as any)?.code || 'INTERNAL_SERVER_ERROR'

  const entry: ErrorLogEntry = {
    id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip || req.socket?.remoteAddress || 'unknown',
    status,
    code,
    message,
    stack: process.env.NODE_ENV !== 'production' ? errObj.stack : errObj.stack?.split('\n')[0]
  }

  // Console output formatted JSON
  console.error('[ERROR_LOG_JSON]', JSON.stringify(entry, null, 2))

  // Persist to JSON file
  try {
    const existing = getErrorLogs()
    existing.unshift(entry)
    const trimmed = existing.slice(0, MAX_LOG_ENTRIES)
    fs.writeFileSync(LOG_FILE, JSON.stringify(trimmed, null, 2), 'utf-8')
  } catch (fsErr) {
    console.error('Failed to write JSON error log file:', fsErr)
  }

  return entry
}
