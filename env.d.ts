/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_APP_AMBIENTE: string;
    readonly VITE_APP_SISTEMA: string;
    readonly VITE_APP_NOMBRE_SISTEMA: string;
    readonly VITE_APP_API_EXPLOTACION_URL: string;
    readonly VITE_APP_API_ARQUITECTURA_URL: string;
    readonly VITE_APP_TIMEOUT: string;
    readonly VITE_APP_NAME_API_KEY: string;
    readonly VITE_APP_KEY_PASS_API_ARQ: string;
    readonly VITE_APP_CLIENT_ID: string;
    readonly VITE_APP_AUTHORITY: string;
    readonly VITE_APP_REDIRECT_URI: string;
    
    // Variables sin el prefijo APP
    readonly VITE_AMBIENTE: string;
    readonly VITE_SISTEMA: string;
    readonly VITE_NOMBRE_SISTEMA: string;
    readonly VITE_API_EXPLOTACION_URL: string;
    readonly VITE_API_ARQUITECTURA_URL: string;
    readonly VITE_TIMEOUT: string;
    readonly VITE_NAME_API_KEY: string;
    readonly VITE_KEY_PASS_API_ARQ: string;
    readonly VITE_CLIENT_ID: string;
    readonly VITE_AUTHORITY: string;
    readonly VITE_REDIRECT_URI: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }