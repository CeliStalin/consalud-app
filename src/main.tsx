import '@consalud/core';
import 'bulma/css/bulma.min.css'
import './styles/bulma-overrides.css'
//import './styles/core-enhancements.css'
import './styles/navigation-optimizations.css'
import './styles/animations.css'
import { setCoreEnvConfig, initializeMsalConfig } from '@consalud/core';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// Agregado para depuración de variables de entorno
console.log('Variables de entorno import.meta.env:', import.meta.env);

// Forzar el mapeo manual de las variables de entorno para el core
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

initializeMsalConfig();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)