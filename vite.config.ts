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
    // Configuración del proxy para evitar problemas CORS
    proxy: {
      '/api/mandato': {
        target: 'http://caja.sistemastransversales.tes/consalud.Caja.servicios/SvcMandato.svc',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mandato/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // Configurar encabezados CORS en la respuesta
            proxyRes.headers['Access-Control-Allow-Origin'] = '*';
            proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
            proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, SOAPAction';
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Registrar información de la solicitud para depuración
            console.log(`Proxying request to: ${req.url}`);
            console.log('Headers:', proxyReq.getHeaders());
          });
        }
        // Removida la propiedad 'cors: true' que causa el error
      }
    }
  }
})