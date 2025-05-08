import { AuthProvider as MsalAuthProvider } from '@consalud/core';
import './msalPatch'; 

try {
  // Define variables globales para que el paquete core pueda acceder a ellas
  (window as any).MSAL_CONFIG = {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: import.meta.env.VITE_AUTHORITY,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/login`,
  };
  
  console.log('MSAL Config set globally:', (window as any).MSAL_CONFIG);
  // MsalAuthProvider.configure({
  //   clientId: import.meta.env.VITE_CLIENT_ID,
  //   authority: import.meta.env.VITE_AUTHORITY,
  //   redirectUri: import.meta.env.VITE_REDIRECT_URI,
  // });
} catch (error) {
  console.error('Error pre-configurando MSAL:', error);
}

// Ahora importa el resto de dependencias
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bulma/css/bulma.min.css';
import './styles/variables.css'; 
import './styles/bulma-overrides.css';
import './index.css'; 

// Log de diagnóstico para verificar que las variables de entorno están disponibles
console.log('Variables de entorno en main.tsx:', {
  VITE_CLIENT_ID: import.meta.env.VITE_CLIENT_ID ? 'Disponible' : 'No disponible',
  VITE_AUTHORITY: import.meta.env.VITE_AUTHORITY ? 'Disponible' : 'No disponible',
  VITE_REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI ? 'Disponible' : 'No disponible',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);