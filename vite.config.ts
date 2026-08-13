import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Vite 8 dependency optimizer can drop Vue runtime initializer imports while
  // prebundling Headless UI 1.x, producing `init_runtime_dom_esm_bundler is not defined`.
  // Serving this ESM dependency directly avoids the broken generated bundle.
  optimizeDeps: {
    exclude: ['@headlessui/vue'],
  },
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'TaxGrid',
        short_name: 'TaxGrid',
        description: 'Simula e confronta i regimi fiscali italiani (Forfettario, Ordinario, SRL) in tempo reale.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})

