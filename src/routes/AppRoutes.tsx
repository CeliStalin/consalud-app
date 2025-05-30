import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

// Componente principal de rutas de la aplicación
export const AppRoutes = () => {
  const { isSignedIn, isInitializing, loading } = ConsaludCore.useAuth();

  if (isInitializing || loading) {
    return <ConsaludCore.LoadingOverlay show={true} message="Cargando aplicación..." />;
  }

  return (
    <Suspense fallback={<ConsaludCore.LoadingOverlay show={true} message="Cargando página..." />}>
      <Routes>
        {/* Rutas Públicas */}
        <Route 
          path="/login" 
          element={
            <ConsaludCore.PublicRoute>
              <ConsaludCore.Login 
                appName="Mi Aplicación Consalud" 
                logoSrc="/path/to/your/logo.png"
                onLoginSuccess={() => { /* Lógica después del login exitoso */ }}
              />
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
              <ConsaludCore.HomePage />
            </ConsaludCore.PrivateRoute>
          }
        />
        
        {/* Rutas específicas de la aplicación - REORGANIZADAS */}
        
        {/* Ruta principal de Ingreso Herederos - ahora va directo al proceso */}
        <Route path="/mnherederos/ingresoher" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <IngresoTitularPage />
          </ConsaludCore.PrivateRoute>
        } />
        
        {/* Ruta para la página de bienvenida/dashboard (opcional) */}
        <Route path="/mnherederos/dashboard" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <IngresoHerederosPage />
          </ConsaludCore.PrivateRoute>
        } />
        
        {/* Resto de rutas del flujo mantienen su orden lógico */}
        <Route path="/mnherederos/ingresoher/ingresotitular" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <IngresoTitularPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/RequisitosTitular" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <InfoRequisitosTitularPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/DatosTitular" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <DatosTitularPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/RegistroTitular" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <IngresoHerederoFormPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/RegistroHeredero" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RegistroHerederoPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/formingreso" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <IngresoHerederoFormPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/cargadoc" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <IngresoDocumentosPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/detallemandato" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <DetalleMandatoPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/success" element={
          <ConsaludCore.PrivateRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <SuccessPage />
          </ConsaludCore.PrivateRoute>
        } />

        {/* Ruta No Autorizado */}
        <Route path="/unauthorized" element={<ConsaludCore.Unauthorized />} />

        {/* Ruta No Encontrado (Catch-all) */}
        <Route path="*" element={<ConsaludCore.NotFound />} />
      </Routes>
    </Suspense>
  );
};