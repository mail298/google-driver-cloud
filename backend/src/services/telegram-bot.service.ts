import { env } from '../config/env.js'
import { addWhitelistedIp, getWhitelistedIps, removeWhitelistedIp } from '../utils/ip-whitelist.store.js'

let isPollingStarted = false
let lastUpdateId = 0

export function startTelegramBotListener() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || (env as any).TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID || (env as any).TELEGRAM_CHAT_ID || ''

  if (!botToken) {
    console.log('[TELEGRAM_BOT] TELEGRAM_BOT_TOKEN not configured. Telegram bot listener disabled.')
    return
  }

  if (isPollingStarted) return
  isPollingStarted = true

  console.log('[TELEGRAM_BOT] Starting Telegram Bot long polling listener...')

  // Automatically register command menu for Telegram UI autocomplete when typing '/'
  registerBotCommands(botToken).catch((err) => {
    console.error('[TELEGRAM_BOT] Failed to set bot commands:', err)
  })

  // Start polling loop asynchronously
  pollTelegramUpdates(botToken, String(chatId).trim()).catch((err) => {
    console.error('[TELEGRAM_BOT] Long polling loop error:', err)
  })
}

async function registerBotCommands(botToken: string) {
  try {
    const commands = [
      { command: 'addip', description: 'Tambah IP ke Whitelist (contoh: /addip 103.x.x.x)' },
      { command: 'delip', description: 'Hapus IP dari Whitelist (contoh: /delip 103.x.x.x)' },
      { command: 'whitelist', description: 'Lihat daftar IP yang terdaftar di Whitelist' },
      { command: 'mychatid', description: 'Tampilkan Chat ID Telegram kamu' },
      { command: 'help', description: 'Bantuan & daftar menu perintah' }
    ]
    const res = await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commands })
    })
    if (res.ok) {
      console.log('[TELEGRAM_BOT] Successfully registered bot commands menu for Telegram UI.')
    }
  } catch (err) {
    console.error('[TELEGRAM_BOT] Failed to register bot commands:', err)
  }
}

