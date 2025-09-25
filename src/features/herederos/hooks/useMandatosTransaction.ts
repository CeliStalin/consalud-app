import { useCallback, useEffect, useRef, useState } from 'react';
import { MandatosTransactionData, mandatosTransactionService } from '../services/mandatosTransactionService';
import { useAdvancedExternalApp } from './useAdvancedExternalApp';
import { useGlobalButtonLocking } from './useGlobalButtonLocking';

export interface UseMandatosTransactionReturn {
  // Estados
  transactionData: MandatosTransactionData | null;
  loading: boolean;
  error: string | null;

  // Acciones
  refreshMandatosData: () => void;

  // Datos de transacción
  transactionId: string | null;

  // Funcionalidad de aplicación externa (nuevo)
  isExternalTabOpen: boolean;
  isOpeningTab: boolean;
  openExternalTab: (rut: string) => Promise<void>;
  closeExternalTab: () => void;
  externalTabUrl: string | null;
  externalAppStatus?: string;
  externalAppTabId?: string;
  openedAt?: Date | null;
  closedAt?: Date | null;

  // Funcionalidad de bloqueo de botones
  isButtonsLocked: boolean;
  lockReason: string | null;
  lockButtons: (reason: string) => void;
  unlockButtons: () => void;
  transactionToken: string | null;
  hasActiveTransaction: boolean;
}

/**
 * Hook para manejar transacciones de mandatos con pestaña externa
 * Implementa el sistema de bloqueo de botones con token de transacción
 */
