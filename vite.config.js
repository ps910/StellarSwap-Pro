import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfills needed by Stellar SDK
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Buffer polyfill
      buffer: 'buffer',
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
  },
})
