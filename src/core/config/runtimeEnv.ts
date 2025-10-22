/**
 * Runtime Configuracion
 * 
 * Este módulo permite leer variables de entorno en RUNTIME (no en build-time)
 * y se exponen en window.__ENV__
 */

// Definir la interfaz para las variables de entorno (solo variables únicas)
interface EnvConfig {
  VITE_AMBIENTE: string;
  VITE_API_ARQUITECTURA_URL: string;
  VITE_BFF_HEREDEROS_DNS: string;
  VITE_BFF_HEREDEROS_API_KEY_HEADER: string;
  VITE_BFF_HEREDEROS_API_KEY_VALUE: string;
  VITE_NAME_API_KEY: string;
  VITE_KEY_PASS_API_ARQ: string;
  VITE_SISTEMA: string;
  VITE_NOMBRE_SISTEMA: string;
  VITE_TIMEOUT: string;
  VITE_CLIENT_ID: string;
  VITE_AUTHORITY: string;
  VITE_REDIRECT_URI?: string;
}

// Extender el objeto Window
declare global {
  interface Window {
    __ENV__?: Partial<EnvConfig>;
  }
}

/**
 * Obtiene una variable de entorno desde runtime (window.__ENV__) o build-time (import.meta.env)
 * @param key - Nombre de la variable
 * @param defaultValue - Valor por defecto si no existe
 */
const getEnv = (key: keyof EnvConfig, defaultValue: string = ''): string => {
  // Intentar leer desde window.__ENV__ (runtime - tiene prioridad)
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key] as string;
  }

  // Fallback a import.meta.env (build-time)
  const buildTimeValue = import.meta.env[key];
  if (buildTimeValue !== undefined && buildTimeValue !== '') {
    return String(buildTimeValue);
  }

  //Retornar valor por defecto
  return defaultValue;
};

export const runtimeEnv = {
  // Ambiente
  get VITE_AMBIENTE() { return getEnv('VITE_AMBIENTE', 'production'); },

  // APIs
  get VITE_API_ARQUITECTURA_URL() { return getEnv('VITE_API_ARQUITECTURA_URL'); },
  get VITE_BFF_HEREDEROS_DNS() { return getEnv('VITE_BFF_HEREDEROS_DNS'); },
  get VITE_BFF_HEREDEROS_API_KEY_HEADER() { return getEnv('VITE_BFF_HEREDEROS_API_KEY_HEADER'); },
  get VITE_BFF_HEREDEROS_API_KEY_VALUE() { return getEnv('VITE_BFF_HEREDEROS_API_KEY_VALUE'); },

  // Seguridad
  get VITE_NAME_API_KEY() { return getEnv('VITE_NAME_API_KEY'); },
  get VITE_KEY_PASS_API_ARQ() { return getEnv('VITE_KEY_PASS_API_ARQ'); },

  // Sistema
  get VITE_SISTEMA() { return getEnv('VITE_SISTEMA'); },
  get VITE_NOMBRE_SISTEMA() { return getEnv('VITE_NOMBRE_SISTEMA', 'Administrador de Devolución a Herederos'); },

  // Timeout
  get VITE_TIMEOUT() { return getEnv('VITE_TIMEOUT', '30000'); },

  // Azure AD (MSAL)
  get VITE_CLIENT_ID() { return getEnv('VITE_CLIENT_ID'); },
  get VITE_AUTHORITY() { return getEnv('VITE_AUTHORITY'); },
  get VITE_REDIRECT_URI() { return getEnv('VITE_REDIRECT_URI', window.location.origin + '/login'); },
};

/**
 * Inyectar variables de runtime en import.meta.env
 * Esto garantiza compatibilidad con librerías que leen directamente de import.meta.env
 */
if (typeof window !== 'undefined' && window.__ENV__) {
  Object.keys(window.__ENV__).forEach(key => {
    if (window.__ENV__![key as keyof EnvConfig]) {
      (import.meta.env as any)[key] = window.__ENV__![key as keyof EnvConfig];
    }
  });
}

// Exportar función helper
export { getEnv };
