import { env } from '../config/env.js'
import { addWhitelistedIp, getWhitelistedIps, removeWhitelistedIp } from '../utils/ip-whitelist.store.js'

let isPollingStarted = false
let lastUpdateId = 0

export function startTelegramBotListener() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || (env as any).TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID || (env as any).TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.log('[TELEGRAM_BOT] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured. Telegram bot listener disabled.')
    return
  }

  if (isPollingStarted) return
  isPollingStarted = true

  console.log('[TELEGRAM_BOT] Starting Telegram Bot long polling listener...')

  // Start polling loop asynchronously
  pollTelegramUpdates(botToken, String(chatId)).catch((err) => {
    console.error('[TELEGRAM_BOT] Long polling loop error:', err)
  })
}

async function pollTelegramUpdates(botToken: string, targetChatId: string) {
  while (isPollingStarted) {
    try {
      const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${lastUpdateId + 1}&timeout=20`
      const res = await fetch(url)
      
      if (!res.ok) {
        // Wait 5s on error before retrying
        await new Promise((r) => setTimeout(r, 5000))
        continue
      }

      const data = (await res.json()) as { ok?: boolean; result?: any[] }
      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          lastUpdateId = Math.max(lastUpdateId, update.update_id)
          if (update.message && update.message.text) {
            await handleTelegramMessage(botToken, targetChatId, update.message).catch(() => undefined)
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
  const messageChatId = String(message.chat?.id || '')
  
  // Security verification: only accept messages from configured TELEGRAM_CHAT_ID
  if (messageChatId !== targetChatId) {
    return
  }

  const text = String(message.text || '').trim()
  if (!text) return

  const parts = text.split(/\s+/)
  const command = parts[0].toLowerCase()
  const argument = parts[1] ? parts[1].trim() : ''

  if (command === '/start' || command === '/help') {
    const helpMsg = [
      `🤖 <b>9Drive Telegram Bot Helper</b>`,
      `━━━━━━━━━━━━━━━━━━`,
      `<b>Available Commands:</b>`,
      `• <code>/addip &lt;ip&gt;</code> - Add IP to Whitelist`,
      `• <code>/delip &lt;ip&gt;</code> - Remove IP from Whitelist`,
      `• <code>/whitelist</code> or <code>/listip</code> - List all Whitelisted IPs`,
      `• <code>/myip</code> - Show your current client IP`,
      `• <code>/help</code> - Show this command list`
    ].join('\n')
    await replyTelegram(botToken, targetChatId, helpMsg)
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
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    })
  } catch (err) {
    console.error('[TELEGRAM_BOT] Failed to send reply:', err)
  }
}
