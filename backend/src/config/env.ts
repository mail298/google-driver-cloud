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
  DATABASE_URL: z.string().min(1).default('mysql://root:root@mysql:3306/9drive'),
  APP_PORT: z.coerce.number().default(80),
  FRONTEND_URL: z.string().default('https://drive9.wn-cdn.net'),
  JWT_ACCESS_SECRET: z.string().min(32).default('change-this-jwt-secret-at-least-32-chars-long-string-for-safe-build'),
  TOKEN_ENCRYPTION_KEY: z.string().min(32).default('uf2Tqd29Y6l2RFhM9xLQ0bvmfRjyroxjQI2HRsQH3rdjdE1SgvVvMjkwZJxlXrMb'),
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
})

const getEnv = () => {
  const parsed = envSchema.safeParse(process.env)
  if (parsed.success) {
    return parsed.data
  }
  return {
    DATABASE_URL: (process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0) ? process.env.DATABASE_URL : 'mysql://root:root@mysql:3306/9drive',
    APP_PORT: Number(process.env.APP_PORT) || 80,
    FRONTEND_URL: process.env.FRONTEND_URL || 'https://drive9.wn-cdn.net',
    JWT_ACCESS_SECRET: (process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET.length >= 32) ? process.env.JWT_ACCESS_SECRET : 'change-this-jwt-secret-at-least-32-chars-long-string-for-safe-build',
    TOKEN_ENCRYPTION_KEY: (process.env.TOKEN_ENCRYPTION_KEY && process.env.TOKEN_ENCRYPTION_KEY.length >= 32) ? process.env.TOKEN_ENCRYPTION_KEY : 'uf2Tqd29Y6l2RFhM9xLQ0bvmfRjyroxjQI2HRsQH3rdjdE1SgvVvMjkwZJxlXrMb',
    ACCESS_TOKEN_TTL_SECONDS: Number(process.env.ACCESS_TOKEN_TTL_SECONDS) || 3600,
    REFRESH_TOKEN_TTL_DAYS: Number(process.env.REFRESH_TOKEN_TTL_DAYS) || 30,
    MAX_UPLOAD_BYTES: Number(process.env.MAX_UPLOAD_BYTES) || 5 * 1024 * 1024 * 1024,
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
    ADMIN_ALLOWED_IPS: process.env.ADMIN_ALLOWED_IPS,
    IP_WHITELIST_SECRET_KEY: process.env.IP_WHITELIST_SECRET_KEY,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    HTTP_PROXY: process.env.HTTP_PROXY,
    HTTPS_PROXY: process.env.HTTPS_PROXY,
    GLOBAL_PROXY_URL: process.env.GLOBAL_PROXY_URL,
    CDN_SUBDOMAINS: process.env.CDN_SUBDOMAINS,
  }
}

export const env = getEnv()

