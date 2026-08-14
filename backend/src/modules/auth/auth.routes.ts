import { Router } from 'express'
import { google } from 'googleapis'
import { z } from 'zod'
import { prisma } from '../../config/prisma.js'
import { env } from '../../config/env.js'
import { requireAuth, type AuthRequest, type AuthenticatedRequest } from '../../middleware/auth.middleware.js'
import { hashPassword, verifyPassword } from '../../utils/password.js'
import { encryptText, hashToken, randomToken } from '../../utils/crypto.js'
import { signAccessToken } from '../../utils/jwt.js'
import { createOAuthClient, syncGoogleQuota } from '../google/google.service.js'
import { notifyUserLogin, notifyUserRegistration } from '../../services/telegram.service.js'
import { sendPasswordResetEmail } from '../../services/mail.service.js'
import { getClientIp } from '../../utils/ip.js'

export const authRouter = Router()

const registerSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8), captchaToken: z.string().optional() })
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })
const refreshSchema = z.object({ refreshToken: z.string().min(1) })
const googleExchangeSchema = z.object({ token: z.string().min(1) })
const forgotPasswordSchema = z.object({ email: z.string().email(), captchaToken: z.string().optional() })
const verifyResetTokenSchema = z.object({ token: z.string().min(1) })
const resetPasswordSchema = z.object({ token: z.string().min(1), password: z.string().min(8) })

async function createSession(userId: string, req: AuthRequest) {
  const refreshToken = randomToken()
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000)
  const session = await prisma.userSession.create({
    data: {
      userId,
      refreshTokenHash: hashToken(refreshToken),
      userAgent: req.header('User-Agent'),
      ipAddress: req.ip,
      expiresAt,
    },
  })
  return { accessToken: signAccessToken({ sub: userId, sid: session.id }), refreshToken }
}

async function verifyCaptcha(token: string | undefined) {
  if (!env.RECAPTCHA_SECRET_KEY) return true
  if (!token) return false
  const form = new URLSearchParams({ secret: env.RECAPTCHA_SECRET_KEY, response: token })
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'POST', body: form })
  const data = await response.json() as { success?: boolean; 'error-codes'?: string[] }
  if (!data.success) {
    console.error('[RECAPTCHA] Verification failed:', data['error-codes'] || data)
  }
  return Boolean(data.success)
}



authRouter.post('/register', async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body)
    if (!(await verifyCaptcha(body.captchaToken))) return res.status(400).json({ code: 'CAPTCHA_FAILED', message: 'Captcha verification failed.' })
    const existing = await prisma.user.findUnique({ where: { email: body.email } })
    if (existing) return res.status(409).json({ code: 'AUTH_EMAIL_TAKEN', message: 'Email already registered.' })
    const user = await prisma.user.create({ data: { name: body.name, email: body.email, passwordHash: await hashPassword(body.password) } })
    const tokens = await createSession(user.id, req)
    const clientIp = getClientIp(req)
    notifyUserRegistration(user, clientIp, 'Email & Password').catch((err) => console.error('[TELEGRAM] Register notify error:', err))
    return res.status(201).json({ ...tokens, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    return next(error)
  }
})

authRouter.post('/login', async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user || !(await verifyPassword(user.passwordHash, body.password))) return res.status(401).json({ code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid email or password.' })
    const tokens = await createSession(user.id, req)
    const clientIp = getClientIp(req)
    notifyUserLogin(user, clientIp, 'Email & Password').catch((err) => console.error('[TELEGRAM] Login notify error:', err))
    return res.json({ ...tokens, user: { id: user.id, name: user.name, email: user.email } })
  } catch (error) {
    return next(error)
  }
})

authRouter.get('/google/url', async (_req, res, next) => {
  try {
    const config = await prisma.providerConfig.findFirstOrThrow({ where: { userId: null, provider: 'google_drive', status: 'active' }, orderBy: { createdAt: 'desc' } })
    const state = randomToken()
    await prisma.oauthState.create({ data: { providerConfigId: config.id, flow: 'login', stateHash: hashToken(state), expiresAt: new Date(Date.now() + 10 * 60_000) } })
    const client = createOAuthClient(config)
    const url = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: true,
      scope: ['openid', 'email', 'profile'],
      state,
    })
    return res.json({ url })
  } catch (error) {
    return next(error)
  }
})

