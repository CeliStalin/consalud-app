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
  HomePage
} from '@consalud/core';
import { ApiGetMenus } from '@consalud/core';
import DetalleMandatoPage from '../pages/DetalleMandatoPage';


// Importar páginas de la aplicación
import IngresoHerederosPage from '../pages/IngresoHerederosPage';
import IngresoHerederoFormPage from '../pages/IngresoHerederoFormPage';
import IngresoDocumentosPage from '../pages/IngresoDocumentosPage';
import SuccessPage from '../pages/SuccessPage';
import { IngresoTitularPage } from '@/pages/IngresoTitularPage';
import { InfoRequisitosTitularPage } from '@/pages/InfoRequisitosTitularPage';
import { DatosTitullarPage } from '@/pages/DatosTitularPage';
import { RegistroTitularPage } from '@/pages/RegistroHerederoPage';
import { CargaDocumentoPage } from '@/pages/CargaDocumentoPage'
// Mapeo de componentes dinámicos (según los nombres de controlador/acción de la API)
// Formatos alternativos para incrementar las posibilidades de coincidencia
const dynamicComponentMap: Record<string, React.ComponentType<any>> = {
  // Formato con slash: 'Controlador/Accion'
  'MnHerederos/ingresoHer': IngresoHerederosPage,
  'MnHerederos/ingresoDoc': IngresoDocumentosPage,
  // Formato en minúsculas para mayor compatibilidad
  'mnherederos/ingresoher': IngresoHerederosPage,
  'mnherederos/ingresodoc': IngresoDocumentosPage,
  // Formato sin slash para retrocompatibilidad
  'MnHerederosIngresoHer': IngresoHerederosPage,
  'MnHerederosIngresoDoc': IngresoDocumentosPage,
  'MnHerederosCargaDoc' : CargaDocumentoPage,
};

// rutas estáticas
const staticRoutes = [
  {
    path: '/home',
    component: HomePage, // Usa el HomePage del core
    roles: ['USER', 'ADMIN', 'Developers'],
    title: 'Inicio'
  },
  // Nueva ruta para el ingreso Del Titular 
  {
    path: '/mnherederos/ingresoher/IngresoDelTitular',
    component: IngresoTitularPage,
    roles: ['USER', 'ADMIN', 'Developers'],
    title: 'Formulario Ingreso Heredero'
  },
  {
    path: '/mnherederos/ingresoher/RequisitosTitular',
    component: InfoRequisitosTitularPage,
    roles: ['USER', 'ADMIN', 'Developers'],
    title: 'Formulario Ingreso Heredero'
  },  {
    path: '/mnherederos/ingresoher/RegistroTitular',
    component: RegistroTitularPage,
    roles: ['USER', 'ADMIN', 'Developers'],
    title: 'Formulario Ingreso Heredero'
  },
  {
    path: '/mnherederos/ingresoher/DatosTitular',
    component: DatosTitullarPage,
    roles: ['USER', 'ADMIN', 'Developers'],
    title: 'Formulario Ingreso Heredero'
  },
  {
    path: '/mnherederos/ingresoher/formingreso',
    component: IngresoHerederoFormPage,
    roles: ['USER', 'ADMIN', 'Developers'],
    title: 'Formulario Ingreso Heredero'
  },
  // Ruta para la página de éxito
  {
    path: '/mnherederos/ingresoher/success',
    component: SuccessPage,
    roles: ['USER', 'ADMIN', 'Developers'],
    title: 'Registro Exitoso'
  },
  // Ruta para carga de documentos
  {
    path: '/mnherederos/ingresoher/cargadoc',
    component: CargaDocumentoPage,
    roles: ['USER', 'ADMIN', 'Developers'],
    title: 'Carga Documentos'
  },
  {
    path: '/mnherederos/ingresoher/detallemandato',
    component: DetalleMandatoPage,
    roles: ['USER', 'ADMIN', 'Developers'],
    title: 'Detalle Mandato'
  },
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
          // CLAVE: Probar diferentes formatos para encontrar coincidencia
          const controlador = item.Controlador;
          const accion = item.Accion;
          
          // Intentar diferentes formatos para encontrar coincidencia
          const componentKey1 = `${controlador}/${accion}`; // Formato con slash
          const componentKey2 = `${controlador}${accion}`; // Formato sin slash
          const componentKey3 = `${controlador.toLowerCase()}/${accion.toLowerCase()}`; // En minúsculas
          
          // Buscar componente en cualquiera de los formatos
          let component = 
            dynamicComponentMap[componentKey1] || 
            dynamicComponentMap[componentKey2] || 
            dynamicComponentMap[componentKey3];
          
          // Si no se encontró, mostrar en consola para debug
          if (!component) {
            console.warn(`No se encontró componente para: ${controlador}/${accion}. Claves probadas:`, 
              componentKey1, componentKey2, componentKey3);
            component = NotFound;
          } else {
            console.log(`Componente encontrado para ruta: ${controlador}/${accion}`);
          }
          
          // Ruta formateada para la URL
          const routePath = `/${controlador.toLowerCase()}/${accion.toLowerCase()}`;
          
          return {
            path: routePath,
            component: component,
            roles: [devRole.Rol],
            menuItem: item // Guardar referencia al ítem original
          };
        });

        setDynamicRoutes(routesFromMenu);
        console.log(`Cargadas ${routesFromMenu.length} rutas dinámicas:`, 
          routesFromMenu.map(r => r.path).join(', '));
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