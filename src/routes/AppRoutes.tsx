import React, { Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';

// Lazy load pages
const IngresoHerederosPage = React.lazy(() => import('../pages/IngresoHerederosPage'));
const IngresoTitularPage = React.lazy(() => import('../pages/IngresoTitularPage'));
const InfoRequisitosTitularPage = React.lazy(() => import('../pages/InfoRequisitosTitularPage'));
const DatosTitularPage = React.lazy(() => import('../pages/DatosTitularPage'));
const RegistroHerederoPage = React.lazy(() => import('../pages/RegistroHerederoPage'));
const IngresoHerederoFormPage = React.lazy(() => import('../pages/IngresoHerederoFormPage'));
const IngresoDocumentosPage = React.lazy(() => import('../pages/IngresoDocumentosPage'));
const SuccessPage = React.lazy(() => import('../pages/SuccessPage'));
const DetalleMandatoPage = React.lazy(() => import('../pages/DetalleMandatoPage'));

// Configuraciones de transición por ruta
const TRANSITION_CONFIGS = {
  '/mnherederos/ingresoher': {
    preset: 'slideLeft' as const,
    duration: 350,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  '/home': {
    preset: 'fadeIn' as const,
    duration: 250,
    easing: 'ease-in-out'
  },
  '/success': {
    preset: 'scale' as const,
    duration: 400,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  default: {
    preset: 'fadeIn' as const,
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const;

// Hook mejorado para configuración de transiciones
const usePageTransitionConfig = () => {
  const location = useLocation();
  
  return React.useMemo(() => {
    // Buscar configuración específica
    for (const [path, config] of Object.entries(TRANSITION_CONFIGS)) {
      if (path !== 'default' && location.pathname.includes(path)) {
        return config;
      }
    }
    return TRANSITION_CONFIGS.default;
  }, [location.pathname]);
};

// Componente de Loading personalizado
const TransitionAwareLoading: React.FC<{ message?: string }> = ({ 
  message = "Cargando página..." 
}) => {
  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        transition: 'opacity 200ms ease-in-out'
      }}
    >
      <ConsaludCore.LoadingOverlay show={true} message={message} />
    </div>
  );
};

// Wrapper simplificado para rutas con transiciones
const RouteWithTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const transitionConfig = usePageTransitionConfig();
  
  // Aplicar configuración de transición de manera segura
  React.useEffect(() => {
    // Verificar si el método existe antes de usarlo
    if (typeof ConsaludCore.usePageTransition === 'function') {
      try {
        // Solo intentar actualizar si está disponible
        const transitionHook = ConsaludCore.usePageTransition?.();
        if (transitionHook?.updateConfig) {
          transitionHook.updateConfig(transitionConfig);
        }
      } catch (error) {
        // Fallar silenciosamente si no está disponible
        console.debug('PageTransition no disponible:', error);
      }
    }
  }, [transitionConfig]);
  
  return <>{children}</>;
};

// Componente principal de rutas de la aplicación
export const AppRoutes = () => {
  const { isSignedIn, isInitializing, loading } = ConsaludCore.useAuth();

  if (isInitializing || loading) {
    return <TransitionAwareLoading message="Cargando aplicación..." />;
  }

  return (
    <Suspense fallback={<TransitionAwareLoading message="Cargando página..." />}>
      <Routes>
        {/* Rutas Públicas */}
        <Route 
          path="/login" 
          element={
            <ConsaludCore.PublicRoute>
              <RouteWithTransition>
                <ConsaludCore.Login 
                  appName="Mi Aplicación Consalud" 
                  logoSrc="/path/to/your/logo.png"
                  onLoginSuccess={() => { /* Lógica después del login exitoso */ }}
                />
              </RouteWithTransition>
            </ConsaludCore.PublicRoute>
          } 
        />

        {/* Ruta Raíz */}
        <Route 
          path="/" 
          element={
            isSignedIn ? <Navigate to="/home" /> : <Navigate to="/login" />
          } 
        />
        
        {/* Rutas Privadas */}
        <Route 
          path="/home"
          element={
            <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
              <RouteWithTransition>
                <ConsaludCore.HomePage />
              </RouteWithTransition>
            </ConsaludCore.PrivateRoute>
          }
        />
        
        {/* Rutas específicas de la aplicación - Con transiciones del core */}
        
        {/* Ruta principal de Ingreso Herederos */}
        <Route path="/mnherederos/ingresoher" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RouteWithTransition>
              <IngresoTitularPage />
            </RouteWithTransition>
          </ConsaludCore.PrivateRoute>
        } />
        
        {/* Ruta para la página de bienvenida/dashboard */}
        <Route path="/mnherederos/dashboard" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RouteWithTransition>
              <IngresoHerederosPage />
            </RouteWithTransition>
          </ConsaludCore.PrivateRoute>
        } />
        
        {/* Resto de rutas del flujo con transiciones del core */}
        <Route path="/mnherederos/ingresoher/ingresotitular" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RouteWithTransition>
              <IngresoTitularPage />
            </RouteWithTransition>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/RequisitosTitular" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RouteWithTransition>
              <InfoRequisitosTitularPage />
            </RouteWithTransition>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/DatosTitular" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RouteWithTransition>
              <DatosTitularPage />
            </RouteWithTransition>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/RegistroTitular" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RouteWithTransition>
              <IngresoHerederoFormPage />
            </RouteWithTransition>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/RegistroHeredero" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RouteWithTransition>
              <RegistroHerederoPage />
            </RouteWithTransition>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/formingreso" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RouteWithTransition>
              <IngresoHerederoFormPage />
            </RouteWithTransition>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/cargadoc" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RouteWithTransition>
              <IngresoDocumentosPage />
            </RouteWithTransition>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/detallemandato" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RouteWithTransition>
              <DetalleMandatoPage />
            </RouteWithTransition>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/success" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RouteWithTransition>
              <SuccessPage />
            </RouteWithTransition>
          </ConsaludCore.PrivateRoute>
        } />

        {/* Rutas de manejo de errores */}
        <Route path="/unauthorized" element={
          <RouteWithTransition>
            <ConsaludCore.Unauthorized />
          </RouteWithTransition>
        } />

        {/* Ruta No Encontrado (Catch-all) */}
        <Route path="*" element={
          <RouteWithTransition>
            <ConsaludCore.NotFound />
          </RouteWithTransition>
        } />
      </Routes>
    </Suspense>
  );
};