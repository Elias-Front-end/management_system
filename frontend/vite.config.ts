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
        target: 'http://backend:8000',
        changeOrigin: true,
        // Ensure cookies and headers are forwarded correctly
        secure: false,
      },
    },
  },
  build: {
    // Production security configurations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        // Prevent chunk names from revealing internal structure
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
      },
    },
  },
})
