import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '/' : '/gordon_dashboard/',
  server: {
    port: 3001,
    strictPort: true,
  }
}))
