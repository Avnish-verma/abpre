import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // ✨ WORKBOX CONFIG ADD KAREIN ✨
      workbox: {
        maximumFileSizeToCacheInBytes: 4000000, // Isko 4MB kar diya hai taaki error na aaye
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'] // In files ko cache karega
      },
      manifest: {
        name: 'ABP Classes - Learning App',
        short_name: 'ABP Classes',
        description: 'Quality Education for Everyone',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  // Optional: Chunk warning hatane ke liye
  build: {
    chunkSizeWarningLimit: 3000, 
  }
})