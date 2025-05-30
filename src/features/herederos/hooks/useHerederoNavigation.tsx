import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

// Definir las rutas del flujo de herederos
export const HEREDEROS_ROUTES = {
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

// Definir los pasos del proceso
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
 * Hook personalizado para manejar la navegación en el flujo de herederos
 * Proporciona métodos seguros para navegar entre las diferentes páginas del proceso
 */
export const useHerederoNavigation = () => {
  const navigate = useNavigate();

  // Navegación a rutas específicas del flujo
  const navigateToStep = useCallback((route: string, options?: HerederoNavigationOptions) => {
    if (options?.replace) {
      navigate(route, { replace: true, state: options.state });
    } else {
      navigate(route, { state: options?.state });
    }
  }, [navigate]);

  // Métodos específicos para cada paso del proceso
  const goToDashboard = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.DASHBOARD, options);
  }, [navigateToStep]);

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

  // Navegación basada en el número de paso
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

  // Navegación hacia atrás (útil para botones "Volver")
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return {
    // Rutas disponibles
    routes: HEREDEROS_ROUTES,
    steps: HEREDEROS_STEPS,
    
    // Métodos de navegación específicos
    goToDashboard,
    startProcess,
    goToIngresoTitular,
    goToRequisitosTitular,
    goToDatosTitular,
    goToRegistroTitular,
    goToRegistroHeredero,
    goToFormIngreso,
    goToCargaDocumentos,
    goToDetalleMandato,
    goToSuccess,
    
    // Métodos utilitarios
    goToStepNumber,
    goBack,
    navigateToStep
  };
};