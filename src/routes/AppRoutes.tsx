import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { 
  LoadingOverlay, 
  PrivateRoute, 
  PublicRoute, 
  NotFound, 
  useAuth,
  Login,
  Unauthorized,
  HomePage, // Importar HomePage del core
} from '@consalud/core';
import { ApiGetMenus } from '@consalud/core';

// Mapeo de componentes dinámicos (según los nombres de controlador/acción de la API)
const dynamicComponentMap: Record<string, React.ComponentType<any>> = {
  // Formato: 'ControladorAccion': ComponenteReact
  'MnHerederosIngresoHer': React.lazy(() => import('../pages/IngresoHerederosPage')),
  'MnHerederosIngresoDoc': React.lazy(() => import('../pages/IngresoDocumentosPage')),
  // Añadir más mapeos según necesidad
};

// Descomenta y ajusta las rutas estáticas
const staticRoutes = [
  {
    path: '/home',
    component: HomePage, // Usa el HomePage del core
    roles: ['USER', 'ADMIN', 'Developers'],
    title: 'Inicio'
  }
  // Puedes añadir más rutas estáticas aquí
];

const AppRoutes: React.FC = () => {
  const { roles, isSignedIn } = useAuth();
  const [dynamicRoutes, setDynamicRoutes] = useState<Array<{path: string, component: React.ComponentType<any>, roles: string[]}>>([]);
  const [loading, setLoading] = useState(true);

  // Efecto para cargar rutas dinámicas basadas en los roles
  useEffect(() => {
    const fetchDynamicRoutes = async () => {
      try {
        if (!isSignedIn || roles.length === 0) {
          setLoading(false);
          return;
        }

        // Verificar si hay rol de desarrollador (o el rol principal que necesites)
        const devRole = roles.find(role => role.Rol === 'Developers');
        
        if (!devRole) {
          console.log("No se encontró el rol necesario para cargar menús dinámicos");
          setLoading(false);
          return;
        }

        // Obtener elementos de menú para este rol
        const menuItems = await ApiGetMenus(devRole.Rol);
        
        if (!menuItems || menuItems.length === 0) {
          console.log("No se encontraron elementos de menú para este rol");
          setLoading(false);
          return;
        }

        // Transformar elementos de menú en rutas
        const routesFromMenu = menuItems.map(item => {
          // Crear key para el mapa de componentes
          const componentKey = `${item.Controlador}${item.Accion}`;
          // Ruta formateada
          const routePath = `/${item.Controlador.toLowerCase()}/${item.Accion.toLowerCase()}`;
          
          return {
            path: routePath,
            component: dynamicComponentMap[componentKey] || NotFound, // Usar NotFound si no hay mapeo
            roles: [devRole.Rol],
            menuItem: item // Guardar referencia al ítem original
          };
        });

        setDynamicRoutes(routesFromMenu);
        console.log(`Cargadas ${routesFromMenu.length} rutas dinámicas`);
      } catch (error) {
        console.error('Error al cargar rutas dinámicas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDynamicRoutes();
  }, [isSignedIn, roles]);

  // Renderizar cargador mientras se obtienen las rutas
  if (loading) {
    return <LoadingOverlay show message="Cargando rutas..." />;
  }

  return (
    <Suspense fallback={<LoadingOverlay show message="Cargando..." />}>
      <Routes>
        {/* Redirección de la ruta raíz al home */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Rutas públicas */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Rutas estáticas */}
        {staticRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <PrivateRoute allowedRoles={route.roles}>
                <route.component />
              </PrivateRoute>
            }
          />
        ))}
        
        {/* Rutas dinámicas basadas en API */}
        {dynamicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <PrivateRoute allowedRoles={route.roles}>
                <route.component />
              </PrivateRoute>
            }
          />
        ))}
        
        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;