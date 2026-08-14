import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE ?? env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  }
  return transporter
}

export async function sendPasswordResetEmail(email: string, userName: string, resetToken: string): Promise<boolean> {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`
  const mailer = getTransporter()

  if (!mailer) {
    console.warn(`[MAIL] SMTP is not configured. Reset link for ${email}: ${resetUrl}`)
    return false
  }

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password Drive9</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; color: #1f2937; margin: 0; padding: 24px; line-height: 1.6; font-size: 15px;">
  <div style="max-width: 540px; margin: 0 auto;">
    <p style="margin: 0 0 16px;">Halo <strong>${userName}</strong>,</p>
    
    <p style="margin: 0 0 16px;">Kami menerima permintaan untuk mengatur ulang kata sandi akun Drive9 Anda. Silakan klik tautan di bawah ini untuk membuat kata sandi baru:</p>
    
    <div style="margin: 24px 0;">
      <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 10px 20px; border-radius: 6px;">
        Reset Password
      </a>
    </div>

    <p style="margin: 0 0 12px; font-size: 13px; color: #4b5563;">
      Jika tombol di atas tidak berfungsi, salin dan tempel URL berikut ke browser Anda:<br>
      <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
    </p>

    <p style="margin: 24px 0 0; font-size: 13px; color: #6b7280;">
      Tautan ini hanya berlaku selama 15 menit dan hanya dapat digunakan 1 kali.<br>
      Jika Anda tidak meminta reset kata sandi, abaikan email ini dengan aman.
    </p>

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
      Drive9 Cloud Storage Gateway
    </div>
  </div>
</body>
</html>
`

  const text = `Halo ${userName},

Kami menerima permintaan untuk mengatur ulang kata sandi akun Drive9 Anda.
Silakan buka tautan berikut untuk membuat kata sandi baru:

${resetUrl}

Penting: Tautan ini hanya berlaku selama 15 menit dan hanya dapat digunakan 1 kali.
Jika Anda tidak meminta reset kata sandi, abaikan email ini.

Drive9 Cloud Storage Gateway
`

  try {
    await mailer.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: 'Reset Password Akun Drive9',
      text,
      html,
      headers: {
        'X-Entity-Ref-ID': resetToken,
      },
    })
    return true
  } catch (error) {
    console.error('[MAIL] Failed to send password reset email:', error)
    return false
  }
}