export const useMandatosTransaction = (): UseMandatosTransactionReturn => {
  const [transactionData] = useState<MandatosTransactionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId] = useState<string | null>(null);
  // const [isInitializing, setIsInitializing] = useState(true); // No se usa actualmente

  // Hook para manejo avanzado de aplicaciones externas con Window Reference + Polling
  const {
    isLoading: externalAppLoading,
    status: externalAppStatus,
    isOpen: isExternalAppOpen,
    tabId: externalAppTabId,
    url: externalAppUrl,
    openedAt,
    closedAt,
    error: externalAppError,
    openExternalApp,
    closeExternalApp
  } = useAdvancedExternalApp();

  // Hook mejorado que combina pestañas externas con bloqueo global
  const {
    isButtonsLocked,
    lockReason,
    lockButtons,
    unlockButtons
  } = useGlobalButtonLocking();

  // Debug: Log del estado recibido del hook global
  console.log('🔍 [useMandatosTransaction] Estado del hook global:', {
    isButtonsLocked,
    lockReason,
    isExternalAppOpen,
    externalAppStatus,
    externalAppTabId
  });

  // Referencias de iframe eliminadas - no se usan

  // Ref para el intervalo de verificación
  const intervalRef = useRef<number | undefined>(undefined);

  // Funciones de iframe eliminadas - sistema usa pestañas externas directamente

  /**
   * Detiene la verificación periódica
   */
  const stopStatusCheck = useCallback(() => {
    if (intervalRef.current) {
      console.log('⏹️ Deteniendo verificación periódica');
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  /**
   * Refresca los datos de mandatos después de cerrar el iframe
   */
  const refreshMandatosData = useCallback(() => {
    console.log('🔄 Refrescando datos de mandatos');

    // Aquí se puede implementar la lógica para refrescar los datos
    // Por ejemplo, volver a llamar al servicio de mandatos
    // o emitir un evento para que otros componentes se actualicen

    // Por ahora, solo logueamos la acción
    console.log('📊 Datos de mandatos refrescados');
  }, []);

  /**
   * Abre una pestaña externa para actualizar mandatos
   */
  const openExternalTab = useCallback(async (rut: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Abriendo pestaña externa para mandatos, RUT:', rut);

      // Iniciar transacción
      const transaction = await mandatosTransactionService.iniciarTransaccionMandatos(rut);

      console.log('📋 Datos de transacción recibidos:', transaction);
      console.log('🔗 URL encriptada a abrir:', transaction.encryptedUrl);

      // Validar que la URL encriptada sea válida
      if (!transaction.encryptedUrl || !transaction.encryptedUrl.startsWith('http')) {
        throw new Error(`URL encriptada inválida: ${transaction.encryptedUrl}`);
      }

      // Usar el nuevo servicio avanzado para abrir la pestaña
      console.log('🔄 [useMandatosTransaction] Llamando a openExternalApp...');

      const tabId = await openExternalApp(transaction.encryptedUrl);

      console.log('🔄 [useMandatosTransaction] openExternalApp completado, tabId:', tabId);

      // Bloquear botones después de abrir la pestaña exitosamente
      console.log('🔒 [useMandatosTransaction] Bloqueando botones - pestaña externa abierta');
      lockButtons(`Pestaña externa abierta - TabId: ${tabId}`);

      console.log('✅ Pestaña externa abierta exitosamente');
    } catch (err: any) {
      console.error('❌ Error al abrir pestaña externa:', err);
      setError(err.message || 'Error al abrir la pestaña externa');
    } finally {
      setLoading(false);
    }
  }, [openExternalApp, lockButtons]);

  /**
   * Cierra la pestaña externa
   */
  const closeExternalTab = useCallback(() => {
    console.log('🔒 Cerrando pestaña externa');

    closeExternalApp(); // Cerrar la aplicación externa usando el nuevo servicio
    unlockButtons(); // Desbloquear botones al cerrar la pestaña
    refreshMandatosData();
  }, [closeExternalApp, unlockButtons, refreshMandatosData]);

  // Función closeIframeModal eliminada - no se usa

  // Función startStatusCheck eliminada - no se usa

  // Función handleIframeLoad eliminada - no se usa

  /**
   * Verificar estado persistente al inicializar
   */
  useEffect(() => {
    console.log('🔍 [useMandatosTransaction] Verificando estado persistente al inicializar...');

    // Verificar la clave principal que indica pestaña activa
    const activeTabTimestamp = localStorage.getItem('consalud_external_tab_active');
    const persistentTabState = localStorage.getItem('consalud_external_tab_open');

    if (activeTabTimestamp) {
      const timestamp = parseInt(activeTabTimestamp);
      const timeSinceOpened = Date.now() - timestamp;

      console.log('🔍 [useMandatosTransaction] Pestaña activa encontrada:', {
        timestamp,
        timeSinceOpened,
        activeTabTimestamp
      });

      // SIEMPRE restaurar el bloqueo si hay timestamp - NO limpiar automáticamente
      console.log('🔒 [useMandatosTransaction] Restaurando bloqueo por pestaña activa (SIN limpieza automática)');

      let lockReason = 'Pestaña externa abierta (restaurado)';
      if (persistentTabState) {
        try {
          const tabData = JSON.parse(persistentTabState);
          lockReason = `Pestaña externa abierta - TabId: ${tabData.tabId} (restaurado)`;
        } catch (error) {
          console.warn('⚠️ [useMandatosTransaction] Error al parsear datos de pestaña:', error);
        }
      }

      // Usar setTimeout para evitar flasheo
      setTimeout(() => {
        lockButtons(lockReason);
      }, 100);

      // NO LIMPIAR AUTOMÁTICAMENTE - Solo se limpia cuando se cierra la pestaña
      console.log('🔒 [useMandatosTransaction] Bloqueo restaurado - NO se limpia automáticamente');
    } else {
      console.log('🔍 [useMandatosTransaction] No se encontró pestaña activa');
    }
  }, []); // Solo ejecutar una vez al montar, sin dependencias

  /**
   * Monitorear cambios en el localStorage, mensajes de pestañas externas y eventos de foco
   */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'consalud_external_tab_active') {
        console.log('🔍 [useMandatosTransaction] Cambio detectado en consalud_external_tab_active:', e.newValue);

        if (!e.newValue && isButtonsLocked) {
          // El localStorage se limpió, verificar si debemos desbloquear
          console.log('🔓 [useMandatosTransaction] consalud_external_tab_active limpiado - desbloqueando botones');
          unlockButtons();
        }
      }
    };

    // Escuchar mensajes de pestañas externas
    const handlePostMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'TAB_CLOSED' && e.data.source === 'external-tab') {
        console.log('🔍 [useMandatosTransaction] Mensaje de cierre recibido de pestaña externa:', e.data);

        if (isButtonsLocked) {
          console.log('🔓 [useMandatosTransaction] Desbloqueando por mensaje de cierre de pestaña');
          unlockButtons();
        }
      }
    };

    // TEMPORALMENTE DESHABILITADO: Detección agresiva que estaba causando limpieza prematura
    // const handleFocus = () => {
    //   console.log('🔍 [useMandatosTransaction] Pestaña principal enfocada - verificando si pestaña externa se cerró');

    //   // Verificar si hay localStorage activo
    //   const activeTabTimestamp = localStorage.getItem('consalud_external_tab_active');
    //   if (activeTabTimestamp && isButtonsLocked) {
    //     console.log('🔍 [useMandatosTransaction] Hay localStorage activo, verificando si pestaña externa aún existe');

    //     // Esperar un poco para que se estabilice el estado
    //     setTimeout(() => {
    //       // Verificar si la pestaña externa aún está abierta usando técnicas alternativas
    //       const hasExternalTab = checkIfExternalTabStillOpen();

    //       if (!hasExternalTab) {
    //         console.log('🔓 [useMandatosTransaction] Pestaña externa no detectada - desbloqueando automáticamente');
    //         localStorage.removeItem('consalud_external_tab_active');
    //         localStorage.removeItem('consalud_external_tab_open');
    //         unlockButtons();
    //       } else {
    //         console.log('🔍 [useMandatosTransaction] Pestaña externa aún detectada - manteniendo bloqueo');
    //       }
    //     }, 1000);
    //   }
    // };

    // TEMPORALMENTE DESHABILITADO: Detección agresiva que estaba causando limpieza prematura
    // const handleVisibilityChange = () => {
    //   if (!document.hidden) {
    //     console.log('🔍 [useMandatosTransaction] Pestaña principal visible - verificando estado de pestaña externa');
    //     handleFocus();
    //   }
    // };

    // Función para verificar si la pestaña externa aún está abierta - TEMPORALMENTE DESHABILITADA
    // const checkIfExternalTabStillOpen = () => {
    //   try {
    //     // Verificar si hay alguna ventana con window.opener que apunte a nosotros
    //     if (window.opener !== null) {
    //       console.log('🔍 [useMandatosTransaction] window.opener detectado');
    //       return true;
    //     }

    //     // Si no hay detección positiva, asumir que no hay pestaña externa
    //     console.log('🔍 [useMandatosTransaction] No se detectaron pestañas externas activas');
    //     return false;
    //   } catch (error) {
    //     console.log('🔍 [useMandatosTransaction] Error al verificar pestaña externa:', error);
    //     return false;
    //   }
    // };

    // Escuchar cambios en localStorage (desde otras pestañas)
    window.addEventListener('storage', handleStorageChange);

    // Escuchar mensajes de pestañas externas
    window.addEventListener('message', handlePostMessage);

    // TEMPORALMENTE DESHABILITADO: Event listeners agresivos que causaban limpieza prematura
    // window.addEventListener('focus', handleFocus);
    // document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handlePostMessage);
      // TEMPORALMENTE DESHABILITADO: Event listeners agresivos
      // window.removeEventListener('focus', handleFocus);
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isButtonsLocked, unlockButtons]);

  /**
   * TEMPORALMENTE DESHABILITADO: Monitorear cambios en hasExternalTabs para desbloquear automáticamente
   * Este efecto estaba causando limpieza prematura del localStorage
   */
  // useEffect(() => {
  //   console.log('🔍 [useMandatosTransaction] hasExternalTabs cambió:', hasExternalTabs);

  //   // Solo procesar si no hay pestañas detectadas Y hay bloqueo activo
  //   if (!hasExternalTabs && isButtonsLocked) {
  //     // Verificar si hay un estado persistente de pestaña externa
  //     const activeTabTimestamp = localStorage.getItem('consalud_external_tab_active');

  //     if (activeTabTimestamp) {
  //       try {
  //         const timestamp = parseInt(activeTabTimestamp);
  //         const timeSinceOpened = Date.now() - timestamp;

  //         console.log('🔍 [useMandatosTransaction] Pestaña activa encontrada:', {
  //           timestamp,
  //           timeSinceOpened
  //         });

  //         // Solo desbloquear automáticamente si han pasado más de 10 minutos
  //         // Esto da tiempo suficiente para que el usuario complete la operación
  //         if (timeSinceOpened > 600000) { // 10 minutos
  //           console.log('🔓 [useMandatosTransaction] Desbloqueando automáticamente después de 10 minutos');
  //           localStorage.removeItem('consalud_external_tab_active');
  //           localStorage.removeItem('consalud_external_tab_open');
  //           unlockButtons();
  //         } else {
  //           console.log('🔍 [useMandatosTransaction] Manteniendo bloqueo - pestaña externa aún activa según consalud_external_tab_active');
  //           // NO hacer nada más - mantener el bloqueo
  //         }
  //       } catch (error) {
  //         console.error('❌ [useMandatosTransaction] Error al parsear timestamp de pestaña activa:', error);
  //         // Solo limpiar en caso de error, no desbloquear
  //         localStorage.removeItem('consalud_external_tab_active');
  //         localStorage.removeItem('consalud_external_tab_open');
  //       }
  //     } else {
  //       // No hay estado persistente, verificar si el bloqueo fue por pestaña externa
  //       const isExternalTabLock = lockReason && lockReason.includes('Pestaña externa abierta');

  //       if (isExternalTabLock) {
  //         console.log('🔍 [useMandatosTransaction] No hay estado persistente pero bloqueo por pestaña externa - esperando...');

  //         // Esperar 5 minutos antes de desbloquear automáticamente
  //         const timeout = setTimeout(() => {
  //           console.log('🔓 [useMandatosTransaction] Desbloqueando automáticamente después de 5 minutos');
  //           unlockButtons();
  //         }, 300000); // 5 minutos

  //         return () => clearTimeout(timeout);
  //       } else {
  //         console.log('🔍 [useMandatosTransaction] Bloqueo no es por pestaña externa, no desbloqueando automáticamente');
  //       }
  //     }
  //   }
  // }, [hasExternalTabs, isButtonsLocked, lockReason, unlockButtons]);

  /**
   * Efecto para escuchar cambios en el estado de la aplicación externa
   */
  useEffect(() => {
    console.log('🔍 [useMandatosTransaction] Estado de aplicación externa cambió:', {
      status: externalAppStatus,
      isOpen: isExternalAppOpen,
      tabId: externalAppTabId
    });

    // Si la aplicación externa se cerró y estamos bloqueados, desbloquear
    if (externalAppStatus === 'closed' && isButtonsLocked) {
      console.log('🔓 [useMandatosTransaction] Aplicación externa cerrada - desbloqueando botones');
      unlockButtons();
    }

    // Si la aplicación externa se abrió y no estamos bloqueados, bloquear
    if (externalAppStatus === 'open' && !isButtonsLocked && externalAppTabId) {
      console.log('🔒 [useMandatosTransaction] Aplicación externa abierta - bloqueando botones');
      lockButtons(`Pestaña externa abierta - TabId: ${externalAppTabId}`);
    }
  }, [externalAppStatus, isExternalAppOpen, externalAppTabId, isButtonsLocked, lockButtons, unlockButtons]);

  /**
   * Efecto para restaurar bloqueo basado en localStorage al inicializar
   */
  useEffect(() => {
    // Solo restaurar si no hay estado activo de la aplicación externa
    if (!isExternalAppOpen && !isButtonsLocked) {
      const activeTabTimestamp = localStorage.getItem('consalud_external_tab_active');

      if (activeTabTimestamp) {
        console.log('🔒 [useMandatosTransaction] Restaurando bloqueo por localStorage');

        let lockReason = 'Pestaña externa abierta (restaurado)';
        const persistentTabState = localStorage.getItem('consalud_external_tab_open');

        if (persistentTabState) {
          try {
            const tabData = JSON.parse(persistentTabState);
            lockReason = `Pestaña externa abierta - TabId: ${tabData.tabId} (restaurado)`;
          } catch (error) {
            console.warn('⚠️ [useMandatosTransaction] Error al parsear datos de pestaña:', error);
          }
        }

        lockButtons(lockReason);
      }
    }
  }, []); // Solo ejecutar una vez al montar

  /**
   * Limpia recursos al desmontar el componente
   */
  useEffect(() => {
    return () => {
      stopStatusCheck();
    };
  }, [stopStatusCheck]);

  /**
   * Limpia transacciones antiguas al inicializar
   */
  useEffect(() => {
    mandatosTransactionService.cleanupOldTransactions();
  }, []);

  /**
   * TEMPORALMENTE DESHABILITADO: Efecto que estaba causando desbloqueo automático prematuro
   * Este efecto estaba desbloqueando automáticamente cuando isExternalTabOpen era false,
   * pero isExternalTabOpen puede ser false incluso cuando la pestaña está abierta
   */
  // useEffect(() => {
  //   console.log('🔍 [useMandatosTransaction] Efecto de cierre de pestaña:', {
  //     isExternalTabOpen,
  //     isButtonsLocked,
  //     lockReason
  //   });

  //   // Solo desbloquear si la pestaña externa se cerró Y el bloqueo fue causado por una pestaña externa
  //   if (!isExternalTabOpen && isButtonsLocked && lockReason?.includes('Pestaña externa abierta')) {
  //     console.log('🔄 [useMandatosTransaction] Pestaña externa cerrada, desbloqueando botones');
  //     console.trace('🔍 [useMandatosTransaction] Stack trace del desbloqueo automático');
  //     unlockButtons();
  //   }
  // }, [isExternalTabOpen, isButtonsLocked, unlockButtons, lockReason]);

  return {
    // Estados
    transactionData,
    loading: loading || externalAppLoading,
    error: error || externalAppError,

    // Acciones
    refreshMandatosData,

    // Datos de transacción
    transactionId,

    // Funcionalidad de aplicación externa (nuevo)
    isExternalTabOpen: isExternalAppOpen,
    isOpeningTab: externalAppStatus === 'opening',
    openExternalTab,
    closeExternalTab,
    externalTabUrl: externalAppUrl || null,
    externalAppStatus,
    externalAppTabId,
    openedAt,
    closedAt,

    // Funcionalidad de bloqueo de botones
    isButtonsLocked,
    lockReason,
    lockButtons,
    unlockButtons,
    transactionToken: null, // Simplificado por ahora
    hasActiveTransaction: false, // Simplificado por ahora

  };
};
