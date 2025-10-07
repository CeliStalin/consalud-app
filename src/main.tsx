// IMPORTANTE: Configurar el ambiente ANTES de importar cualquier componente del core
import { initializeMsalConfig, setCoreEnvConfig } from '@consalud/core';

// Esto asegura que las URLs dinámicas se generen con el ambiente correcto
setCoreEnvConfig({
  VITE_AMBIENTE: import.meta.env.VITE_AMBIENTE,
  VITE_APP_AMBIENTE: import.meta.env.VITE_APP_AMBIENTE,
  VITE_API_ARQUITECTURA_URL: import.meta.env.VITE_API_ARQUITECTURA_URL,
  VITE_APP_API_ARQUITECTURA_URL: import.meta.env.VITE_APP_API_ARQUITECTURA_URL,
  VITE_NAME_API_KEY: import.meta.env.VITE_NAME_API_KEY,
  VITE_APP_NAME_API_KEY: import.meta.env.VITE_APP_NAME_API_KEY,
  VITE_KEY_PASS_API_ARQ: import.meta.env.VITE_KEY_PASS_API_ARQ,
  VITE_APP_KEY_PASS_API_ARQ: import.meta.env.VITE_APP_KEY_PASS_API_ARQ,
  VITE_SISTEMA: import.meta.env.VITE_SISTEMA,
  VITE_APP_SISTEMA: import.meta.env.VITE_APP_SISTEMA,
  VITE_NOMBRE_SISTEMA: import.meta.env.VITE_NOMBRE_SISTEMA,
  VITE_APP_NOMBRE_SISTEMA: import.meta.env.VITE_APP_NOMBRE_SISTEMA,
  VITE_TIMEOUT: import.meta.env.VITE_TIMEOUT,
  VITE_APP_TIMEOUT: import.meta.env.VITE_APP_TIMEOUT,
  VITE_CLIENT_ID: import.meta.env.VITE_CLIENT_ID,
  VITE_APP_CLIENT_ID: import.meta.env.VITE_APP_CLIENT_ID,
  VITE_AUTHORITY: import.meta.env.VITE_AUTHORITY,
  VITE_APP_AUTHORITY: import.meta.env.VITE_APP_AUTHORITY,
});

// importar el resto del core después de configurar
import '@consalud/core/core.css';
import '@consalud/core/index.js';
import 'bulma/css/bulma.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './features/herederos/components/styles/globalStyle.css';
import './styles/animations.css';
import './styles/bulma-overrides.css';
import './styles/navigation-optimizations.css';

// Suprimir mensajes informativos de React en desarrollo
if (import.meta.env.MODE === 'development') {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Filtrar warnings específicos que queremos silenciar
    if (
      message.includes('Download the React DevTools') ||
      message.includes('React Router Future Flag Warning')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // Suprimir errores de extensiones del navegador
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    // Filtrar errores de extensiones del navegador
    if (
      message.includes('Could not establish connection') ||
      message.includes('Receiving end does not exist') ||
      message.includes('content-all.js')
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  // Suprimir errores no capturados de extensiones
  window.addEventListener('error', event => {
    const message = event.message || '';
    if (
      message.includes('Could not establish connection') ||
      message.includes('content-all.js') ||
      event.filename?.includes('extension')
    ) {
      event.preventDefault();
      return;
    }
  });

  // Suprimir promesas rechazadas de extensiones
  window.addEventListener('unhandledrejection', event => {
    const message = event.reason?.message || event.reason?.toString() || '';
    if (message.includes('Could not establish connection') || message.includes('content-all.js')) {
      event.preventDefault();
      return;
    }
  });
}

// Inicializar MSAL después de configurar el ambiente
initializeMsalConfig();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
