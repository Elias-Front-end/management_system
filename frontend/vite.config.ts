import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 5174,
    proxy: {
      // Proxy API requests to Django backend to avoid CORS/CSRF issues in dev
      '/api': {
        target: 'http://localhost:8000',  // Alterado para desenvolvimento local
        changeOrigin: true,
        // Ensure cookies and headers are forwarded correctly
        secure: false,
      },
    },
  },

})
