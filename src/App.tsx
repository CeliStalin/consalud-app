import { Suspense, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  AuthProvider, 
  LoadingOverlay, 
  ErrorBoundary, 
  PrivateRoute,
  PublicRoute,
  NotFound,
  HomePage,
  Login,
  MsalAuthProvider,
  MenuConfigProvider
} from '@consalud/core';
import './App.css';

// Componente de error genérico
const ErrorFallback = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>¡Ups! Algo salió mal</h2>
    <p>Ha ocurrido un error inesperado. Intenta recargar la página.</p>
    <button 
      onClick={() => window.location.reload()}
      style={{
        padding: '8px 16px',
        borderRadius: '4px',
        backgroundColor: '#04A59B',
        color: 'white',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      Recargar página
    </button>
  </div>
);

const App = () => {
  const [isHandlingRedirect, setIsHandlingRedirect] = useState(true);
  const [redirectError, setRedirectError] = useState<string | null>(null);

  // Este efecto maneja la redirección después de la autenticación
  useEffect(() => {
    const handleRedirectPromise = async () => {
      try {
        setIsHandlingRedirect(true);
        console.log("Verificando si hay redirecciones pendientes...");
        
        // Inicializar MSAL primero
        await MsalAuthProvider.initialize();
        
        // Detectar si venimos de una redirección de autenticación (reemplaza AuthWrapper)
        const hasAuthRedirectParams = 
          window.location.pathname === '/login' && 
          window.location.hash && 
          window.location.hash.includes('id_token');
        
        if (hasAuthRedirectParams) {
          console.log('Detectada redirección de autenticación, guardando estado');
          localStorage.setItem('isLogin', 'true');
          sessionStorage.setItem('authMethod', 'redirect');
        }
        
        // Manejar la redirección
        const response = await MsalAuthProvider.handleRedirectPromise();
        console.log("Respuesta de redirección:", response ? "Obtenida" : "No hay respuesta");
        
        if (response) {
          console.log("Redirección procesada correctamente");
          
          // Si hay una cuenta, estamos autenticados
          if (response.account) {
            console.log("Usuario autenticado:", response.account.username);
            localStorage.setItem('isLogin', 'true');
            sessionStorage.setItem('authMethod', 'redirect');
            
            // Si estamos en /login, redirigir al home
            if (window.location.pathname === '/login') {
              console.log("Redirigiendo a /home después de autenticación");
              window.location.href = '/home';
              return; // Detener ejecución para permitir la redirección
            }
          }
        }
      } catch (error) {
        console.error('Error al manejar redirección:', error);
        setRedirectError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setIsHandlingRedirect(false);
      }
    };
    
    handleRedirectPromise();
  }, []);

  // Mostrar loading mientras se maneja la redirección
  if (isHandlingRedirect) {
    return (
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '30px',
          borderRadius: '8px',
          backgroundColor: 'white',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <LoadingOverlay show message="Verificando sesión..." />
          
          {redirectError && (
            <div style={{ 
              marginTop: '20px', 
              color: '#dc3545',
              padding: '10px',
              border: '1px solid #dc3545',
              borderRadius: '4px',
              backgroundColor: 'rgba(220, 53, 69, 0.1)',
              width: '100%',
              textAlign: 'center'
            }}>
              <p>Error al procesar la autenticación:</p>
              <p style={{ fontWeight: 'bold' }}>{redirectError}</p>
              <button 
                onClick={() => window.location.href = '/login'}
                style={{
                  marginTop: '10px',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#04A59B',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Volver a intentar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <AuthProvider>
        <MenuConfigProvider config={{ enableDynamicMenu: true }}>
          <Router>
            <Suspense fallback={<LoadingOverlay show message="Cargando aplicación..." />}>
              <Routes>
                {/* Ruta raíz redirecciona a /home */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                
                {/* Ruta de login - especificamos explícitamente redirectPath */}
                <Route path="/login" element={
                  <PublicRoute redirectPath="/home">
                    <Login />
                  </PublicRoute>
                } />
                
                {/* Ruta principal */}
                <Route path="/home" element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                } />
                
                {/* Ruta 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </MenuConfigProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;