// IMPORTANTE: Configurar el ambiente ANTES de importar cualquier componente del core
import { initializeMsalConfig, setCoreEnvConfig } from '@consalud/core';

// Agregado para depuración de variables de entorno
console.log('🔍 Variables de entorno cargadas:', import.meta.env);
console.log('📍 VITE_AMBIENTE:', import.meta.env.VITE_AMBIENTE);

// ⚠️ CRÍTICO: setCoreEnvConfig DEBE ejecutarse ANTES de importar otros módulos del core
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

console.log('✅ Configuración del core establecida correctamente');

// Ahora sí, importar el resto del core después de configurar
import '@consalud/core/core.css';
import '@consalud/core/index.js';
import 'bulma/css/bulma.min.css';
import './styles/bulma-overrides.css';
//import './styles/core-enhancements.css'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './features/herederos/components/styles/globalStyle.css';
import './styles/animations.css';
import './styles/navigation-optimizations.css';

// Inicializar MSAL después de configurar el ambiente
initializeMsalConfig();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
