// src/core/config/env.ts
export const environment = {
    apiUrl: import.meta.env.VITE_APP_API_ARQUITECTURA_URL || 'http://soter.arquitectura.des',
    apiKey: import.meta.env.VITE_APP_KEY_PASS_API_ARQ || 'U2VndXJpZGFkXDgyZmYwNDNmODdjNTI4YTMwNzI2MzMwZmY3NDc5YjEyXA==',
    clientId: import.meta.env.VITE_APP_CLIENT_ID || '8e2f9f34-29ab-4ef2-b05e-f5aaf4d2611d',
    authority: import.meta.env.VITE_APP_AUTHORITY || 'https://login.microsoftonline.com/00f7e79d-7df9-43de-8f9e-b730ed80c0b0',
    ambiente: import.meta.env.VITE_APP_AMBIENTE || 'Desarrollo',
    sistema: import.meta.env.VITE_APP_SISTEMA || 'ManHerederos',
    nombreSistema: import.meta.env.VITE_APP_NOMBRE_SISTEMA || 'Explotacion de Sistemas',
    timeout: Number(import.meta.env.VITE_APP_TIMEOUT) || 10000,
  };
