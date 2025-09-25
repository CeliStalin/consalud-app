import { useCallback, useEffect, useState } from 'react';
import { tabCommunicationService, TabMessage } from '../services/tabCommunicationService';

export interface UseTabCommunicationReturn {
  hasExternalTabs: boolean;
  externalTabsCount: number;
  openExternalTab: (url: string) => Promise<string>;
  closeExternalTab: (tabId: string) => void;
  closeAllExternalTabs: () => void;
  detectOpenTabs: () => boolean;
  isInitialized: boolean;
}

/**
 * Hook para manejar la comunicación entre pestañas
 * Utiliza el servicio de comunicación para detectar pestañas externas
 */
export const useTabCommunication = (): UseTabCommunicationReturn => {
  const [hasExternalTabs, setHasExternalTabs] = useState(false);
  const [externalTabsCount, setExternalTabsCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar el servicio
  useEffect(() => {
    console.log('🔗 [useTabCommunication] Inicializando servicio de comunicación');

    tabCommunicationService.initialize();
    setIsInitialized(true);

    // Registrar handlers para mensajes
    tabCommunicationService.onMessage('TAB_CLOSED', (message: TabMessage) => {
      console.log('📨 [useTabCommunication] Pestaña cerrada:', message.tabId);
      updateExternalTabsState();
    });

    tabCommunicationService.onMessage('TAB_READY', (message: TabMessage) => {
      console.log('📨 [useTabCommunication] Pestaña lista:', message.tabId);
      updateExternalTabsState();
    });

    // Verificación inicial
    updateExternalTabsState();

    return () => {
      console.log('🧹 [useTabCommunication] Limpiando servicio');
      tabCommunicationService.destroy();
    };
  }, []);

  // Función para actualizar el estado de las pestañas externas
  const updateExternalTabsState = useCallback(() => {
    const hasTabs = tabCommunicationService.hasExternalTabs();
    const tabsCount = tabCommunicationService.getExternalTabs().length;

    console.log('🔄 [useTabCommunication] Actualizando estado:', { hasTabs, tabsCount });

    setHasExternalTabs(hasTabs);
    setExternalTabsCount(tabsCount);
  }, []);

  // Función para abrir una pestaña externa
  const openExternalTab = useCallback(async (url: string): Promise<string> => {
    console.log('🚀 [useTabCommunication] Abriendo pestaña externa:', url);

    try {
      const tabId = await tabCommunicationService.openExternalTab(url);

      // Actualizar estado después de abrir
      setTimeout(() => {
        updateExternalTabsState();
      }, 1000);

      return tabId;
    } catch (error) {
      console.error('❌ [useTabCommunication] Error al abrir pestaña externa:', error);
      throw error;
    }
  }, [updateExternalTabsState]);

  // Función para cerrar una pestaña externa específica
  const closeExternalTab = useCallback((tabId: string) => {
    console.log('🔒 [useTabCommunication] Cerrando pestaña externa:', tabId);
    tabCommunicationService.closeExternalTab(tabId);
    updateExternalTabsState();
  }, [updateExternalTabsState]);

  // Función para cerrar todas las pestañas externas
  const closeAllExternalTabs = useCallback(() => {
    console.log('🔒 [useTabCommunication] Cerrando todas las pestañas externas');
    tabCommunicationService.closeAllExternalTabs();
    updateExternalTabsState();
  }, [updateExternalTabsState]);

  // Verificación periódica del estado
  useEffect(() => {
    if (!isInitialized) return;

    const interval = setInterval(() => {
      updateExternalTabsState();
    }, 5000); // Verificar cada 5 segundos

    return () => clearInterval(interval);
  }, [isInitialized, updateExternalTabsState]);

  // Función para detectar pestañas abiertas manualmente
  const detectOpenTabs = useCallback(() => {
    console.log('🔍 [useTabCommunication] Detectando pestañas abiertas manualmente');
    return tabCommunicationService.detectOpenTabs();
  }, []);

  return {
    hasExternalTabs,
    externalTabsCount,
    openExternalTab,
    closeExternalTab,
    closeAllExternalTabs,
    detectOpenTabs,
    isInitialized
  };
};