authRouter.get('/google/callback', async (req, res) => {
  try {
    const query = z.object({ code: z.string(), state: z.string() }).parse(req.query)
    const oauthState = await prisma.oauthState.findUniqueOrThrow({ where: { stateHash: hashToken(query.state) }, include: { providerConfig: true } })
    if (oauthState.flow !== 'login' || oauthState.usedAt || oauthState.expiresAt < new Date()) return res.redirect(`${env.FRONTEND_URL}/google-auth?status=error`)

    const client = createOAuthClient(oauthState.providerConfig)
    const tokenResult = await client.getToken(query.code)
    const tokens = tokenResult.tokens
    if (!tokens.access_token) return res.redirect(`${env.FRONTEND_URL}/google-auth?status=error`)
    client.setCredentials(tokens)

    const oauth2 = google.oauth2({ version: 'v2', auth: client })
    const profile = await oauth2.userinfo.get()
    const providerAccountId = profile.data.id
    const email = profile.data.email
    if (!providerAccountId || !email) return res.redirect(`${env.FRONTEND_URL}/google-auth?status=error`)

    const name = profile.data.name || email.split('@')[0] || 'Google User'
    const existingUserBefore = await prisma.user.findUnique({ where: { email } })
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, name, passwordHash: '!google_oauth_no_password' },
      update: { name },
    })
    const clientIp = getClientIp(req)
    if (!existingUserBefore) {
      notifyUserRegistration(user, clientIp, 'Google OAuth').catch((err) => console.error('[TELEGRAM] Google reg notify error:', err))
    }
    const existingAccount = await prisma.connectedAccount.findUnique({ where: { userId_provider_providerAccountId: { userId: user.id, provider: 'google_drive', providerAccountId } } })
    const refreshTokenEncrypted = tokens.refresh_token
      ? encryptText(tokens.refresh_token)
      : (existingAccount?.refreshTokenEncrypted ?? (tokens.access_token ? encryptText(tokens.access_token) : null))
    if (!refreshTokenEncrypted) return res.redirect(`${env.FRONTEND_URL}/google-auth?status=error`)

    const account = await prisma.connectedAccount.upsert({
      where: { userId_provider_providerAccountId: { userId: user.id, provider: 'google_drive', providerAccountId } },
      create: {
        userId: user.id,
        providerConfigId: oauthState.providerConfigId,
        provider: 'google_drive',
        providerAccountId,
        email,
        displayName: profile.data.name,
        avatarUrl: profile.data.picture,
        accessTokenEncrypted: encryptText(tokens.access_token),
        refreshTokenEncrypted,
        tokenExpiresAt: new Date(tokens.expiry_date ?? Date.now() + 3600_000),
        scopes: oauthState.providerConfig.scopes as string[],
        status: 'connected',
      },
      update: {
        providerConfigId: oauthState.providerConfigId,
        email,
        displayName: profile.data.name,
        avatarUrl: profile.data.picture,
        accessTokenEncrypted: encryptText(tokens.access_token),
        refreshTokenEncrypted,
        tokenExpiresAt: new Date(tokens.expiry_date ?? Date.now() + 3600_000),
        scopes: oauthState.providerConfig.scopes as string[],
        status: 'connected',
      },
    })

    await prisma.oauthState.update({ where: { id: oauthState.id }, data: { usedAt: new Date(), userId: user.id } })
    await syncGoogleQuota(account.id).catch(() => undefined)

    const handoffToken = randomToken()
    await prisma.authHandoff.create({ data: { userId: user.id, tokenHash: hashToken(handoffToken), expiresAt: new Date(Date.now() + 5 * 60_000) } })
    return res.redirect(`${env.FRONTEND_URL}/google-auth?token=${handoffToken}`)
  } catch (error) {
    console.error('Google Auth callback failed:', error)
    return res.redirect(`${env.FRONTEND_URL}/google-auth?status=error`)
  }
})

authRouter.post('/google/exchange', async (req, res, next) => {
  try {
    const body = googleExchangeSchema.parse(req.body)
    const handoff = await prisma.authHandoff.findFirst({ where: { tokenHash: hashToken(body.token), usedAt: null, expiresAt: { gt: new Date() } }, include: { user: true } })
    if (!handoff) return res.status(401).json({ code: 'AUTH_GOOGLE_HANDOFF_INVALID', message: 'Google login session expired.' })
    await prisma.authHandoff.update({ where: { id: handoff.id }, data: { usedAt: new Date() } })
    const tokens = await createSession(handoff.userId, req)
    const clientIp = getClientIp(req)
    notifyUserLogin(handoff.user, clientIp, 'Google OAuth').catch((err) => console.error('[TELEGRAM] Google exchange notify error:', err))
    return res.json({ ...tokens, user: { id: handoff.user.id, name: handoff.user.name, email: handoff.user.email } })
  } catch (error) {
    return next(error)
  }
})

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const body = refreshSchema.parse(req.body)
    const session = await prisma.userSession.findFirst({ where: { refreshTokenHash: hashToken(body.refreshToken), revokedAt: null, expiresAt: { gt: new Date() } } })
    if (!session) return res.status(401).json({ code: 'AUTH_SESSION_EXPIRED', message: 'Refresh token expired.' })
    return res.json({ accessToken: signAccessToken({ sub: session.userId, sid: session.id }) })
  } catch (error) {
    return next(error)
  }
})

