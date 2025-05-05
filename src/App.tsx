import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  AuthProvider, 
  LoadingOverlay, 
  ErrorBoundary, 
  PrivateRoute,
  PublicRoute,
  NotFound,
  HomePage,
  Login
  
} from '@consalud/core';
import { MenuConfigProvider } from './contex/MenuConfigContext';
import EjemploPage from './features/ejemplo/components/EjemploPage';
import './App.css';

// Componente de error genérico
const ErrorFallback: React.FC = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>¡Ups! Algo salió mal</h2>
    <p>Ha ocurrido un error inesperado. Intenta recargar la página.</p>
    <button onClick={() => window.location.reload()}>
      Recargar página
    </button>
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <AuthProvider>
        <MenuConfigProvider 
          config={{ enableDynamicMenu: true }}
        >
          <Router>
            <Suspense fallback={<LoadingOverlay show message="Cargando aplicación..." />}>
              <Routes>
                {/* Ruta raíz redirecciona a /home */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                
                {/* Agregar explícitamente la ruta de login */}
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                
                {/* Ruta principal */}
                <Route path="/home" element={
                  <PrivateRoute>
                    <HomePage />
                  </PrivateRoute>
                } />
                
                {/* Ruta de ejemplo */}
                <Route path="/ejemplo" element={
                  <PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
                    <EjemploPage />
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
}

export default App;