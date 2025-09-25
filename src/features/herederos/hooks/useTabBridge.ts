import { useCallback, useEffect, useState } from 'react';
import { tabBridgeService } from '../services/tabBridgeService';

interface TabBridgeState {
  hasActiveTab: boolean;
  tabId?: string;
  timestamp?: number;
  isLoading: boolean;
}

export const useTabBridge = () => {
  const [state, setState] = useState<TabBridgeState>({
    hasActiveTab: false,
    isLoading: true
  });

  /**
   * Notifica que se abrió una pestaña externa
   */
  const notifyTabOpened = useCallback((tabId: string, url: string) => {
    tabBridgeService.notifyTabOpened(tabId, url);
  }, []);

  /**
   * Notifica que se cerró una pestaña externa
   */
  const notifyTabClosed = useCallback((tabId: string) => {
    tabBridgeService.notifyTabClosed(tabId);
  }, []);

  /**
   * Solicita desbloqueo
   */
  const requestUnlock = useCallback((tabId: string) => {
    tabBridgeService.notifyTabClosed(tabId);
  }, []);

  /**
   * Actualiza el estado basado en el servicio
   */
  const updateState = useCallback(() => {
    const tabState = tabBridgeService.getTabState();
    setState(prevState => ({
      ...prevState,
      hasActiveTab: tabState.hasActiveTab,
      tabId: tabState.tabId,
      timestamp: tabState.timestamp,
      isLoading: false
    }));
  }, []);

  useEffect(() => {
    // Actualizar estado inicial
    updateState();

    // Escuchar eventos personalizados del servicio de puente
    const handleTabOpened = (event: CustomEvent) => {
      console.log('🌉 [useTabBridge] Evento de pestaña abierta:', event.detail);
      updateState();
    };

    const handleTabClosed = (event: CustomEvent) => {
      console.log('🌉 [useTabBridge] Evento de pestaña cerrada:', event.detail);
      updateState();
    };

    const handleUnlockRequest = (event: CustomEvent) => {
      console.log('🌉 [useTabBridge] Evento de solicitud de desbloqueo:', event.detail);
      updateState();
    };

    // Agregar listeners para eventos personalizados
    window.addEventListener('consalud-tab-opened', handleTabOpened as EventListener);
    window.addEventListener('consalud-tab-closed', handleTabClosed as EventListener);
    window.addEventListener('consalud-unlock-request', handleUnlockRequest as EventListener);

    // Limpiar listeners al desmontar
    return () => {
      window.removeEventListener('consalud-tab-opened', handleTabOpened as EventListener);
      window.removeEventListener('consalud-tab-closed', handleTabClosed as EventListener);
      window.removeEventListener('consalud-unlock-request', handleUnlockRequest as EventListener);
    };
  }, [updateState]);

  return {
    // Estado
    hasActiveTab: state.hasActiveTab,
    tabId: state.tabId,
    timestamp: state.timestamp,
    isLoading: state.isLoading,

    // Acciones
    notifyTabOpened,
    notifyTabClosed,
    requestUnlock,
    updateState
  };
};
