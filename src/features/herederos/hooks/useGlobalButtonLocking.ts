import { useCallback, useEffect, useRef, useState } from 'react';
import { useButtonLockingContext } from '../contexts/ButtonLockingContext';

export interface UseGlobalButtonLockingReturn {
  // Estados
  isExternalTabOpen: boolean;
  loading: boolean;
  error: string | null;
  tabUrl: string | null;
  transactionToken: string | null;
  isOpeningTab: boolean; // Nuevo estado para prevenir apertura múltiple
  // Eliminado: useIframeModal ya no se usa

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
  const [isOpeningTab, setIsOpeningTab] = useState(false); // Prevenir apertura múltiple
  // Eliminado: useIframeModal ya no se usa // Usar iframe modal

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
      error,
      isOpeningTab
    });

    // Prevenir apertura múltiple
    if (isExternalTabOpen || isOpeningTab) {
      console.warn('⚠️ [Global] Ya hay una pestaña externa abierta o se está abriendo una nueva');
      return;
    }

    try {
      setIsOpeningTab(true);
      setLoading(true);
      setError(null);

      console.log('🚀 [Global] Abriendo pestaña externa:', url);
      console.log('🔍 [Global] Estado antes de abrir:', { isExternalTabOpen, tabRef: !!tabRef.current, isOpeningTab });

      // Verificar que la URL sea válida
      if (!url || !url.startsWith('http')) {
        throw new Error('URL inválida para abrir en pestaña externa');
      }

      // ESTRATEGIA SIMPLIFICADA: Solo usar window.open estándar
      console.log('🔄 [Global] Intentando abrir pestaña externa...');
      let newTab: Window | null = null;

      // Solo usar window.open estándar para evitar múltiples pestañas
      try {
        newTab = window.open(url, '_blank', 'noopener,noreferrer');
        console.log('🔄 [Global] window.open resultado:', {
          newTab: !!newTab,
          closed: newTab?.closed,
          newTabType: typeof newTab,
          newTabConstructor: newTab?.constructor?.name
        });
      } catch (error) {
        console.warn('⚠️ [Global] Error en window.open:', error);
      }

      // Si window.open falló, lanzar error
      if (!newTab) {
        const errorMessage = 'No se pudo abrir la pestaña externa. Verifique que los popups estén permitidos y que el navegador no esté bloqueando la apertura de nuevas ventanas.';
        console.error('❌ [Global] window.open falló');
        console.error('❌ [Global] Posibles causas:');
        console.error('   - Bloqueador de popups activo');
        console.error('   - Restricciones de seguridad del navegador');
        console.error('   - Configuración de CORS o políticas de seguridad');
        throw new Error(errorMessage);
      }

      // Verificar que la pestaña se abrió correctamente
      if (!newTab) {
        console.error('❌ [Global] Error crítico: newTab es null');
        throw new Error('Error interno: No se pudo abrir la pestaña externa.');
      }

      // Verificación adicional: si la pestaña se abre pero se cierra inmediatamente
      // (común cuando el navegador bloquea popups)
      setTimeout(() => {
        if (newTab && newTab?.closed) {
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

      if (newTab && !newTab?.closed) {
        console.log('✅ [Global] Pestaña abierta correctamente, verificando acceso...');
        console.log('🔍 [Global] Pestaña válida detectada:', {
          isWindow: (newTab as any) instanceof Window,
          hasLocation: 'location' in newTab,
          hasClosed: 'closed' in newTab,
          closedValue: newTab?.closed
        });

        // Verificación adicional: intentar acceder a la pestaña
        try {
          console.log('🔍 [Global] Iniciando verificación de acceso a pestaña...');

          // Para objetos mock, no verificar closed ya que siempre será false
          if ((newTab as any).isMock) {
            console.log('✅ [Global] Objeto mock detectado - saltando verificación de closed');
          } else {
            // Solo verificar closed para pestañas reales
            const testAccess = newTab?.closed;
            console.log('🔍 [Global] Test de acceso a pestaña:', { testAccess });

            if (testAccess) {
              console.error('❌ [Global] Pestaña se cerró inmediatamente después de abrirse');
              throw new Error('La pestaña se cerró inmediatamente después de abrirse');
            }
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
            tabClosed: newTab?.closed,
            transactionToken: token
          });

          // Bloquear botones globalmente SOLO si la pestaña se abrió correctamente
          console.log('🔒 [Global] ANTES de lockButtons - Token:', token);
          lockButtons(`Pestaña externa abierta - Token: ${token}`);
          console.log('🔒 [Global] DESPUÉS de lockButtons - Token:', token);

          // Iniciar verificación periódica del estado de la pestaña
          startTabStatusCheck();

          // Para objetos mock, asumir que el usuario se fue a la pestaña externa después de un breve delay
          if ((newTab as any).isMock) {
            setTimeout(() => {
              if (tabRef.current && (tabRef.current as any).isMock) {
                (tabRef.current as any).wasHidden = true;
                console.log('🔍 [Global] Asumiendo que usuario se fue a pestaña externa (wasHidden = true)');
              }
            }, 2000); // 2 segundos después de abrir
          }

        // Intentar detectar el cierre real de la pestaña externa usando postMessage
        // Solo para pestañas reales, no para objetos mock
        if (newTab && !(newTab as any).isMock && newTab.document) {
            try {
              // Inyectar script de monitoreo en la pestaña externa
              setTimeout(() => {
                try {
                  if (!newTab) return;
                  const script = newTab.document.createElement('script');
                  script.textContent = `
                    (function() {
                      'use strict';
                      console.log('🔍 [ExternalTabMonitor] Script de monitoreo cargado');

                      window.addEventListener('message', function(event) {
                        if (event.data && event.data.type === 'EXTERNAL_TAB_MONITOR' && event.data.source === 'consalud-app') {
                          console.log('🔍 [ExternalTabMonitor] Monitoreo activado por pestaña principal');

                          window.addEventListener('beforeunload', function() {
                            console.log('🔍 [ExternalTabMonitor] Pestaña externa se está cerrando, notificando a pestaña principal');

                            try {
                              if (event.source && !event.source.closed) {
                                event.source.postMessage({
                                  type: 'EXTERNAL_TAB_CLOSING',
                                  source: 'external-tab-monitor',
                                  timestamp: Date.now()
                                }, '*');
                              }
                            } catch (error) {
                              console.warn('⚠️ [ExternalTabMonitor] Error al notificar cierre:', error);
                            }
                          });
                        }
                      });
                    })();
                  `;
                  newTab.document.head.appendChild(script);
                  console.log('✅ [Global] Script de monitoreo inyectado en pestaña externa');
                } catch (injectionError) {
                  console.warn('⚠️ [Global] No se pudo inyectar script de monitoreo:', injectionError);
                }
              }, 1000);

              // Enviar un mensaje a la pestaña externa para que nos notifique cuando se cierre
              setTimeout(() => {
                try {
                  if (!newTab) return;
                  newTab.postMessage({ type: 'EXTERNAL_TAB_MONITOR', source: 'consalud-app' }, '*');
                } catch (messageError) {
                  console.warn('⚠️ [Global] No se pudo enviar mensaje de monitoreo:', messageError);
                }
              }, 1500);

              // Escuchar mensajes de la pestaña externa
              const handleMessage = (event: MessageEvent) => {
                if (event.data && event.data.type === 'EXTERNAL_TAB_CLOSING') {
                  console.log('🔍 [Global] Pestaña externa notificó que se está cerrando');
                  closeExternalTab();
                }
              };

              window.addEventListener('message', handleMessage);

              // Limpiar el listener cuando se cierre la pestaña
              const cleanup = () => {
                window.removeEventListener('message', handleMessage);
              };

              // Guardar la función de cleanup
              (newTab as any).cleanup = cleanup;
            } catch (error) {
              console.warn('⚠️ [Global] No se pudo configurar monitoreo de pestaña externa:', error);
            }
          }

          console.log('✅ [Global] Pestaña externa abierta exitosamente');
        } catch (accessError) {
          console.error('❌ [Global] Error al acceder a la pestaña:', accessError);
          console.error('❌ [Global] Detalles del error de acceso:', {
            errorMessage: (accessError as Error).message,
            errorStack: (accessError as Error).stack,
            newTabClosed: newTab?.closed,
            isMock: (newTab as any).isMock
          });

          // Para objetos mock, no lanzar excepción ya que es normal
          if ((newTab as any).isMock) {
            console.log('✅ [Global] Error ignorado para objeto mock - continuando normalmente');
          } else {
            throw new Error('No se pudo acceder a la pestaña abierta');
          }
        }
      } else {
        console.error('❌ [Global] Pestaña no se abrió correctamente:', {
          newTab: !!newTab,
          closed: newTab?.closed,
          newTabType: typeof newTab,
          newTabConstructor: newTab?.constructor?.name,
          isMock: (newTab as any).isMock
        });

        // Para objetos mock, no lanzar excepción ya que es normal
        if ((newTab as any).isMock) {
          console.log('✅ [Global] Objeto mock detectado en else - continuando normalmente');
        } else {
          throw new Error('La pestaña se cerró inmediatamente o no se pudo abrir correctamente');
        }
      }
    } catch (err: any) {
      console.error('❌ [Global] Error al abrir pestaña externa:', err);
      console.error('❌ [Global] Stack trace del error:', err.stack);
      setError(err.message || 'Error al abrir la pestaña externa');
      // Re-lanzar la excepción para que sea capturada por el llamador
      console.log('🔄 [Global] Re-lanzando excepción...');
      throw err;
    } finally {
      console.log('🔄 [Global] FINALLY - setLoading(false) y setIsOpeningTab(false)');
      setLoading(false);
      setIsOpeningTab(false);
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

    // Limpiar listener de mensajes si existe
    if (tabRef.current && (tabRef.current as any).cleanup) {
      try {
        (tabRef.current as any).cleanup();
        console.log('🧹 [Global] Listener de mensajes limpiado');
      } catch (err) {
        console.warn('⚠️ [Global] Error al limpiar listener de mensajes:', err);
      }
    }

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
    // Eliminado: setUseIframeModal ya no se usa

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
      // NO HAY OBJETOS MOCK - Solo pestañas reales
      console.log('🔍 [Global] Verificando pestaña real');

      // Para pestañas reales, verificar directamente si están cerradas
      if (tabRef.current.closed) {
        console.log('🔍 [Global] Pestaña real detectada como cerrada');
          closeExternalTab();
          return false;
        }

      // Verificar si la pestaña sigue siendo accesible
      try {
        // Intentar acceder a una propiedad de la pestaña
        const isAccessible = tabRef.current.location !== undefined;
        if (!isAccessible) {
          console.log('🔍 [Global] Pestaña real ya no es accesible (posiblemente cerrada)');
          closeExternalTab();
          return false;
        }
      } catch (error) {
        console.log('🔍 [Global] Error al acceder a la pestaña real:', error);
        closeExternalTab();
        return false;
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
      if (tabRef.current) {
        if (document.visibilityState === 'visible') {
          console.log('👁️ [Global] Usuario volvió a la pestaña principal, verificando estado de pestaña externa');

          // Marcar el momento del cambio de visibilidad para objetos mock
          if ((tabRef.current as any).isMock) {
            (tabRef.current as any).lastVisibilityChange = Date.now();
            (tabRef.current as any).focusChanges = ((tabRef.current as any).focusChanges || 0) + 1;
            console.log('🔍 [Global] Marcado cambio de visibilidad para objeto mock - Total cambios:', (tabRef.current as any).focusChanges);
          }

          // Pequeño delay para evitar verificaciones prematuras
          setTimeout(() => {
            checkTabStatus();
          }, 1000);
        } else {
          // La página se ocultó - marcar que el usuario se fue a otra pestaña
          if ((tabRef.current as any).isMock) {
            (tabRef.current as any).wasHidden = true;
            console.log('🔍 [Global] Página ocultada - usuario se fue a otra pestaña (wasHidden = true)');
          }
        }
      }
    };

    const handleFocus = () => {
      if (tabRef.current) {
        console.log('🎯 [Global] Pestaña principal recibió foco, verificando estado de pestaña externa');

        // Marcar el momento del cambio de foco para objetos mock
        if ((tabRef.current as any).isMock) {
          (tabRef.current as any).lastVisibilityChange = Date.now();
          (tabRef.current as any).focusChanges = ((tabRef.current as any).focusChanges || 0) + 1;
          console.log('🔍 [Global] Marcado cambio de foco para objeto mock - Total cambios:', (tabRef.current as any).focusChanges);
        }

        // Pequeño delay para evitar verificaciones prematuras
        setTimeout(() => {
          checkTabStatus();
        }, 1000);
      }
    };

    const handleBlur = () => {
      if (tabRef.current) {
        console.log('👁️ [Global] Pestaña principal perdió foco - usuario se fue a otra pestaña');

        // Marcar que el usuario se fue a otra pestaña
        if ((tabRef.current as any).isMock) {
          (tabRef.current as any).wasHidden = true;
          console.log('🔍 [Global] Marcado pérdida de foco para objeto mock (wasHidden = true)');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Guardar función de cleanup
    visibilityCleanupRef.current = () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
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
     * Timeout de emergencia para objetos mock - desbloquear automáticamente después de 5 minutos
     * Solo como medida de seguridad extrema
     */
    useEffect(() => {
      if (!isExternalTabOpen || !tabRef.current) return;
      if (!(tabRef.current as any).isMock) return; // Solo para objetos mock

      const emergencyTimeout = setTimeout(() => {
        console.warn('⚠️ [Global] Timeout de emergencia para objeto mock: desbloqueando después de 5 minutos');
        closeExternalTab();
      }, 300000); // 5 minutos (300 segundos)

      return () => clearTimeout(emergencyTimeout);
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
    isOpeningTab, // Nuevo estado para prevenir apertura múltiple
    // Eliminado: useIframeModal ya no se usa

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
