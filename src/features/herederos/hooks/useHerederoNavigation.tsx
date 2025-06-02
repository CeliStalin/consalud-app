import { useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';

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

// Configuraciones de transición específicas por ruta para ConsaludCore.PageTransition
const ROUTE_TRANSITION_CONFIGS = {
  [HEREDEROS_ROUTES.DASHBOARD]: {
    preset: 'fadeIn' as const,
    duration: 250,
    easing: 'ease-in-out'
  },
  [HEREDEROS_ROUTES.INICIO_PROCESO]: {
    preset: 'slideLeft' as const,
    duration: 300,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  [HEREDEROS_ROUTES.INGRESO_TITULAR]: {
    preset: 'slideLeft' as const,
    duration: 350,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  [HEREDEROS_ROUTES.REQUISITOS_TITULAR]: {
    preset: 'slideLeft' as const,
    duration: 300,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  [HEREDEROS_ROUTES.SUCCESS]: {
    preset: 'scale' as const,
    duration: 400,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  }
} as const;

export interface HerederoNavigationOptions {
  replace?: boolean;
  state?: any;
  withTransition?: boolean;
  transitionConfig?: {
    preset?: 'fadeIn' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'scale' | 'none';
    duration?: number;
    easing?: string;
  };
}

/**
 * Hook personalizado para manejar la navegación en el flujo de herederos
 * Refactorizado para evitar violaciones de las reglas de hooks
 */
export const useHerederoNavigation = () => {
  const navigate = useNavigate();
  const transitionCapabilityRef = useRef<{
    hasTransition: boolean;
    hasStartTransition: boolean;
  } | null>(null);

  // Verificar capacidades de transición una sola vez
  if (transitionCapabilityRef.current === null) {
    transitionCapabilityRef.current = {
      hasTransition: typeof ConsaludCore.usePageTransition === 'function',
      hasStartTransition: typeof ConsaludCore.startTransition === 'function'
    };
  }

  // Función para configurar transiciones de manera segura
  const configureTransition = useCallback((config: {
    preset?: 'fadeIn' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown' | 'scale' | 'none';
    duration?: number;
    easing?: string;
  }) => {
    const capabilities = transitionCapabilityRef.current;
    
    if (capabilities?.hasStartTransition && ConsaludCore.startTransition) {
      ConsaludCore.startTransition(() => {
        // La transición se maneja por el componente PageTransition del core
      });
    }
  }, []);

  // Navegación a rutas específicas del flujo con transiciones del core
  const navigateToStep = useCallback((route: string, options?: HerederoNavigationOptions) => {
    const { 
      replace = false, 
      state, 
      withTransition = true, 
      transitionConfig 
    } = options || {};

    // Configurar la transición antes de navegar usando el core
    if (withTransition) {
      // Usar configuración específica de la ruta o la proporcionada
      const routeConfig = ROUTE_TRANSITION_CONFIGS[route as keyof typeof ROUTE_TRANSITION_CONFIGS];
      const finalConfig = transitionConfig || routeConfig || {
        preset: 'slideLeft' as const,
        duration: 300,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      };

      configureTransition(finalConfig);
    }

    // Realizar la navegación
    if (replace) {
      navigate(route, { replace: true, state });
    } else {
      navigate(route, { state });
    }
  }, [navigate, configureTransition]);

  // Métodos específicos para cada paso del proceso con transiciones del core
  const goToDashboard = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.DASHBOARD, {
      ...options,
      transitionConfig: { preset: 'fadeIn', duration: 250 }
    });
  }, [navigateToStep]);

  const startProcess = useCallback((options?: HerederoNavigationOptions) => {
    navigateToStep(HEREDEROS_ROUTES.INICIO_PROCESO, {
      ...options,
      transitionConfig: { preset: 'slideLeft', duration: 300 }
    });
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
    navigateToStep(HEREDEROS_ROUTES.SUCCESS, {
      ...options,
      transitionConfig: { 
        preset: 'scale', 
        duration: 400, 
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' 
      }
    });
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

  // Navegación hacia atrás con transición invertida usando el core
  const goBack = useCallback((options?: HerederoNavigationOptions) => {
    // Configurar transición hacia atrás
    configureTransition({
      preset: 'slideRight',
      duration: 300,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    });
    
    navigate(-1);
  }, [navigate, configureTransition]);

  return {
    // Rutas disponibles
    routes: HEREDEROS_ROUTES,
    steps: HEREDEROS_STEPS,
    
    // Métodos de navegación específicos con transiciones del core
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
    navigateToStep,
    configureTransition,
    
    // Estado de las transiciones (simplificado)
    transitionState: null,
    isTransitioning: false
  };
};