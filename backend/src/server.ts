import { app } from './app.js'
import { env } from './config/env.js'
import { setupGlobalProxy } from './config/proxy.js'
import { startTelegramBotListener } from './services/telegram-bot.service.js'

import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

setupGlobalProxy()

app.listen(env.APP_PORT, async () => {
  console.log(`Backend running on http://localhost:${env.APP_PORT}`)

  try {
    console.log('[DB] Running database migrations...')
    await execAsync('npx prisma migrate deploy')
    console.log('[DB] Database migrations completed successfully.')

    await execAsync('npm run seed:google-config:docker')
  } catch (err) {
    console.error('[DB] Migration/seed error:', err)
  }

  startTelegramBotListener()
})

