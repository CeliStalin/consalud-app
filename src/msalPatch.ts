export const patchMsal = () => {
    // Verifica si las variables de entorno son diferentes de las globales
    const envClientId = import.meta.env.VITE_CLIENT_ID;
    const envAuthority = import.meta.env.VITE_AUTHORITY;
    
    // Si hay variables de entorno disponibles en la aplicación, usarlas
    if (envClientId && envAuthority) {
      console.log('Configurando MSAL con variables de entorno locales');
      
      // Establecer o actualizar la configuración global
      (window as any).MSAL_CONFIG = {
        clientId: envClientId,
        authority: envAuthority,
        redirectUri: import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/login`,
      };
    }
    
    return true; // Indicar que el parche se ejecutó
  };
  
  // Ejecuta el parche inmediatamente
  patchMsal();

  export default patchMsal;