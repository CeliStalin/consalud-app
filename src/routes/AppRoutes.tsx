import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';
import DetalleMandatoPage from '../pages/DetalleMandatoPage';

// Lazy load pages
const IngresoHerederosPage = React.lazy(() => import('../pages/IngresoHerederosPage'));
const IngresoTitularPage = React.lazy(() => import('../pages/IngresoTitularPage'));
const InfoRequisitosTitularPage = React.lazy(() => import('../pages/InfoRequisitosTitularPage'));
const DatosTitullarPage = React.lazy(() => import('../pages/DatosTitularPage')); // Corregir nombre si es DatosTitularPage
const RegistroTitularPage = React.lazy(() => import('../pages/RegistroHerederoPage')); // Asumo que es RegistroHerederoPage
const IngresoHerederoFormPage = React.lazy(() => import('../pages/IngresoHerederoFormPage'));
const IngresoDocumentosPage = React.lazy(() => import('../pages/IngresoDocumentosPage'));
const SuccessPage = React.lazy(() => import('../pages/SuccessPage'));

export const AppRoutes = () => {
  const { isAuthenticated, userRoles, isLoading } = ConsaludCore.useAuth();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      if (isAuthenticated) {
        try {
          const data = await ConsaludCore.ApiGetMenus();
          setMenuItems(data);
        } catch (error) {
          console.error("Error fetching menu:", error);
        }
      }
    };
    fetchMenu();
  }, [isAuthenticated]);

  if (isLoading) {
    return <ConsaludCore.LoadingOverlay isActive={true} text="Cargando aplicación..." />;
  }

  return (
    <Suspense fallback={<ConsaludCore.LoadingOverlay isActive={true} text="Cargando página..." />}>
      <Routes>
        {/* Rutas Públicas */}
        <Route 
          path="/login" 
          element={
            <ConsaludCore.PublicRoute isAuthenticated={isAuthenticated}>
              <ConsaludCore.Login 
                appName="Mi Aplicación Consalud" 
                logoSrc="/path/to/your/logo.png" // Reemplaza con la ruta a tu logo
                onLoginSuccess={() => { /* Lógica después del login exitoso */ }}
              />
            </ConsaludCore.PublicRoute>
          } 
        />

        {/* Ruta Raíz */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />
          } 
        />
        
        {/* Rutas Privadas */}
        <Route 
          path="/home"
          element={
            <ConsaludCore.PrivateRoute isAuthenticated={isAuthenticated} userRoles={userRoles} allowedRoles={['USER', 'ADMIN', 'Developers']}>
              <ConsaludCore.HomePage 
                userName={localStorage.getItem('userName') || 'Usuario'} 
                menuItems={menuItems} 
              />
            </ConsaludCore.PrivateRoute>
          }
        />
        
        {/* Rutas específicas de la aplicación */}
        <Route path="/mnherederos/ingresoher" element={
          <ConsaludCore.PrivateRoute isAuthenticated={isAuthenticated} userRoles={userRoles} allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <IngresoHerederosPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/ingresotitular" element={
          <ConsaludCore.PrivateRoute isAuthenticated={isAuthenticated} userRoles={userRoles} allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <IngresoTitularPage />
          </ConsaludCore.PrivateRoute>
        } />
         <Route path="/mnherederos/ingresoher/RequisitosTitular" element={
          <ConsaludCore.PrivateRoute isAuthenticated={isAuthenticated} userRoles={userRoles} allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <InfoRequisitosTitularPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/DatosTitular" element={
          <ConsaludCore.PrivateRoute isAuthenticated={isAuthenticated} userRoles={userRoles} allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <DatosTitullarPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/RegistroTitular" element={
          <ConsaludCore.PrivateRoute isAuthenticated={isAuthenticated} userRoles={userRoles} allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <RegistroTitularPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/formingreso" element={
          <ConsaludCore.PrivateRoute isAuthenticated={isAuthenticated} userRoles={userRoles} allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <IngresoHerederoFormPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/cargadoc" element={
          <ConsaludCore.PrivateRoute isAuthenticated={isAuthenticated} userRoles={userRoles} allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <IngresoDocumentosPage />
          </ConsaludCore.PrivateRoute>
        } />
         <Route path="/mnherederos/ingresoher/detallemandato" element={
          <ConsaludCore.PrivateRoute isAuthenticated={isAuthenticated} userRoles={userRoles} allowedRoles={['USER', 'ADMIN', 'Developers']}>
            <DetalleMandatoPage />
          </ConsaludCore.PrivateRoute>
        } />
        <Route path="/mnherederos/ingresoher/success" element={
          <ConsaludCore.PrivateRoute isAuthenticated={isAuthenticated} userRoles={userRoles} allowedRoles={['USER', 'ADMIN', 'Developers']}>
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