import { setGlobalDispatcher, ProxyAgent } from 'undici'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { google } from 'googleapis'
import { env } from './env.js'

export function setupGlobalProxy() {
  const proxyUrl = env.HTTP_PROXY || env.HTTPS_PROXY || env.GLOBAL_PROXY_URL || process.env.HTTP_PROXY || process.env.HTTPS_PROXY

  if (!proxyUrl) {
    console.log('[proxy] No HTTP_PROXY / HTTPS_PROXY configured. Direct connection enabled.')
    return
  }

  console.log(`[proxy] Global Proxy routing enabled: ${proxyUrl}`)

  try {
    // 1. Configure undici global dispatcher for all fetch(), stream, media scraping & Telegram calls
    const undiciDispatcher = new ProxyAgent(proxyUrl)
    setGlobalDispatcher(undiciDispatcher)

    // 2. Configure Google APIs (googleapis) global agent
    const httpsAgent = new HttpsProxyAgent(proxyUrl)
    google.options({
      agent: httpsAgent
    })

    console.log('[proxy] Successfully configured global proxy for all outbound scraping, API, and media streaming requests.')
  } catch (err: any) {
    console.error('[proxy] Failed to configure proxy agent:', err.message || err)
  }
}
