import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';

interface UseAuthWithRedirectOptions {
  defaultRedirectPath?: string;
  protectedPaths?: string[];
  publicPaths?: string[];
}

export const useAuthWithRedirect = (options: UseAuthWithRedirectOptions = {}) => {
  const {
    defaultRedirectPath = '/home',
    protectedPaths = ['/mnherederos'],
    publicPaths = ['/login']
  } = options;
  
  const { isSignedIn, isInitializing, loading, user } = ConsaludCore.useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Guardar la ruta actual si es protegida y el usuario no está autenticado
  useEffect(() => {
    if (!isInitializing && !loading) {
      const currentPath = location.pathname;
      const isProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));
      const isPublicPath = publicPaths.some(path => currentPath.startsWith(path));
      
      if (!isSignedIn && isProtectedPath) {
        // Guardar la ruta para redireccionar después del login
        sessionStorage.setItem('redirectPath', currentPath);
        navigate('/login', { replace: true });
      } else if (isSignedIn && isPublicPath) {
        // Si está autenticado y está en una ruta pública, redirigir
        const savedPath = sessionStorage.getItem('redirectPath');
        const redirectTo = savedPath || defaultRedirectPath;
        sessionStorage.removeItem('redirectPath');
        navigate(redirectTo, { replace: true });
      }
    }
  }, [isSignedIn, isInitializing, loading, location.pathname, navigate, protectedPaths, publicPaths, defaultRedirectPath]);
  
  const handleLoginSuccess = useCallback(async (loginData?: any) => {
    try {
      // Obtener la ruta de redirección guardada
      const savedRedirectPath = sessionStorage.getItem('redirectPath');
      const redirectPath = savedRedirectPath || defaultRedirectPath;
      
      // Limpiar la ruta guardada
      sessionStorage.removeItem('redirectPath');
      
      // Log para debugging (remover en producción)
      if (process.env.NODE_ENV === 'development') {
        console.debug('Login exitoso, redirigiendo a:', redirectPath, loginData);
      }
      
      // Pequeño delay para asegurar que el estado se actualice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Navegar con replace para evitar problemas de historial
      navigate(redirectPath, { replace: true });
      
    } catch (error) {
      console.error('Error durante el proceso post-login:', error);
      // Fallback navigation
      navigate(defaultRedirectPath, { replace: true });
    }
  }, [navigate, defaultRedirectPath]);
  
  // Función para verificar qué propiedades acepta el componente Login
  const getLoginCapabilities = useCallback(() => {
    // Intentar determinar qué propiedades están disponibles
    const capabilities = {
      hasAppName: true, // Básico, debería estar disponible
      hasOnLoginSuccess: true, // Básico, debería estar disponible
      hasTheme: false, // Probablemente no disponible según el error
      hasFeatures: false, // Probablemente no disponible según el error
      hasLogoSrc: false, // Desconocido, puede que esté o no disponible
      hasCustomStyles: false // El core puede manejar estilos internamente
    };
    
    return capabilities;
  }, []);
  
  return {
    isSignedIn,
    isInitializing,
    loading,
    user,
    handleLoginSuccess,
    getLoginCapabilities,
    // Utility functions
    isAuthenticated: isSignedIn && !isInitializing && !loading,
    isLoading: isInitializing || loading
  };
};
