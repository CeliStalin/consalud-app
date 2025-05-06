import { useEffect, ReactNode } from 'react';

// Definimos el tipo para las props
interface AuthWrapperProps {
  children: ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const location = window.location;
  
  useEffect(() => {
    // Detectar si venimos de una redirección de autenticación
    if (location.pathname === '/login' && location.hash && location.hash.includes('id_token')) {
      console.log('Detectada redirección de autenticación, guardando estado');
      localStorage.setItem('isLogin', 'true');
      sessionStorage.setItem('authMethod', 'redirect');
    }
  }, [location]);

  return <>{children}</>;
};

export default AuthWrapper;