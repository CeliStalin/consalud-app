import React, { Suspense, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';
import { useAuthWithRedirect } from '../hooks/useAuthWithRedirect';

// Lazy loading optimizado - SIN preloading que pueda causar conflictos
const IngresoHerederosPage = React.lazy(() => import('../pages/IngresoHerederosPage'));
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
      background: '#ffffff', // Fondo consistente
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
    // Suspense optimizado con fallback estable
    <Suspense fallback={<OptimizedLoading />}>
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
            <ConsaludCore.ProtectedRoute>
              <StablePageWrapper>
                <ConsaludCore.HomePage 
                  //appName="Sistema de Gestión de Herederos"
                 // welcomeMessage="Bienvenido al sistema de gestión de herederos"
                />
              </StablePageWrapper>
            </ConsaludCore.ProtectedRoute>
          }
        />
        
        {/* Rutas del módulo de herederos */}
        <Route 
          path="/mnherederos/ingresoher" 
          element={
            <ConsaludCore.ProtectedRoute>
              <StablePageWrapper>
                <IngresoHerederosPage />
              </StablePageWrapper>
            </ConsaludCore.ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mnherederos/dashboard" 
          element={
            <ConsaludCore.ProtectedRoute>
              <StablePageWrapper>
                <IngresoHerederosPage />
              </StablePageWrapper>
            </ConsaludCore.ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mnherederos/ingresoher/ingresotitular" 
          element={
            <ConsaludCore.ProtectedRoute>
              <StablePageWrapper>
                <IngresoTitularPage />
              </StablePageWrapper>
            </ConsaludCore.ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mnherederos/ingresoher/RequisitosTitular" 
          element={
            <ConsaludCore.ProtectedRoute>
              <StablePageWrapper>
                <InfoRequisitosTitularPage />
              </StablePageWrapper>
            </ConsaludCore.ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mnherederos/ingresoher/DatosTitular" 
          element={
            <ConsaludCore.ProtectedRoute>
              <StablePageWrapper>
                <DatosTitularPage />
              </StablePageWrapper>
            </ConsaludCore.ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mnherederos/ingresoher/RegistroTitular" 
          element={
            <ConsaludCore.ProtectedRoute>
              <StablePageWrapper>
                <RegistroHerederoPage />
              </StablePageWrapper>
            </ConsaludCore.ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mnherederos/ingresoher/RegistroHeredero" 
          element={
            <ConsaludCore.ProtectedRoute>
              <StablePageWrapper>
                <RegistroHerederoPage />
              </StablePageWrapper>
            </ConsaludCore.ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mnherederos/ingresoher/formingreso" 
          element={
            <ConsaludCore.ProtectedRoute>
              <StablePageWrapper>
                <IngresoHerederoFormPage />
              </StablePageWrapper>
            </ConsaludCore.ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mnherederos/ingresoher/cargadoc" 
          element={
            <ConsaludCore.ProtectedRoute>
              <StablePageWrapper>
                <IngresoDocumentosPage />
              </StablePageWrapper>
            </ConsaludCore.ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mnherederos/ingresoher/detallemandato" 
          element={
            <ConsaludCore.ProtectedRoute>
              <StablePageWrapper>
                <DetalleMandatoPage />
              </StablePageWrapper>
            </ConsaludCore.ProtectedRoute>
          } 
        />
        
        <Route 
          path="/mnherederos/ingresoher/success" 
          element={
            <ConsaludCore.ProtectedRoute>
              <StablePageWrapper>
                <SuccessPage />
              </StablePageWrapper>
            </ConsaludCore.ProtectedRoute>
          } 
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