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
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #030712; color: #f8fafc; margin: 0; padding: 24px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #0f172a; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
    <tr>
      <td style="padding: 32px 32px 16px; text-align: center; background: linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(99,102,241,0.15) 100%);">
        <div style="display: inline-block; width: 48px; height: 48px; background-color: #2563eb; border-radius: 14px; line-height: 48px; text-align: center; color: #ffffff; font-size: 24px; font-weight: bold; margin-bottom: 12px;">
          ⚡
        </div>
        <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 4px; letter-spacing: -0.02em;">Permintaan Reset Password</h1>
        <p style="font-size: 13px; color: #94a3b8; margin: 0;">Drive9 Cloud Storage Gateway</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 28px 32px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
        <p style="margin-top: 0;">Halo <strong style="color: #f8fafc;">${userName}</strong>,</p>
        <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Drive9 Anda. Klik tombol di bawah ini untuk membuat kata sandi baru:</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 14px 28px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);">
            Reset Password Sekarang →
          </a>
        </div>

        <div style="background-color: #1e293b; border-radius: 12px; padding: 14px; margin-bottom: 20px; font-size: 12px; color: #94a3b8; border: 1px solid #334155;">
          <strong style="color: #fbbf24;">⚠️ Penting:</strong> Tautan ini hanya berlaku selama <strong>15 menit</strong> dan hanya dapat digunakan <strong>1 kali</strong>.
        </div>

        <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">Jika tombol di atas tidak berfungsi, salin dan tempel URL berikut ke browser Anda:</p>
        <p style="font-size: 11px; word-break: break-all; color: #38bdf8; background-color: #0b1329; padding: 10px; border-radius: 8px; border: 1px solid #1e293b; margin: 0;">
          ${resetUrl}
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px 32px; background-color: #0b1120; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b; text-align: center;">
        <p style="margin: 0 0 6px;">Jika Anda tidak merasa meminta reset kata sandi, abaikan email ini dengan aman. Akun Anda tetap terlindungi.</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} Drive9. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>
`

  try {
    await mailer.sendMail({
      from: env.SMTP_FROM,
      to: email,
      subject: '🔐 Reset Password Akun Drive9 Anda',
      html,
    })
    return true
  } catch (error) {
    console.error('[MAIL] Failed to send password reset email:', error)
    return false
  }
}
