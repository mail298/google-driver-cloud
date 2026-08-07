import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { z } from 'zod'

if (fs.existsSync(path.resolve(process.cwd(), '.env'))) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') })
} else if (fs.existsSync(path.resolve(process.cwd(), '../.env'))) {
  dotenv.config({ path: path.resolve(process.cwd(), '../.env') })
} else {
  dotenv.config()
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  TOKEN_ENCRYPTION_KEY: z.string().min(32),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(900),
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
  CDN_SUBDOMAINS: z.string().optional(), // comma-separated CDN origins e.g. https://cdn1.ikan212.com,https://cdn2.ikan212.com
})

export const env = envSchema.parse(process.env)

