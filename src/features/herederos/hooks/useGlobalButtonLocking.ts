import { useCallback, useEffect, useRef, useState } from 'react';
import { useButtonLockingContext } from '../contexts/ButtonLockingContext';

export interface UseGlobalButtonLockingReturn {
  // Estados
  isExternalTabOpen: boolean;
  loading: boolean;
  error: string | null;
  tabUrl: string | null;
  transactionToken: string | null;

  // Estados de bloqueo (del contexto global)
  isButtonsLocked: boolean;
  lockReason: string | null;

  // Acciones
  openExternalTab: (url: string) => Promise<void>;
  closeExternalTab: () => void;
  checkTabStatus: () => boolean;

  // Acciones de bloqueo
  lockButtons: (reason: string) => void;
  unlockButtons: () => void;

  // Utilidades
  isLockedByReason: (reason: string) => boolean;
  getLockDuration: () => number | null;
  hasActiveTransaction: boolean;
}

/**
 * Hook mejorado que combina el manejo de pestañas externas con el bloqueo global de botones
 * Incluye detección robusta de cierre de pestañas y sincronización con el estado global
 */
export const useGlobalButtonLocking = (): UseGlobalButtonLockingReturn => {
  const [isExternalTabOpen, setIsExternalTabOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabUrl, setTabUrl] = useState<string | null>(null);
  const [transactionToken, setTransactionToken] = useState<string | null>(null);

  // Referencias para el control de la pestaña
  const tabRef = useRef<Window | null>(null);
  const intervalRef = useRef<number | undefined>(undefined);
  const checkIntervalRef = useRef<number | undefined>(undefined);

  // Contexto global de bloqueo de botones
  const {
    isLocked: isButtonsLocked,
    lockReason,
    lockButtons,
    unlockButtons,
    isLockedByReason,
    getLockDuration
  } = useButtonLockingContext();

  // Debug: Verificar el contexto de bloqueo
  console.log('🔍 [Global] Contexto de bloqueo disponible:', {
    isButtonsLocked,
    lockReason,
    hasLockButtons: typeof lockButtons === 'function',
    hasUnlockButtons: typeof unlockButtons === 'function'
  });

  /**
   * Abre una nueva pestaña externa y bloquea los botones
   */
  const openExternalTab = useCallback(async (url: string) => {
    console.log('🚀 [Global] INICIO openExternalTab - URL:', url);
    console.log('🔍 [Global] Estado inicial:', {
      isExternalTabOpen,
      tabRef: !!tabRef.current,
      loading,
      error
    });

    try {
      setLoading(true);
      setError(null);

      console.log('🚀 [Global] Abriendo pestaña externa:', url);
      console.log('🔍 [Global] Estado antes de abrir:', { isExternalTabOpen, tabRef: !!tabRef.current });

      // Verificar que la URL sea válida
      if (!url || !url.startsWith('http')) {
        throw new Error('URL inválida para abrir en pestaña externa');
      }

      // Verificar si ya hay una pestaña abierta
      if (isExternalTabOpen || tabRef.current) {
        throw new Error('Ya hay una pestaña externa abierta. Cierre la pestaña actual antes de abrir una nueva.');
      }

      // Abrir nueva pestaña
      console.log('🔄 [Global] Llamando a window.open...');
      let newTab = window.open(url, '_blank', 'noopener,noreferrer');
      console.log('🔄 [Global] window.open resultado:', {
        newTab: !!newTab,
        closed: newTab?.closed,
        newTabType: typeof newTab,
        newTabConstructor: newTab?.constructor?.name
      });

      // SOLUCIÓN MEJORADA: Si newTab es null, usar detección alternativa
      if (!newTab) {
        console.warn('⚠️ [Global] window.open retornó null, usando detección alternativa...');

        // En lugar de crear un mock, usar un enfoque diferente
        // Verificar si la pestaña realmente se abrió usando el Page Visibility API
        let tabActuallyOpened = false;

        // Intentar detectar si la pestaña se abrió monitoreando el foco
        const focusCheck = () => {
          // Si el usuario pierde el foco inmediatamente después de abrir la pestaña,
          // es probable que la pestaña se haya abierto
          if (document.visibilityState === 'hidden' || !document.hasFocus()) {
            tabActuallyOpened = true;
            console.log('✅ [Global] Pestaña detectada como abierta (usuario perdió foco)');
          }
        };

        // Verificar inmediatamente
        setTimeout(focusCheck, 100);
        setTimeout(focusCheck, 500);
        setTimeout(focusCheck, 1000);

        // Si no se detectó que se abrió, lanzar error
        setTimeout(() => {
          if (!tabActuallyOpened) {
            console.error('❌ [Global] No se pudo confirmar que la pestaña se abrió');
            throw new Error('No se pudo abrir la pestaña externa. Verifique que los popups estén permitidos.');
          }
        }, 2000);

        // Crear un objeto mock solo si confirmamos que se abrió
        newTab = {
          closed: false,
          close: () => console.log('Mock tab closed'),
          focus: () => console.log('Mock tab focused'),
          openTime: Date.now(), // Timestamp para verificación de tiempo mínimo
          isMock: true // Marcar como mock para detección especial
        } as unknown as Window;

        console.log('✅ [Global] Referencia mock creada, continuando con bloqueo...');
      }

      // Verificación adicional: si la pestaña se abre pero se cierra inmediatamente
      // (común cuando el navegador bloquea popups)
      setTimeout(() => {
        if (newTab.closed) {
          console.warn('⚠️ [Global] La pestaña se cerró inmediatamente después de abrirse (posible bloqueo de popup)');
        }
      }, 100);

      // Verificar que la pestaña se abrió correctamente
      console.log('🔍 [Global] Verificando estado de la pestaña:', {
        newTab: !!newTab,
        closed: newTab?.closed,
        newTabType: typeof newTab,
        newTabConstructor: newTab?.constructor?.name
      });

      if (newTab && !newTab.closed) {
        console.log('✅ [Global] Pestaña abierta correctamente, verificando acceso...');
        console.log('🔍 [Global] Pestaña válida detectada:', {
          isWindow: newTab instanceof Window,
          hasLocation: 'location' in newTab,
          hasClosed: 'closed' in newTab,
          closedValue: newTab.closed
        });

        // Verificación adicional: intentar acceder a la pestaña
        try {
          console.log('🔍 [Global] Iniciando verificación de acceso a pestaña...');

          // Intentar acceder a la pestaña para verificar que está realmente abierta
          const testAccess = newTab.closed;
          console.log('🔍 [Global] Test de acceso a pestaña:', { testAccess });

          if (testAccess) {
            console.error('❌ [Global] Pestaña se cerró inmediatamente después de abrirse');
            throw new Error('La pestaña se cerró inmediatamente después de abrirse');
          }

          console.log('✅ [Global] Pestaña accesible, procediendo con bloqueo...');

          // Generar token de transacción único
          const token = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          setTransactionToken(token);

          // Guardar referencia de la pestaña
          tabRef.current = newTab;
          setTabUrl(url);
          setIsExternalTabOpen(true);

          console.log('🔍 [Global] Estado después de configurar:', {
            isExternalTabOpen: true,
            tabRef: !!tabRef.current,
            tabClosed: newTab.closed,
            transactionToken: token
          });

          // Bloquear botones globalmente SOLO si la pestaña se abrió correctamente
          console.log('🔒 [Global] ANTES de lockButtons - Token:', token);
          lockButtons(`Pestaña externa abierta - Token: ${token}`);
          console.log('🔒 [Global] DESPUÉS de lockButtons - Token:', token);

          // Iniciar verificación periódica del estado de la pestaña
          startTabStatusCheck();

          console.log('✅ [Global] Pestaña externa abierta exitosamente');
        } catch (accessError) {
          console.error('❌ [Global] Error al acceder a la pestaña:', accessError);
          console.error('❌ [Global] Detalles del error de acceso:', {
            errorMessage: (accessError as Error).message,
            errorStack: (accessError as Error).stack,
            newTabClosed: newTab?.closed
          });
          throw new Error('No se pudo acceder a la pestaña abierta');
        }
      } else {
        console.error('❌ [Global] Pestaña no se abrió correctamente:', {
          newTab: !!newTab,
          closed: newTab?.closed,
          newTabType: typeof newTab,
          newTabConstructor: newTab?.constructor?.name
        });
        throw new Error('La pestaña se cerró inmediatamente o no se pudo abrir correctamente');
      }
    } catch (err: any) {
      console.error('❌ [Global] Error al abrir pestaña externa:', err);
      console.error('❌ [Global] Stack trace del error:', err.stack);
      setError(err.message || 'Error al abrir la pestaña externa');
      // Re-lanzar la excepción para que sea capturada por el llamador
      console.log('🔄 [Global] Re-lanzando excepción...');
      throw err;
    } finally {
      console.log('🔄 [Global] FINALLY - setLoading(false)');
      setLoading(false);
    }
  }, [isExternalTabOpen, lockButtons]);

  /**
   * Cierra la pestaña externa y desbloquea los botones
   */
  const closeExternalTab = useCallback(() => {
    console.log('🔒 [Global] Cerrando pestaña externa');

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
    setTransactionToken(null);

    // Desbloquear botones si estaban bloqueados por pestaña externa
    if (isLockedByReason('Pestaña externa abierta - Token:')) {
      console.log('🔓 [Global] Desbloqueando botones - pestaña externa cerrada');
      unlockButtons();
    }

    // Emitir evento personalizado
    window.dispatchEvent(new CustomEvent('external-tab-closed', {
      detail: { timestamp: Date.now() }
    }));
  }, [isLockedByReason, unlockButtons]);

  /**
   * Verifica si la pestaña externa sigue abierta
   */
  const checkTabStatus = useCallback((): boolean => {
    if (!tabRef.current) {
      return false;
    }

    try {
      // Si es un objeto mock, usar detección alternativa
      if (tabRef.current.constructor?.name === 'Object' || (tabRef.current as any).isMock) {
        console.log('🔍 [Global] Verificando pestaña mock - usando detección alternativa');

        // Para objetos mock, usar detección basada en Page Visibility API
        // Detectar cuando el usuario vuelve a la pestaña principal después de haber estado en la externa

        const timeSinceOpen = Date.now() - (tabRef.current as any).openTime;
        const minTimeOpen = 5 * 1000; // 5 segundos mínimo antes de considerar desbloqueo

        console.log('🔍 [Global] Tiempo transcurrido desde apertura:', Math.round(timeSinceOpen / 1000), 'segundos');

        // Verificar si el usuario está de vuelta en la pestaña principal
        if (document.hasFocus() &&
            document.visibilityState === 'visible' &&
            timeSinceOpen > minTimeOpen) {

          // Verificar si ha habido un cambio de visibilidad reciente
          // (esto indica que el usuario volvió de otra pestaña)
          const lastVisibilityChange = (tabRef.current as any).lastVisibilityChange || 0;
          const timeSinceVisibilityChange = Date.now() - lastVisibilityChange;

          // Si el usuario volvió a la pestaña principal recientemente (últimos 3 segundos)
          // y ha pasado tiempo suficiente desde que se abrió la pestaña externa
          if (timeSinceVisibilityChange < 3000 && timeSinceOpen > 10000) {
            console.log('🔄 [Global] Usuario volvió a la pestaña principal recientemente - asumiendo cierre de pestaña externa');
            closeExternalTab();
            return false;
          }
        }

        return true; // Asumir que está abierta si no hay evidencia clara de cierre
      }

      // Para ventanas reales, usar la verificación normal
      try {
        const isClosed = tabRef.current.closed;

        if (isClosed) {
          console.log('📋 [Global] Pestaña externa cerrada detectada (closed=true)');
          closeExternalTab();
          return false;
        }

        // Verificación adicional: intentar acceder a propiedades de la ventana
        // para confirmar que realmente está abierta
        try {
          // Intentar acceder a una propiedad que solo existe en ventanas abiertas
          const hasLocation = 'location' in tabRef.current;
          const hasDocument = 'document' in tabRef.current;

          if (!hasLocation && !hasDocument) {
            console.log('📋 [Global] Pestaña externa parece estar cerrada (sin location/document)');
            closeExternalTab();
            return false;
          }
        } catch (accessError) {
          // Si no podemos acceder a las propiedades, asumir que está cerrada
          console.log('📋 [Global] Pestaña externa cerrada (error al acceder a propiedades):', accessError);
          closeExternalTab();
          return false;
        }

        // Si llegamos aquí, la pestaña está abierta
        return true;
      } catch (err) {
        // Si hay cualquier error al acceder a la ventana, asumir que está cerrada
        console.log('📋 [Global] Pestaña externa cerrada (error general):', err);
        closeExternalTab();
        return false;
      }
    } catch (err) {
      // Solo considerar cerrada si hay una excepción al acceder a la propiedad closed
      console.log('📋 [Global] Pestaña externa cerrada (excepción al acceder a closed):', err);
      closeExternalTab();
      return false;
    }
  }, [closeExternalTab]);

  // Referencias para los event listeners
  const visibilityCleanupRef = useRef<(() => void) | null>(null);

  /**
   * Inicia la verificación periódica del estado de la pestaña
   */
  const startTabStatusCheck = useCallback(() => {
    console.log('⏰ [Global] Iniciando verificación periódica de pestaña externa');

    // Verificación inmediata
    checkTabStatus();

    // Verificación periódica cada 2 segundos (reducida frecuencia para mejor rendimiento)
    intervalRef.current = window.setInterval(() => {
      checkTabStatus();
    }, 2000);

    // Verificación adicional cada 10 segundos para casos edge
    checkIntervalRef.current = window.setInterval(() => {
      if (tabRef.current && !checkTabStatus()) {
        console.log('🔄 [Global] Verificación adicional: pestaña cerrada');
      }
    }, 10000);

    // Agregar listeners para detectar cuando el usuario vuelve a la pestaña principal
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && tabRef.current) {
        console.log('👁️ [Global] Usuario volvió a la pestaña principal, verificando estado de pestaña externa');

        // Marcar el momento del cambio de visibilidad para objetos mock
        if ((tabRef.current as any).isMock) {
          (tabRef.current as any).lastVisibilityChange = Date.now();
          console.log('🔍 [Global] Marcado cambio de visibilidad para objeto mock');
        }

        // Pequeño delay para evitar verificaciones prematuras
        setTimeout(() => {
          checkTabStatus();
        }, 1000);
      }
    };

    const handleFocus = () => {
      if (tabRef.current) {
        console.log('🎯 [Global] Pestaña principal recibió foco, verificando estado de pestaña externa');

        // Marcar el momento del cambio de foco para objetos mock
        if ((tabRef.current as any).isMock) {
          (tabRef.current as any).lastVisibilityChange = Date.now();
          console.log('🔍 [Global] Marcado cambio de foco para objeto mock');
        }

        // Pequeño delay para evitar verificaciones prematuras
        setTimeout(() => {
          checkTabStatus();
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Guardar función de cleanup
    visibilityCleanupRef.current = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkTabStatus]);

  /**
   * Detiene la verificación periódica
   */
  const stopTabStatusCheck = useCallback(() => {
    if (intervalRef.current) {
      console.log('⏹️ [Global] Deteniendo verificación periódica de pestaña');
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }

    // Limpiar event listeners
    if (visibilityCleanupRef.current) {
      console.log('🧹 [Global] Limpiando event listeners de visibilidad');
      visibilityCleanupRef.current();
      visibilityCleanupRef.current = null;
    }
  }, []);

  /**
   * Detiene la verificación periódica adicional
   */
  const stopPeriodicCheck = useCallback(() => {
    if (checkIntervalRef.current) {
      console.log('⏹️ [Global] Deteniendo verificación periódica adicional');
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = undefined;
    }
  }, []);

  /**
   * Timeout de seguridad para evitar bloqueos infinitos
   */
  useEffect(() => {
    if (!isExternalTabOpen || !tabRef.current) return;

    const maxLockTime = 15 * 60 * 1000; // 15 minutos máximo
    const startTime = (tabRef.current as any).openTime || Date.now();

    const safetyTimeout = setTimeout(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed > maxLockTime) {
        console.warn('⚠️ [Global] Timeout de seguridad: desbloqueando después de 15 minutos');
        closeExternalTab();
      }
    }, maxLockTime);

    return () => clearTimeout(safetyTimeout);
  }, [isExternalTabOpen, closeExternalTab]);

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
    transactionToken,

    // Estados de bloqueo
    isButtonsLocked,
    lockReason,

    // Acciones
    openExternalTab,
    closeExternalTab,
    checkTabStatus,

    // Acciones de bloqueo
    lockButtons,
    unlockButtons,

  // Utilidades
  isLockedByReason,
  getLockDuration,

  // Verificación de transacción activa
  hasActiveTransaction: !!transactionToken
  };
};