async function pollTelegramUpdates(botToken: string, targetChatId: string) {
  while (isPollingStarted) {
    try {
      const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=20`
      const res = await fetch(url)
      
      if (!res.ok) {
        // Wait 5s on HTTP error (e.g. 401 Unauthorized token) before retrying
        console.error(`[TELEGRAM_BOT] getUpdates failed with status ${res.status}`)
        await new Promise((r) => setTimeout(r, 5000))
        continue
      }

      const data = (await res.json()) as { ok?: boolean; result?: any[] }
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastUpdateId = Math.max(lastUpdateId, update.update_id)
          if (update.message && update.message.text) {
            await handleTelegramMessage(botToken, targetChatId, update.message).catch((err) => {
              console.error('[TELEGRAM_BOT] Error handling message:', err)
            })
          }
        }
      }
    } catch (err) {
      console.error('[TELEGRAM_BOT] Polling error:', err)
      await new Promise((r) => setTimeout(r, 5000))
    }
  }
}

async function handleTelegramMessage(botToken: string, targetChatId: string, message: any) {
  const messageChatId = String(message.chat?.id || '').trim()
  const rawText = String(message.text || '').trim()
  if (!rawText || !messageChatId) return

  // Extract command name (stripping bot username if present, e.g. /start@MyBot -> /start)
  const parts = rawText.split(/\s+/)
  let command = parts[0].toLowerCase()
  if (command.includes('@')) {
    command = command.split('@')[0]
  }
  const argument = parts[1] ? parts[1].trim() : ''

  console.log(`[TELEGRAM_BOT] Received command '${command}' from chat_id: ${messageChatId}`)

  // Security verification: check if chat_id matches configured TELEGRAM_CHAT_ID
  if (targetChatId && messageChatId !== targetChatId) {
    console.warn(`[TELEGRAM_BOT] Unauthorized access attempt from chat_id ${messageChatId}. Configured: ${targetChatId}`)
    await replyTelegram(
      botToken,
      messageChatId,
      `⚠️ <b>Unauthorized Chat ID!</b>\nYour Chat ID is <code>${messageChatId}</code>.\n\nPlease configure <code>TELEGRAM_CHAT_ID=${messageChatId}</code> in your backend environment variables to authorize commands.`
    )
    return
  }

  if (!targetChatId) {
    console.warn(`[TELEGRAM_BOT] TELEGRAM_CHAT_ID is not configured in backend environment variables. Received message from chat_id ${messageChatId}`)
    await replyTelegram(
      botToken,
      messageChatId,
      `⚠️ <b>TELEGRAM_CHAT_ID Not Set!</b>\nYour Telegram Chat ID is <code>${messageChatId}</code>.\n\nPlease set <code>TELEGRAM_CHAT_ID=${messageChatId}</code> in your backend environment variables to enable bot command control.`
    )
    return
  }

  if (command === '/start' || command === '/help') {
    const helpMsg = [
      `🤖 <b>9Drive Telegram Bot Helper</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `<b>Available Commands:</b>`,
      `• <code>/addip &lt;ip&gt;</code> - Add IP to Whitelist`,
      `• <code>/delip &lt;ip&gt;</code> - Remove IP from Whitelist`,
      `• <code>/whitelist</code> or <code>/listip</code> - List all Whitelisted IPs`,
      `• <code>/mychatid</code> - Show your Telegram Chat ID`,
      `• <code>/help</code> - Show this command list`
    ].join('\n')
    await replyTelegram(botToken, targetChatId, helpMsg)
    return
  }

  if (command === '/mychatid' || command === '/id') {
    await replyTelegram(botToken, targetChatId, `📱 Your Telegram Chat ID is: <code>${messageChatId}</code>`)
    return
  }

  if (command === '/addip' || command === '/add' || command === '/whitelist_add') {
    if (!argument) {
      await replyTelegram(botToken, targetChatId, '❌ <b>Usage:</b> <code>/addip &lt;ip_address&gt;</code>\nExample: <code>/addip 103.65.237.136</code>')
      return
    }
    const result = addWhitelistedIp(argument)
    const currentList = formatIpList(result.ips)
    if (result.success) {
      await replyTelegram(botToken, targetChatId, `✅ <b>IP Whitelisted!</b>\nAdded: <code>${argument}</code>\n\n${currentList}`)
    } else {
      await replyTelegram(botToken, targetChatId, `❌ <b>Failed:</b> ${result.message}\n\n${currentList}`)
    }
    return
  }

  if (command === '/delip' || command === '/remove' || command === '/rem' || command === '/whitelist_del') {
    if (!argument) {
      await replyTelegram(botToken, targetChatId, '❌ <b>Usage:</b> <code>/delip &lt;ip_address&gt;</code>\nExample: <code>/delip 103.65.237.136</code>')
      return
    }
    const result = removeWhitelistedIp(argument)
    const currentList = formatIpList(result.ips)
    if (result.success) {
      await replyTelegram(botToken, targetChatId, `🗑️ <b>IP Removed!</b>\nRemoved: <code>${argument}</code>\n\n${currentList}`)
    } else {
      await replyTelegram(botToken, targetChatId, `❌ <b>Failed:</b> ${result.message}\n\n${currentList}`)
    }
    return
  }

  if (command === '/whitelist' || command === '/listip' || command === '/ips' || command === '/list') {
    const ips = getWhitelistedIps()
    const currentList = formatIpList(ips)
    await replyTelegram(botToken, targetChatId, currentList)
    return
  }
}

function formatIpList(ips: string[]): string {
  if (ips.length === 0) {
    return '📋 <b>Whitelisted IPs:</b> None (IP Restriction is currently Disabled - All IPs allowed)'
  }
  const items = ips.map((ip) => `• <code>${ip}</code>`).join('\n')
  return `📋 <b>Whitelisted IPs (${ips.length}):</b>\n${items}`
}

async function replyTelegram(botToken: string, chatId: string, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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
      console.error(`[TELEGRAM_BOT] replyTelegram failed with status ${res.status}:`, await res.text())
    }
  } catch (err) {
    console.error('[TELEGRAM_BOT] Failed to send reply:', err)
  }
}
