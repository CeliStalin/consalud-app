// vite.config.ts (actualizado con proxy para servidor de seguridad)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    // Configuración del proxy para redireccionar tanto al servidor proxy de mandatos
    // como al nuevo servidor de seguridad
    proxy: {
      // Proxies existentes
      '/api/mandato': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Nuevo proxy para el servidor de seguridad
      '/api/external-app': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})