authRouter.post('/logout', requireAuth, async (req, res, next) => {
  const authReq = req as AuthenticatedRequest
  try {
    await prisma.userSession.update({ where: { id: authReq.user.sessionId }, data: { revokedAt: new Date() } })
    return res.json({ status: 'ok' })
  } catch (error) {
    return next(error)
  }
})

authRouter.get('/me', requireAuth, async (req, res, next) => {
  const authReq = req as AuthenticatedRequest
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: authReq.user.id }, select: { id: true, name: true, email: true, status: true } })
    return res.json({ user })
  } catch (error) {
    return next(error)
  }
})

const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long.'),
})

authRouter.post('/change-password', requireAuth, async (req, res, next) => {
  const authReq = req as AuthenticatedRequest
  try {
    const body = changePasswordSchema.parse(req.body)
    const user = await prisma.user.findUniqueOrThrow({ where: { id: authReq.user.id } })

    const isGoogleUnset = user.passwordHash === '!google_oauth_no_password'

    if (body.currentPassword) {
      // User provided currentPassword — verify it against passwordHash (if not initial google unset)
      if (!isGoogleUnset) {
        const isValid = await verifyPassword(user.passwordHash, body.currentPassword)
        if (!isValid) {
          return res.status(400).json({ code: 'AUTH_INVALID_CURRENT_PASSWORD', message: 'Current password does not match.' })
        }
      }
    } else {
      // User did NOT provide currentPassword
      // If the account already has a password set (not Google unset), currentPassword is REQUIRED!
      if (!isGoogleUnset) {
        return res.status(400).json({ code: 'AUTH_CURRENT_PASSWORD_REQUIRED', message: 'Current password is required to update your password.' })
      }
    }

    const newPasswordHash = await hashPassword(body.newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newPasswordHash } })

    return res.json({ status: 'ok', message: 'Password updated successfully.' })
  } catch (error) {
    return next(error)
  }
})

authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const body = forgotPasswordSchema.parse(req.body)
    if (body.captchaToken && !(await verifyCaptcha(body.captchaToken))) {
      return res.status(400).json({ code: 'CAPTCHA_FAILED', message: 'Captcha verification failed.' })
    }

    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (user) {
      const rawToken = randomToken(32)
      const tokenHash = hashToken(rawToken)
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes TTL

      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      })

      // Send email in background (non-blocking for fast UI response)
      sendPasswordResetEmail(user.email, user.name, rawToken).catch((err) => {
        console.error('[MAIL] Error in sendPasswordResetEmail:', err)
      })
    }

    // Always return generic success to prevent email enumeration
    return res.json({
      status: 'ok',
      message: 'Jika email terdaftar, tautan pengaturan ulang kata sandi telah dikirim ke email Anda.',
    })
  } catch (error) {
    return next(error)
  }
})

authRouter.post('/verify-reset-token', async (req, res, next) => {
  try {
    const body = verifyResetTokenSchema.parse(req.body)
    const tokenHash = hashToken(body.token)

    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { select: { email: true, name: true } },
      },
    })

    if (!resetRecord) {
      return res.status(400).json({
        code: 'RESET_TOKEN_INVALID',
        message: 'Tautan reset password tidak valid atau sudah kedaluwarsa.',
      })
    }

    return res.json({
      valid: true,
      email: resetRecord.user.email,
      name: resetRecord.user.name,
    })
  } catch (error) {
    return next(error)
  }
})

authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const body = resetPasswordSchema.parse(req.body)
    const tokenHash = hashToken(body.token)

    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    })

    if (!resetRecord) {
      return res.status(400).json({
        code: 'RESET_TOKEN_INVALID',
        message: 'Tautan reset password tidak valid atau sudah kedaluwarsa.',
      })
    }

    // Mark reset token as used (single-use enforcement)
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    })

    // Hash new password using Argon2
    const newPasswordHash = await hashPassword(body.password)

    // Update user password and revoke all active sessions for security
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash: newPasswordHash },
    })

    await prisma.userSession.updateMany({
      where: { userId: resetRecord.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    return res.json({
      status: 'ok',
      message: 'Kata sandi berhasil diperbarui. Silakan login kembali.',
    })
  } catch (error) {
    return next(error)
  }
})

