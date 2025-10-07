import { useCallback, useEffect, useState } from 'react';
import {
  advancedExternalAppManager,
  ExternalAppCallbacks,
  ExternalAppState,
  WindowStatus,
} from '../services/advancedExternalAppManager';

export const useAdvancedExternalApp = () => {
  const [appState, setAppState] = useState<ExternalAppState>(advancedExternalAppManager.getState());
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Abre una aplicación externa
   */
  const openExternalApp = useCallback(
    async (url: string, windowFeatures?: string): Promise<string> => {
      setIsLoading(true);

      try {
        const tabId = await advancedExternalAppManager.openExternalApp(url, windowFeatures);
        return tabId;
      } catch (error) {
        console.error('❌ [useAdvancedExternalApp] Error al abrir aplicación externa:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Cierra la aplicación externa
   */
  const closeExternalApp = useCallback(() => {
    advancedExternalAppManager.closeExternalWindow();
  }, []);

  /**
   * Verifica si hay una ventana abierta
   */
  const isWindowOpen = useCallback((): boolean => {
    return advancedExternalAppManager.isWindowOpen();
  }, []);

  /**
   * Obtiene el color del estado para UI
   */
  const getStatusColor = useCallback((status: WindowStatus): string => {
    return advancedExternalAppManager.getStatusColor(status);
  }, []);

  /**
   * Configura los callbacks del servicio
   */
  useEffect(() => {
    const callbacks: ExternalAppCallbacks = {
      onOpened: state => {
        setAppState(state);
      },
      onClosed: state => {
        setAppState(state);
      },
      onError: error => {
        console.error('🌉 [useAdvancedExternalApp] Error:', error);
        setAppState(prev => ({ ...prev, error, status: 'error' }));
      },
      onStatusChange: status => {
        setAppState(prev => ({ ...prev, status }));
      },
    };

    advancedExternalAppManager.setCallbacks(callbacks);

    // Establecer estado inicial
    setAppState(advancedExternalAppManager.getState());

    // Cleanup al desmontar
    return () => {
      advancedExternalAppManager.cleanup();
    };
  }, []);

  /**
   * Manejo de visibilidad de la página
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && appState.status === 'open') {
        // Cuando vuelves a la pestaña principal, verificar si la ventana sigue abierta
        if (!advancedExternalAppManager.isWindowOpen()) {
          setAppState(prev => ({
            ...prev,
            status: 'closed',
            closedAt: new Date(),
          }));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [appState.status]);

  return {
    // Estado
    appState,
    isLoading,

    // Estado específico
    status: appState.status,
    isOpen: appState.status === 'open',
    isOpening: appState.status === 'opening',
    isClosed: appState.status === 'closed',
    hasError: appState.status === 'error',

    // Información de la ventana
    tabId: appState.tabId,
    url: appState.url,
    openedAt: appState.openedAt,
    closedAt: appState.closedAt,
    error: appState.error,

    // Acciones
    openExternalApp,
    closeExternalApp,
    isWindowOpen,
    getStatusColor,

    // Utilidades
    getState: () => advancedExternalAppManager.getState(),
  };
};
