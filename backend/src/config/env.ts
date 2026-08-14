import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { z } from 'zod'

// Load .env from project root or backend directory, whichever exists first.
if (fs.existsSync(path.resolve(process.cwd(), '.env'))) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })
} else if (fs.existsSync(path.resolve(process.cwd(), '../.env'))) {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') })
} else {
  dotenv.config()
}

// ---------------------------------------------------------------------------
// Default fallback secrets — used only when env vars are not set.
// These are PUBLIC DEFAULTS and exist solely so the server can start in a
// zero-config local dev environment. A security warning is printed below.
// DO NOT use these defaults in production.
// ---------------------------------------------------------------------------
const DEFAULT_JWT_SECRET = '$2a$10$3OOX0YLB52DERef3Q/jn9ei0zTME0ieZrcYQ4mflZ.BPgTMszTgsq'
const DEFAULT_ENCRYPTION_KEY = 'uf2Tqd29Y6l2RFhM9xLQ0bvmfRjyroxjQI2HRsQH3rdjdE1SgvVvMjkwZJxlXrMb'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default('mysql://root:root@mysql:3306/9drive'),
  APP_PORT: z.coerce.number().default(80),
  FRONTEND_URL: z.string().default('https://Drive9.wn-cdn.net'),
  JWT_ACCESS_SECRET: z.string().min(32).default(DEFAULT_JWT_SECRET),
  TOKEN_ENCRYPTION_KEY: z.string().min(32).default(DEFAULT_ENCRYPTION_KEY),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(3600),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  MAX_UPLOAD_BYTES: z.coerce.number().default(5 * 1024 * 1024 * 1024),
  RECAPTCHA_SECRET_KEY: z.string().optional(),
  ADMIN_ALLOWED_IPS: z.string().optional(),
  IP_WHITELIST_SECRET_KEY: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),
  HTTP_PROXY: z.string().optional(),
  HTTPS_PROXY: z.string().optional(),
  GLOBAL_PROXY_URL: z.string().optional(),
  CDN_SUBDOMAINS: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.string().transform((v) => v === 'true' || v === '1').optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('Drive9 Storage <no-reply@drive9.wn-cdn.net>'),
})

// Parse and export — Zod handles all defaults and coercions in one place.
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('[ENV] Environment validation failed:', parsed.error.format())
  process.exit(1)
}

export const env = parsed.data

// ---------------------------------------------------------------------------
// Security warnings — printed at startup so operators know if defaults are
// still in use. These do not stop the server, but are loud enough to notice.
// ---------------------------------------------------------------------------
if (env.JWT_ACCESS_SECRET === DEFAULT_JWT_SECRET) {
  console.warn(
    '[SECURITY WARNING] JWT_ACCESS_SECRET is using the hardcoded default value.\n' +
    '                   Set a unique secret in your .env file before going to production!'
  )
}
if (env.TOKEN_ENCRYPTION_KEY === DEFAULT_ENCRYPTION_KEY) {
  console.warn(
    '[SECURITY WARNING] TOKEN_ENCRYPTION_KEY is using the hardcoded default value.\n' +
    '                   Set a unique key in your .env file before going to production!'
  )
}
