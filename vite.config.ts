import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  const isTest = mode === 'test';
  const isProduction = mode === 'production';

  // TEST y PROD tienen compilación idéntica (optimizada)
  // Solo difieren en el .env que cargan (URLs de APIs)
  const isOptimizedBuild = isTest || isProduction;

  console.log(`Building in mode: ${mode}`);
  console.log(`Minification: ${isDevelopment ? 'disabled' : 'terser'}`);
  console.log(`Sourcemaps: ${isOptimizedBuild ? 'disabled' : 'enabled'}`);

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@consalud/core': path.resolve(__dirname, './node_modules/@consalud/core/dist'),
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
        Pragma: 'no-cache',
        Expires: '0',
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
    },
    build: {
      target: isDevelopment ? 'esnext' : 'es2020',
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: isOptimizedBuild
            ? {
                vendor: ['react', 'react-dom'],
                router: ['react-router-dom'],
                'pages-critical': ['./src/pages/IngresoTitularPage'],
                'pages-secondary': [
                  './src/pages/DatosTitularPage',
                  './src/pages/RegistroHerederoPage',
                ],
                'pages-forms': ['./src/pages/IngresoHerederoFormPage'],
                'pages-final': ['./src/pages/SuccessPage', './src/pages/DetalleMandatoPage'],
              }
            : undefined,
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      minify: isDevelopment ? false : 'terser',
      terserOptions: isOptimizedBuild
        ? {
            compress: {
              drop_console: true, // Elimina console.log en producción / Test
              drop_debugger: true,
              pure_funcs: ['console.log', 'console.info', 'console.debug'],
            },
            format: {
              comments: false, // Eliminar comentarios
            },
          }
        : undefined,
      // Sourcemaps: deshabilitados en test/producción por seguridad y tamaño
      sourcemap: isOptimizedBuild ? false : true,
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      // Reportar tamaño de bundles en builds optimizados
      reportCompressedSize: isOptimizedBuild,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      exclude: ['@vite/client', '@vite/env', '@consalud/core'],
    },
  };
});
