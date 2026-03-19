import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Only proxy /api when running standalone (npm run dev).
    // When vercel dev runs Vite, it sets PORT — and handles API routes itself.
    proxy: process.env.PORT
      ? undefined
      : {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
          },
        },
  },
})
