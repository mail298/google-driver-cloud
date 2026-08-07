import { env } from '../config/env.js'
import { prisma } from '../config/prisma.js'

export async function sendTelegramNotification(text: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || (env as any).TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID || (env as any).TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
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
    return res.ok
  } catch (err) {
    console.error('Failed to send Telegram notification:', err)
    return false
  }
}

export async function notifyUserRegistration(user: { id: string; name: string; email: string }, method = 'Email') {
  try {
    const totalUsers = await prisma.user.count()
    const message = [
      `👤 <b>New User Registered!</b>`,
      `📧 <b>Email:</b> <code>${escapeHtml(user.email)}</code>`,
      `📊 <b>Total Users Registered:</b> ${totalUsers}`
    ].join('\n')

    await sendTelegramNotification(message)
  } catch (err) {
    console.error('Error sending user registration notification to Telegram:', err)
  }
}

export async function notifyUserLogin(user: { id: string; name: string; email: string }, ip = 'unknown', method = 'Email') {
  try {
    const message = [
      `🔑 <b>User Logged In!</b>`,
      `📧 <b>Email:</b> <code>${escapeHtml(user.email)}</code>`,
      `🌐 <b>IP Address:</b> <code>${escapeHtml(String(ip))}</code>`,
      `🔑 <b>Method:</b> ${method}`
    ].join('\n')

    await sendTelegramNotification(message)
  } catch (err) {
    console.error('Error sending user login notification to Telegram:', err)
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
