import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          core: ['@consalud/core'],
          'pages-critical': [
            './src/pages/IngresoHerederosPage',
            './src/pages/IngresoTitularPage'
          ],
          'pages-secondary': [
            './src/pages/DatosTitularPage',
            './src/pages/RegistroHerederoPage'
          ],
          'pages-forms': [
            './src/pages/IngresoHerederoFormPage',
            './src/pages/IngresoDocumentosPage'
          ],
          'pages-final': [
            './src/pages/SuccessPage',
            './src/pages/DetalleMandatoPage'
          ]
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    minify: 'terser',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  optimizeDeps: {
    include: ['@consalud/core', 'react', 'react-dom', 'react-router-dom'],
    exclude: ['@vite/client', '@vite/env']
  }
})