import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'favicon.svg', 'pwa-192x192.svg', 'pwa-512x512.svg', 'maskable-icon.svg'],
      manifest: {
        name: 'drive9',
        short_name: 'drive9',
        description: 'Google Drive storage gateway for files, folders, sharing, and quota tracking.',
        theme_color: '#030712',
        background_color: '#030712',
        display: 'standalone',
        start_url: '/all-files',
        scope: '/',
        orientation: 'portrait-primary',
        icons: [
          { src: '/logo.png', sizes: '192x192 512x512', type: 'image/png' },
          { src: '/pwa-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
          { src: '/pwa-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
          { src: '/maskable-icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/(api|auth|connected-accounts|files|folders|invites|provider-configs|public|storage|uploads)(\/|$)/],
        globPatterns: ['**/*.{js,css,html,svg,ico,png,webp,woff2}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react'
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion'
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
          }
        },
      },
    },
  },
})
