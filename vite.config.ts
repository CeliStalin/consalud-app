import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Obtener el equivalente a __dirname en ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo (desarrollo, test, producción)
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log(`Building for ${mode} environment`)
  
  return {
    plugins: [react()],
    envDir: '.',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },
    server: {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      // Configuración de proxy para evitar CORS en desarrollo
      proxy: mode === 'development' ? {
        '/api': {
          target: env.VITE_API_ARQUITECTURA_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      } : undefined
    },
  }
})