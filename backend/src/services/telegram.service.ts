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

export async function notifyUserRegistration(user: { id: string; name: string; email: string }, method = 'Email & Password') {
  try {
    const totalUsers = await prisma.user.count()
    const message = [
      `👤 <b>New User Registered!</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `📛 <b>Name:</b> ${escapeHtml(user.name)}`,
      `📧 <b>Email:</b> <code>${escapeHtml(user.email)}</code>`,
      `🔑 <b>Method:</b> ${method}`,
      `🕒 <b>Time:</b> ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`,
      `📊 <b>Total Registered Users:</b> ${totalUsers}`
    ].join('\n')

    await sendTelegramNotification(message)
  } catch (err) {
    console.error('Error sending user registration notification to Telegram:', err)
  }
}

export async function notifyAccountConnected(userEmail: string, connectedEmail: string, provider = 'google_drive') {
  try {
    const totalAccounts = await prisma.connectedAccount.count({ where: { status: 'connected' } })
    const message = [
      `🔗 <b>New Storage Account Connected!</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `👤 <b>User Email:</b> <code>${escapeHtml(userEmail)}</code>`,
      `📧 <b>Drive Email:</b> <code>${escapeHtml(connectedEmail)}</code>`,
      `☁️ <b>Provider:</b> ${escapeHtml(provider)}`,
      `🕒 <b>Time:</b> ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC`,
      `📊 <b>Total Active Accounts:</b> ${totalAccounts}`
    ].join('\n')

    await sendTelegramNotification(message)
  } catch (err) {
    console.error('Error sending account connected notification to Telegram:', err)
  }
}

export async function getSystemAnalytics() {
  const [totalUsers, totalConnectedAccounts, totalFiles, users] = await Promise.all([
    prisma.user.count(),
    prisma.connectedAccount.count({ where: { status: 'connected' } }),
    prisma.file.count({ where: { status: 'active' } }),
    prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true, _count: { select: { connectedAccounts: true, files: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  ])

  return {
    totalUsers,
    totalConnectedAccounts,
    totalFiles,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt.toISOString(),
      connectedAccountsCount: u._count.connectedAccounts,
      filesCount: u._count.files
    }))
  }
}

function escapeHtml(text: string) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
