import { app } from './app.js'
import { env } from './config/env.js'
import { setupGlobalProxy } from './config/proxy.js'
import { startTelegramBotListener } from './services/telegram-bot.service.js'

import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

setupGlobalProxy()

async function main() {
  // Run migrations and seed BEFORE accepting connections,
  // so the server never starts with a stale or uninitialized schema.
  try {
    console.log('[DB] Running database migrations...')
    await execAsync('npx prisma migrate deploy')
    console.log('[DB] Migrations completed successfully.')

    await execAsync('npm run seed:google-config:docker')
  } catch (err) {
    console.error('[DB] Migration/seed error:', err)
    // Continue startup even if seed fails; migration errors are logged above.
  }

  app.listen(env.APP_PORT, () => {
    console.log(`[Server] Drive9 backend running on http://localhost:${env.APP_PORT}`)
    startTelegramBotListener()
  })
}

main()
