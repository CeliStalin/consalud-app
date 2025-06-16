import React, { Suspense, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';
import { useAuthWithRedirect } from '../hooks/useAuthWithRedirect';
import { useMenuCollapse } from '@consalud/core';
import CargaDocumentoPage from '../pages/CargaDocumentoPage';

// Lazy loading optimizado - SIN preloading que pueda causar conflictos
//const IngresoHerederosPage = React.lazy(() => import('../pages/IngresoHerederosPage'));
const IngresoTitularPage = React.lazy(() => import('../pages/IngresoTitularPage'));
const InfoRequisitosTitularPage = React.lazy(() => import('../pages/InfoRequisitosTitularPage'));
const DatosTitularPage = React.lazy(() => import('../pages/DatosTitularPage'));
const RegistroHerederoPage = React.lazy(() => import('../pages/RegistroHerederoPage'));
const IngresoHerederoFormPage = React.lazy(() => import('../pages/IngresoHerederoFormPage'));
const IngresoDocumentosPage = React.lazy(() => import('../pages/IngresoDocumentosPage'));
const SuccessPage = React.lazy(() => import('../pages/SuccessPage'));
const DetalleMandatoPage = React.lazy(() => import('../pages/DetalleMandatoPage'));

// Loading optimizado para eliminar parpadeos
const OptimizedLoading: React.FC = React.memo(() => (
  <div className="suspense-fallback">
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      fontSize: '14px',
      color: '#666',
      background: '#ffffff', 
      width: '100%',
      position: 'relative'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #04A59B',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        Cargando...
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
));

OptimizedLoading.displayName = 'OptimizedLoading';

// Wrapper optimizado para prevenir parpadeos
const StablePageWrapper: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  return (
    <div className="route-container layout-stable">
      <div className="page-transition-wrapper">
        {children}
      </div>
    </div>
  );
});

StablePageWrapper.displayName = 'StablePageWrapper';

// Wrapper para HomePage que colapsa el menú al hacer clic en una app
const HomePageWithCollapse = (props) => {
  const { collapseMenu } = useMenuCollapse();
  
  const handleApplicationClick = (...args) => {
    collapseMenu();
    // Si HomePage espera argumentos en onApplicationClick, los puedes pasar aquí
    if (props.onApplicationClick) props.onApplicationClick(...args);
  };

  return (
    <ConsaludCore.HomePage
      {...props}
      onApplicationClick={handleApplicationClick}
      withLayout={false}
      enableBounce={true}
      showWelcomeSection={true}
      showApplicationsSection={true}
      showDirectAccessSection={true}
      bounceIntensity="medium"
      animationDuration={300}
    />
  );
};

// Layout wrapper para las subrutas de herederos
const HerederosLayout = () => (
  <ConsaludCore.ProtectedRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
    <Outlet />
  </ConsaludCore.ProtectedRoute>
);

export const AppRoutes = () => {
  const { isAuthenticated, isLoading, handleLoginSuccess } = useAuthWithRedirect({
    defaultRedirectPath: '/home',
    protectedPaths: ['/mnherederos', '/home'],
    publicPaths: ['/login']
  });

  const location = useLocation();

  // Loading state optimizado
  const loadingComponent = useMemo(() => (
    <OptimizedLoading />
  ), []);

  if (isLoading) {
    return (
      <div className="loading-overlay">
        {loadingComponent}
      </div>
    );
  }

  return (
    <Suspense fallback={<div style={{ display: 'none' }} />}>
      <Routes location={location}>
        {/* Rutas Públicas */}
        <Route 
          path="/login" 
          element={
            <ConsaludCore.PublicRoute>
              <StablePageWrapper>
                <ConsaludCore.Login 
                  appName="Sistema de Gestión de Herederos"
                  onLoginSuccess={handleLoginSuccess}
                />
              </StablePageWrapper>
            </ConsaludCore.PublicRoute>
          } 
        />

        {/* Ruta Raíz */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
          } 
        />
        
        {/* Ruta Home - HomePage del Core */}
        <Route 
          path="/home"
          element={
            <ConsaludCore.ProtectedRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
              <HomePageWithCollapse />
            </ConsaludCore.ProtectedRoute>
          } 
        />
        
        {/* Rutas del módulo de herederos - refactorizadas */}
        <Route path="/mnherederos/*" element={<HerederosLayout />}>
          <Route index element={<IngresoTitularPage />} />
          <Route path="ingresoher" element={<IngresoTitularPage />} />
          <Route path="ingresoher/ingresotitular" element={<IngresoTitularPage />} />
          <Route path="ingresoher/RequisitosTitular" element={<InfoRequisitosTitularPage />} />
          <Route path="ingresoher/DatosTitular" element={<DatosTitularPage />} />
          <Route path="ingresoher/RegistroTitular" element={<RegistroHerederoPage />} />
          <Route path="ingresoher/RegistroHeredero" element={<RegistroHerederoPage />} />
          <Route path="ingresoher/formingreso" element={<IngresoHerederoFormPage />} />
          <Route path="ingresoher/cargadoc" element={<CargaDocumentoPage />} />
          <Route path="ingresoher/detallemandato" element={<DetalleMandatoPage />} />
          <Route path="ingresoher/success" element={<SuccessPage />} />
          <Route path="ingresoher/IngresoDocumentos" element={<IngresoDocumentosPage />} />
        </Route>

        {/* Redirección para rutas con mayúsculas (compatibilidad) */}
        <Route 
          path="/mnHerederos/*"
          element={<Navigate to="/mnherederos/ingresoher/ingresotitular" replace />} 
        />
        <Route 
          path="/mnHerederos/IngresoHer/*"
          element={<Navigate to="/mnherederos/ingresoher/ingresotitular" replace />} 
        />

        {/* Rutas de error */}
        <Route 
          path="/unauthorized" 
          element={
            <StablePageWrapper>
              <ConsaludCore.Unauthorized />
            </StablePageWrapper>
          } 
        />
        
        <Route 
          path="/not-found" 
          element={
            <StablePageWrapper>
              <ConsaludCore.NotFound/>
            </StablePageWrapper>
          } 
        />
        
        {/* Fallback para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Suspense>
  );
};