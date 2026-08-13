import { rateLimit } from 'express-rate-limit'

/**
 * Strict rate limit for auth endpoints (login, register).
 * Prevents brute-force and credential-stuffing attacks.
 * 10 requests per 15 minutes per IP.
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again in 15 minutes.',
  },
  skip: (req) => req.method === 'OPTIONS',
})

/**
 * Moderate rate limit for public API uploads (external API key uploads).
 * 60 requests per minute per IP.
 */
export const publicApiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many upload requests. Please slow down.',
  },
  skip: (req) => req.method === 'OPTIONS',
})

/**
 * General rate limit for all API routes.
 * 200 requests per minute per IP.
 */
export const generalRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please slow down.',
  },
  skip: (req) => req.method === 'OPTIONS',
})
