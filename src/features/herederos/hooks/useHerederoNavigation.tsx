import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Definir las rutas del flujo de herederos
export const HEREDEROS_ROUTES = {
  HOME: '/home', // Agregar ruta home
  DASHBOARD: '/mnherederos/dashboard',
  INICIO_PROCESO: '/mnherederos/ingresoher',
  INGRESO_TITULAR: '/mnherederos/ingresoher/ingresotitular',
  REQUISITOS_TITULAR: '/mnherederos/ingresoher/RequisitosTitular',
  DATOS_TITULAR: '/mnherederos/ingresoher/DatosTitular',
  REGISTRO_TITULAR: '/mnherederos/ingresoher/RegistroTitular',
  REGISTRO_HEREDERO: '/mnherederos/ingresoher/RegistroHeredero',
  FORM_INGRESO: '/mnherederos/ingresoher/formingreso',
  CARGA_DOCUMENTOS: '/mnherederos/ingresoher/cargadoc',
  DETALLE_MANDATO: '/mnherederos/ingresoher/detallemandato',
  SUCCESS: '/mnherederos/ingresoher/success'
} as const;

export const HEREDEROS_STEPS = {
  TITULAR: 1,
  HEREDERO: 2,
  DOCUMENTOS: 3,
  CUENTA_BANCARIA: 4
} as const;

export interface HerederoNavigationOptions {
  replace?: boolean;
  state?: any;
}

/**
 * Hook optimizado para navegación SPA - ahora que el Core maneja las transiciones automáticamente
 */
export const useHerederoNavigation = () => {
  const navigate = useNavigate();

  // Navegación simplificada - el Core se encarga de las transiciones automáticamente
  const navigateToStep = useCallback((route: string, options?: HerederoNavigationOptions) => {
    const { replace = false, state } = options || {};

    // Navegación directa y simple - el PageTransition del Core maneja todo
    if (replace) {
      navigate(route, { replace: true, state });
    } else {
      navigate(route, { state });
    }
  }, [navigate]);

  // Métodos específicos simplificados - sin configuraciones complejas
  const startProcess = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.INICIO_PROCESO, options);
  }, [navigateToStep]);

  const goToIngresoTitular = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.INGRESO_TITULAR, options);
  }, [navigateToStep]);

  const goToRequisitosTitular = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.REQUISITOS_TITULAR, options);
  }, [navigateToStep]);

  const goToDatosTitular = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.DATOS_TITULAR, options);
  }, [navigateToStep]);

  const goToRegistroTitular = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.REGISTRO_TITULAR, options);
  }, [navigateToStep]);

  // Nueva función para volver al formulario limpio
  const goToRegistroTitularClean = useCallback((options?: HerederoNavigationOptions) => {
    // Usar replace para evitar entradas duplicadas en el historial
    navigateToStep(HEREDEROS_ROUTES.REGISTRO_TITULAR, {
      replace: true,
      ...options
    });
  }, [navigateToStep]);

  const goToRegistroHeredero = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.REGISTRO_HEREDERO, options);
  }, [navigateToStep]);

  const goToFormIngreso = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.FORM_INGRESO, options);
  }, [navigateToStep]);

  const goToCargaDocumentos = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.CARGA_DOCUMENTOS, options);
  }, [navigateToStep]);

  const goToDetalleMandato = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.DETALLE_MANDATO, options);
  }, [navigateToStep]);

  const goToSuccess = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.SUCCESS, options);
  }, [navigateToStep]);

  const goToHome = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.HOME, options);
  }, [navigateToStep]);

  const goToStepNumber = useCallback((stepNumber: number, options?: HerederoNavigationOptions) => {
    switch (stepNumber) {
      case HEREDEROS_STEPS.TITULAR:
        goToIngresoTitular(options);
        break;
      case HEREDEROS_STEPS.HEREDERO:
        goToRegistroHeredero(options);
        break;
      case HEREDEROS_STEPS.DOCUMENTOS:
        goToCargaDocumentos(options);
        break;
      case HEREDEROS_STEPS.CUENTA_BANCARIA:
        goToDetalleMandato(options);
        break;
      default:
        console.warn(`Paso no reconocido: ${stepNumber}`);
    }
  }, [goToIngresoTitular, goToRegistroHeredero, goToCargaDocumentos, goToDetalleMandato]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    // Rutas disponibles
    routes: HEREDEROS_ROUTES,
    steps: HEREDEROS_STEPS,

    // Métodos de navegación simplificados
    goToHome, // Agregar nuevo método
    startProcess,
    goToIngresoTitular,
    goToRequisitosTitular,
    goToDatosTitular,
    goToRegistroTitular,
    goToRegistroTitularClean, // Nueva función
    goToRegistroHeredero,
    goToFormIngreso,
    goToCargaDocumentos,
    goToDetalleMandato,
    goToSuccess,
    goToStepNumber,
    goBack,
    navigateToStep
  };
};
