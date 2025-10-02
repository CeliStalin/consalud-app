import { CollapseOnRoute } from '@/features/herederos/components/CollapseOnRoute';
import {
  ProtectedRoute as CoreProtectedRoute,
  HomePage,
  Login,
  MenuCollapseProvider,
  NotFound,
  Unauthorized,
  useMenuCollapse,
} from '@consalud/core';
import React, { useMemo } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';
import { ButtonLockingProviderWrapper } from '../features/herederos/provider/ButtonLockingProvider';
import HerederoProvider from '../features/herederos/provider/HerederoProvider';
import TitularProvider from '../features/herederos/provider/TitularProvider';
import { useAuthWithRedirect } from '../hooks/useAuthWithRedirect';
import CargaDocumentoPage from '../pages/CargaDocumentoPage';
import MandatosPage from '../pages/MandatosPage';
import { SyncedLayout as CoreSyncedLayout } from './SyncedLayout';

// Importaciones directas para evitar flash blanco
import DatosTitularPage from '../pages/DatosTitularPage';
import DetalleMandatoPage from '../pages/DetalleMandatoPage';
import ErrorPage from '../pages/ErrorPage';
import InfoRequisitosTitularPage from '../pages/InfoRequisitosTitularPage';
import IngresoHerederoFormPage from '../pages/IngresoHerederoFormPage';
import IngresoTitularPage from '../pages/IngresoTitularPage';
import RegistroHerederoPage from '../pages/RegistroHerederoPage';
import SuccessPage from '../pages/SuccessPage';

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
  const { isMenuCollapsed } = useMenuCollapse();
  // Todas las rutas sin margen lateral
  const hideSidebar = true;
  const transitionClass = `page-transition page-transition--minimal${!hideSidebar ? (isMenuCollapsed ? ' sidebar-collapsed' : ' sidebar-expanded') : ''}`;
  return (
    <main className={`instant-stable navigation-stable no-flash${!hideSidebar ? (isMenuCollapsed ? ' sidebar-collapsed' : ' sidebar-expanded') : ''}`}>
      <PageTransition className={transitionClass}>
        {children}
      </PageTransition>
    </main>
  );
});

StablePageWrapper.displayName = 'StablePageWrapper';

// Optimized HomePage wrapper
const HomePageWithCollapse: React.FC<{ onCardClick?: (...args: any[]) => void }> = (props) => {
  const { collapseMenu } = useMenuCollapse();

  const handleApplicationClick = (...args: any[]) => {
    collapseMenu();
    if (props.onCardClick) props.onCardClick(...args);
  };

  return (
    <HomePage
      {...props}
      onCardClick={handleApplicationClick}
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
const HerederosLayout: React.FC = () => (
  <CoreProtectedRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
    <TitularProvider>
      <HerederoProvider>
        <ButtonLockingProviderWrapper
          showNotification={false}
          showOverlay={false}
          showTopBar={false}
        >
          <CollapseOnRoute>
            <Outlet />
          </CollapseOnRoute>
        </ButtonLockingProviderWrapper>
      </HerederoProvider>
    </TitularProvider>
  </CoreProtectedRoute>
);

// Debug SyncedLayout
const SyncedLayout = (props) => {
  return <CoreSyncedLayout {...props} />;
};

interface AppRoutesProps {
  logo: string;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ logo }) => {
  const { isAuthenticated, isLoading, handleLoginSuccess } = useAuthWithRedirect({
    defaultRedirectPath: '/home',
    protectedPaths: ['/mnherederos', '/home'],
    publicPaths: ['/login']
  });

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
    <MenuCollapseProvider>
      <Routes>
        {/* Rutas Públicas */}
        <Route
          path="/login"
          element={
            <CoreProtectedRoute isPublic={true}>
              <StablePageWrapper>
                <Login
                  appName="sistema gestión de solicitudes"
                  onLoginSuccess={handleLoginSuccess}
                  logoSrc={logo}
                />
              </StablePageWrapper>
            </CoreProtectedRoute>
          }
        />

        {/* Resto de la app con SyncedLayout */}
        <Route
          path="*"
          element={
            <SyncedLayout logo={logo}>
              <Routes>
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
                    <CoreProtectedRoute allowedRoles={['USER', 'ADMIN', 'Developers']}>
                      <HomePageWithCollapse />
                    </CoreProtectedRoute>
                  }
                />
                {/* Rutas del módulo de herederos - refactorizadas */}
                <Route
                  path="/mnherederos/*"
                  element={<HerederosLayout />}
                >
                  <Route index element={<IngresoTitularPage />} />
                  <Route path="ingresoher" element={<IngresoTitularPage />} />
                  <Route path="ingresoher/ingresotitular" element={<IngresoTitularPage />} />
                  <Route path="ingresoher/RequisitosTitular" element={<InfoRequisitosTitularPage />} />
                  <Route path="ingresoher/DatosTitular" element={<DatosTitularPage />} />
                  <Route path="ingresoher/RegistroTitular" element={<RegistroHerederoPage />} />
                  <Route path="ingresoher/RegistroHeredero" element={<RegistroHerederoPage />} />
                  <Route path="ingresoher/formingreso" element={<IngresoHerederoFormPage />} />                  <Route path="ingresoher/cargadoc" element={<CargaDocumentoPage />} />
                  <Route path="ingresoher/mandatos" element={<MandatosPage />} />
                  <Route path="ingresoher/detallemandato" element={<DetalleMandatoPage />} />
                  <Route path="ingresoher/success" element={<SuccessPage />} />
                  <Route path="ingresoher/error" element={<ErrorPage />} />
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
                <Route
                  path="/mnHerederos/IngresoHer"
                  element={<Navigate to="/mnherederos/ingresoher/ingresotitular" replace />}
                />
                {/* Rutas de error */}
                <Route
                  path="/unauthorized"
                  element={
                    <StablePageWrapper>
                      <Unauthorized />
                    </StablePageWrapper>
                  }
                />
                <Route
                  path="/not-found"
                  element={
                    <StablePageWrapper>
                      <NotFound/>
                    </StablePageWrapper>
                  }
                />
                <Route path="*" element={<Navigate to="/not-found" replace />} />
              </Routes>
            </SyncedLayout>
          }
        />
      </Routes>
    </MenuCollapseProvider>
  );
};
