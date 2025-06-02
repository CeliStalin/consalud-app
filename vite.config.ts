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
    host: '0.0.0.0',
    port: 5173,
    // Configuración optimizada para SPA con transiciones del Core
    historyApiFallback: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      // Headers adicionales para mejorar las transiciones
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    proxy: {
      '/api/mandato': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/health': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    // Optimizar chunks para funcionar mejor con PageTransition del Core
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          core: ['@consalud/core'],
          // Agrupar las páginas para cargas más eficientes
          pages: [
            './src/pages/IngresoHerederosPage',
            './src/pages/IngresoTitularPage',
            './src/pages/DatosTitularPage',
            './src/pages/SuccessPage'
          ]
        }
      }
    },
    // Configuraciones críticas para SPA
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  },
  // Optimizaciones específicas para evitar recargas
  optimizeDeps: {
    include: ['@consalud/core', 'react', 'react-dom', 'react-router-dom'],
    exclude: ['@vite/client', '@vite/env']
  },
  // Eliminar configuración de CSS que puede causar conflictos
  css: {
    devSourcemap: false
  }
})