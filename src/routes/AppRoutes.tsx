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

// Loading super simple - sin animaciones que puedan causar parpadeos
const SimpleLoading: React.FC = React.memo(() => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '200px',
    fontSize: '14px',
    color: '#666'
  }}>
    Cargando...
  </div>
));

SimpleLoading.displayName = 'SimpleLoading';

// Simplificar el wrapper - el Core maneja las transiciones automáticamente
const PageWrapper: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  return (
    <div className="page-wrapper" style={{ 
      minHeight: '100vh',
      // Estilos básicos para mejorar la experiencia visual
      opacity: 1,
      transition: 'opacity 0.1s ease-out'
    }}>
      {children}
    </div>
  );
});

PageWrapper.displayName = 'PageWrapper';

export const AppRoutes = () => {
  const { isAuthenticated, isLoading, handleLoginSuccess } = useAuthWithRedirect({
    defaultRedirectPath: '/home',
    protectedPaths: ['/mnherederos', '/home'],
    publicPaths: ['/login']
  });

  const location = useLocation();

  // Loading state ultra simple
  const loadingComponent = useMemo(() => (
    <SimpleLoading />
  ), []);

  if (isLoading) {
    return loadingComponent;
  }

  return (
    // Simplificar Suspense - el Core maneja las transiciones
    <Suspense fallback={<SimpleLoading />}>
      <Routes location={location}>
        {/* Rutas Públicas */}
        <Route 
          path="/login" 
          element={
            <ConsaludCore.PublicRoute>
              <PageWrapper>
                <ConsaludCore.Login 
                  appName="Sistema de Gestión de Herederos"
                  onLoginSuccess={handleLoginSuccess}
                />
              </PageWrapper>
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
        
        {/* Rutas Privadas - simplificadas */}
        <Route 
          path="/home"
          element={
            <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
              <PageWrapper>
                <ConsaludCore.HomePage />
              </PageWrapper>
            </ConsaludCore.PrivateRoute>
          }
        />
        
        {/* Rutas específicas de herederos - limpias y simples */}
        <Route path="/mnherederos/ingresoher" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <PageWrapper>
              <IngresoTitularPage />
            </PageWrapper>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/dashboard" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <PageWrapper>
              <IngresoHerederosPage />
            </PageWrapper>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/ingresotitular" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <PageWrapper>
              <IngresoTitularPage />
            </PageWrapper>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/RequisitosTitular" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <PageWrapper>
              <InfoRequisitosTitularPage />
            </PageWrapper>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/DatosTitular" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <PageWrapper>
              <DatosTitularPage />
            </PageWrapper>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/RegistroTitular" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <PageWrapper>
              <IngresoHerederoFormPage />
            </PageWrapper>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/RegistroHeredero" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <PageWrapper>
              <RegistroHerederoPage />
            </PageWrapper>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/formingreso" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <PageWrapper>
              <IngresoHerederoFormPage />
            </PageWrapper>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/cargadoc" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <PageWrapper>
              <IngresoDocumentosPage />
            </PageWrapper>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/detallemandato" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <PageWrapper>
              <DetalleMandatoPage />
            </PageWrapper>
          </ConsaludCore.PrivateRoute>
        } />
        
        <Route path="/mnherederos/ingresoher/success" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <PageWrapper>
              <SuccessPage />
            </PageWrapper>
          </ConsaludCore.PrivateRoute>
        } />

        {/* Rutas de manejo de errores */}
        <Route path="/unauthorized" element={
          <PageWrapper>
            <ConsaludCore.Unauthorized />
          </PageWrapper>
        } />
        
        <Route path="/not-found" element={
          <PageWrapper>
            <ConsaludCore.NotFound />
          </PageWrapper>
        } />
        
        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Routes>
    </Suspense>
  );
};