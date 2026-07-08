import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Tailwind CSS v4 is handled by @tailwindcss/postcss in postcss.config.js
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 5173,
  },
})

