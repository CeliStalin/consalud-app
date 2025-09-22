import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseExternalTabReturn {
  // Estados
  isExternalTabOpen: boolean;
  loading: boolean;
  error: string | null;
  tabUrl: string | null;

  // Acciones
  openExternalTab: (url: string) => Promise<void>;
  closeExternalTab: () => void;
  checkTabStatus: () => boolean;
}

/**
 * Hook para manejar pestañas externas con detección de cierre
 * Implementa un sistema que detecta cuando se cierra una pestaña externa
 * y bloquea/desbloquea la interfaz principal en consecuencia
 */
export const useExternalTab = (): UseExternalTabReturn => {
  const [isExternalTabOpen, setIsExternalTabOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabUrl, setTabUrl] = useState<string | null>(null);

  // Referencias para el control de la pestaña
  const tabRef = useRef<Window | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const checkIntervalRef = useRef<number | undefined>(undefined);

  /**
   * Abre una nueva pestaña externa
   */
  const openExternalTab = useCallback(async (url: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Abriendo pestaña externa:', url);

      // Verificar que la URL sea válida
      if (!url || !url.startsWith('http')) {
        throw new Error('URL inválida para abrir en pestaña externa');
      }

      // Abrir nueva pestaña
      const newTab = window.open(url, '_blank', 'noopener,noreferrer');

      if (!newTab) {
        throw new Error('No se pudo abrir la pestaña. Verifique que los popups estén permitidos.');
      }

      // Guardar referencia de la pestaña
      tabRef.current = newTab;
      setTabUrl(url);
      setIsExternalTabOpen(true);

      // Iniciar verificación periódica del estado de la pestaña
      startTabStatusCheck();

      console.log('✅ Pestaña externa abierta exitosamente');
    } catch (err: any) {
      console.error('❌ Error al abrir pestaña externa:', err);
      setError(err.message || 'Error al abrir la pestaña externa');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cierra la pestaña externa si está abierta
   */
  const closeExternalTab = useCallback(() => {
    console.log('🔒 Cerrando pestaña externa');

    // Detener verificaciones
    stopTabStatusCheck();
    stopPeriodicCheck();

    // Intentar cerrar la pestaña si está abierta
    if (tabRef.current && !tabRef.current.closed) {
      try {
        tabRef.current.close();
      } catch (err) {
        console.warn('No se pudo cerrar la pestaña externa:', err);
      }
    }

    // Limpiar estados
    tabRef.current = null;
    setIsExternalTabOpen(false);
    setTabUrl(null);
    setError(null);
  }, []);

  /**
   * Verifica si la pestaña externa sigue abierta
   */
  const checkTabStatus = useCallback((): boolean => {
    if (!tabRef.current) {
      return false;
    }

    try {
      // Intentar acceder a la pestaña
      // Si está cerrada, esto lanzará una excepción
      const isClosed = tabRef.current.closed;

      if (isClosed) {
        console.log('📋 Pestaña externa cerrada detectada');
        closeExternalTab();
        return false;
      }

      // Verificación adicional: intentar acceder a la propiedad location
      // Si la pestaña está en un dominio diferente, esto puede fallar
      try {
        const location = tabRef.current.location;
        if (!location) {
          console.log('📋 Pestaña externa inaccesible (location null)');
          closeExternalTab();
          return false;
        }
      } catch (locationErr) {
        // Si no podemos acceder a location, la pestaña puede estar cerrada
        // o en un dominio diferente (lo cual es normal)
        console.log('📋 Pestaña externa en dominio diferente o cerrada');
      }

      return true;
    } catch (err) {
      console.log('📋 Pestaña externa cerrada (excepción):', err);
      closeExternalTab();
      return false;
    }
  }, [closeExternalTab]);

  /**
   * Inicia la verificación periódica del estado de la pestaña
   */
  const startTabStatusCheck = useCallback(() => {
    console.log('⏰ Iniciando verificación periódica de pestaña externa');

    // Verificación inmediata
    checkTabStatus();

    // Verificación periódica cada 1 segundo
    intervalRef.current = window.setInterval(() => {
      checkTabStatus();
    }, 1000);

    // Verificación adicional cada 5 segundos para casos edge
    checkIntervalRef.current = window.setInterval(() => {
      if (tabRef.current && !checkTabStatus()) {
        console.log('🔄 Verificación adicional: pestaña cerrada');
      }
    }, 5000);
  }, [checkTabStatus]);

  /**
   * Detiene la verificación periódica
   */
  const stopTabStatusCheck = useCallback(() => {
    if (intervalRef.current) {
      console.log('⏹️ Deteniendo verificación periódica de pestaña');
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  /**
   * Detiene la verificación periódica adicional
   */
  const stopPeriodicCheck = useCallback(() => {
    if (checkIntervalRef.current) {
      console.log('⏹️ Deteniendo verificación periódica adicional');
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = undefined;
    }
  }, []);

  /**
   * Limpia recursos al desmontar el componente
   */
  useEffect(() => {
    return () => {
      stopTabStatusCheck();
      stopPeriodicCheck();
    };
  }, [stopTabStatusCheck, stopPeriodicCheck]);

  /**
   * Maneja el evento de cierre de la ventana principal
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      closeExternalTab();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [closeExternalTab]);

  return {
    // Estados
    isExternalTabOpen,
    loading,
    error,
    tabUrl,

    // Acciones
    openExternalTab,
    closeExternalTab,
    checkTabStatus
  };
};
