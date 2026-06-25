import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true,   // Windows pe HMR fix — file changes detect karne ke liye
      interval: 100,      // 100ms pe check karo
    },
  },
})
