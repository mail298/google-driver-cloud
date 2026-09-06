import { env } from '../config/env.js'
import { prisma } from '../config/prisma.js'

export async function sendTelegramNotification(text: string) {
  const botToken = env.TELEGRAM_BOT_TOKEN
  const chatId = env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn(`[TELEGRAM] Cannot send notification. Missing config -> TELEGRAM_BOT_TOKEN: ${Boolean(botToken)}, TELEGRAM_CHAT_ID: ${Boolean(chatId)}`)
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    })
    if (!res.ok) {
      const errText = await res.text()
      console.error(`[TELEGRAM] Failed to send notification (status ${res.status}): ${errText}`)
      return false
    }
    console.log(`[TELEGRAM] Notification successfully sent to chat_id ${chatId}`)
    return true
  } catch (err) {
    console.error('[TELEGRAM] Failed to send Telegram notification:', err)
    return false
  }
}

export async function notifyUserRegistration(user: { id: string; name?: string; email: string }, ip = 'unknown', method = 'Email') {
  try {
    const cleanIp = String(ip || 'unknown').trim()
    const message = [
      `👤 <b>New User Registered!</b>`,
      `📧 <b>Email:</b> <code>${escapeHtml(user.email)}</code>`,
      `🌐 <b>IP Address:</b> <code>${escapeHtml(cleanIp)}</code>`,
      `🔑 <b>Method:</b> ${escapeHtml(method)}`,
      ...(cleanIp && cleanIp !== 'unknown' && !cleanIp.startsWith('127.') ? [`\n💡 <b>Whitelist IP:</b> <code>/addip ${escapeHtml(cleanIp)}</code>`] : [])
    ].join('\n')

    await sendTelegramNotification(message)
  } catch (err) {
    console.error('Error sending user registration notification to Telegram:', err)
  }
}

export async function notifyUserLogin(user: { id: string; name?: string; email: string }, ip = 'unknown', method = 'Email') {
  try {
    const cleanIp = String(ip || 'unknown').trim()
    const message = [
      `🔑 <b>User Login Alert!</b>`,
      `📧 <b>Email:</b> <code>${escapeHtml(user.email)}</code>`,
      `🌐 <b>IP Address:</b> <code>${escapeHtml(cleanIp)}</code>`,
      `🔑 <b>Method:</b> ${escapeHtml(method)}`,
      ...(cleanIp && cleanIp !== 'unknown' && !cleanIp.startsWith('127.') ? [`\n💡 <b>Whitelist IP:</b> <code>/addip ${escapeHtml(cleanIp)}</code>`] : [])
    ].join('\n')

    await sendTelegramNotification(message)
  } catch (err) {
    console.error('Error sending user login notification to Telegram:', err)
  }
}

// In-memory throttling map to prevent Telegram bot spamming during attack sweeps
type AttackThrottleEntry = {
  lastSent: number
  suppressedCount: number
}
const attackThrottleMap = new Map<string, AttackThrottleEntry>()
const ATTACK_ALERT_THROTTLE_MS = 5 * 60 * 1000 // 5 minutes

export async function notifySecurityAttack(entry: {
  type: string
  method: string
  path: string
  ip: string
  userAgent?: string
  status?: number
  autoBanned?: boolean
  timestamp?: string
}) {
  try {
    const cleanIp = String(entry.ip || 'unknown').trim().replace(/^::ffff:/, '')
    const now = Date.now()
    const existing = attackThrottleMap.get(cleanIp)

    if (existing && now - existing.lastSent < ATTACK_ALERT_THROTTLE_MS) {
      existing.suppressedCount++
      console.warn(`[SECURITY] Throttling attack alert for IP ${cleanIp} (probe #${existing.suppressedCount} in current window)`)
      return
    }

    // Set or reset throttle window
    attackThrottleMap.set(cleanIp, {
      lastSent: now,
      suppressedCount: 0
    })

    const timeStr = (entry.timestamp || new Date().toISOString()).replace('T', ' ').substring(0, 19)
    const isPublicIp = cleanIp && cleanIp !== 'unknown' && !cleanIp.startsWith('127.')

    const actionText = entry.autoBanned
      ? '<b>BLOCKED & AUTO-BANNED (403 Forbidden) 🚫</b>'
      : '<b>BLOCKED (403 Forbidden)</b>'

    const botActions = entry.autoBanned
      ? [
          `\n💡 <b>Telegram Bot Actions:</b>`,
          `• Unban IP: <code>/unbanip ${escapeHtml(cleanIp)}</code>`,
          `• Whitelist IP: <code>/addip ${escapeHtml(cleanIp)}</code>`
        ]
      : [
          `\n💡 <b>Telegram Bot Actions:</b>`,
          `• Ban IP: <code>/banip ${escapeHtml(cleanIp)}</code>`,
          `• Whitelist IP: <code>/addip ${escapeHtml(cleanIp)}</code>`
        ]

    const message = [
      `🚨 <b>SECURITY ATTACK / PROBE DETECTED!</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `🎯 <b>Type:</b> <code>${escapeHtml(entry.type)}</code>`,
      `📍 <b>Target:</b> <code>${escapeHtml(entry.method)} ${escapeHtml(entry.path)}</code>`,
      `🌐 <b>Attacker IP:</b> <code>${escapeHtml(cleanIp)}</code>`,
      `🖥️ <b>User-Agent:</b> <code>${escapeHtml((entry.userAgent || 'unknown').slice(0, 100))}</code>`,
      `🛡️ <b>Action:</b> ${actionText}`,
      `🕒 <b>Time:</b> ${timeStr} UTC`,
      ...(isPublicIp ? botActions : [])
    ].join('\n')

    await sendTelegramNotification(message)
  } catch (err) {
    console.error('Error sending security attack notification to Telegram:', err)
  }
}

export async function notifyServerError(entry: { id: string; method: string; path: string; status: number; message: string; code: string; timestamp: string }) {
  try {
    const message = [
      `⚠️ <b>SYSTEM ERROR DETECTED!</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `📍 <b>Path:</b> <code>${escapeHtml(entry.method)} ${escapeHtml(entry.path)}</code>`,
      `💥 <b>Status:</b> ${entry.status}`,
      `🏷️ <b>Code:</b> <code>${escapeHtml(entry.code)}</code>`,
      `💬 <b>Error:</b> <code>${escapeHtml(entry.message)}</code>`,
      `🆔 <b>Log ID:</b> <code>${escapeHtml(entry.id)}</code>`,
      `🕒 <b>Time:</b> ${entry.timestamp.replace('T', ' ').substring(0, 19)} UTC`
    ].join('\n')

    await sendTelegramNotification(message)
  } catch (err) {
    console.error('Error sending server error notification to Telegram:', err)
  }
}

export async function getSystemAnalytics() {
  const [totalUsers, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
  ])

  return {
    totalUsers,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt.toISOString()
    }))
  }
}

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
