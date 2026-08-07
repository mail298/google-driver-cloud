import { app } from './app.js'
import { env } from './config/env.js'
import { setupGlobalProxy } from './config/proxy.js'
import { startTelegramBotListener } from './services/telegram-bot.service.js'

setupGlobalProxy()

app.listen(env.APP_PORT, () => {
  console.log(`Backend running on http://localhost:${env.APP_PORT}`)
  startTelegramBotListener()
})

