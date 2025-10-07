import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@consalud/core': path.resolve(__dirname, './node_modules/@consalud/core/dist')
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
    // Proxy eliminado - no se usa
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  },  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          'pages-critical': [
            './src/pages/IngresoTitularPage'
          ],
          'pages-secondary': [
            './src/pages/DatosTitularPage',
            './src/pages/RegistroHerederoPage'
          ],
          'pages-forms': [
            './src/pages/IngresoHerederoFormPage'
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
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    assetsInlineLimit: 4096
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['@vite/client', '@vite/env', '@consalud/core']
  }
})
