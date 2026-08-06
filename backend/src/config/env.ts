import dotenv from 'dotenv'
import path from 'node:path'
import { z } from 'zod'

dotenv.config({ path: path.resolve(process.cwd(), '../.env') })
dotenv.config()

if (!process.env.DATABASE_URL && (process.env.DB_HOST || process.env.DB_NAME)) {
  const host = process.env.DB_HOST || 'localhost'
  const port = process.env.DB_PORT || '3306'
  const user = process.env.DB_USER || 'root'
  const pass = process.env.DB_PASS || ''
  const dbName = process.env.DB_NAME || '9drive'
  const passPart = pass ? `:${encodeURIComponent(pass)}` : ''
  process.env.DATABASE_URL = `mysql://${user}${passPart}@${host}:${port}/${dbName}`
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().min(32).default('change-this-jwt-secret-at-least-32-chars'),
  TOKEN_ENCRYPTION_KEY: z.string().min(32).default('change-this-encryption-key-32bytes!'),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  MAX_UPLOAD_BYTES: z.coerce.number().default(5 * 1024 * 1024 * 1024),
  RECAPTCHA_SECRET_KEY: z.string().optional(),
})

export const env = envSchema.parse(process.env)

