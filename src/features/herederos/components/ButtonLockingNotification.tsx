import React, { useEffect, useState } from 'react';
import { useButtonLockingContext } from '../contexts/ButtonLockingContext';
import { useMandatosTransaction } from '../hooks/useMandatosTransaction';
import { useTabCommunication } from '../hooks/useTabCommunication';
import '../styles/ButtonLocking.css';

export interface ButtonLockingNotificationProps {
  showOverlay?: boolean;
  showTopBar?: boolean;
  autoHide?: boolean;
  hideDelay?: number;
}

/**
 * Componente de notificación para mostrar el estado del bloqueo de botones
 * Incluye overlay modal y barra superior con información detallada
 */
export const ButtonLockingNotification: React.FC<ButtonLockingNotificationProps> = ({
  showOverlay = true,
  showTopBar = true,
  autoHide = false,
  hideDelay = 5000
}) => {
  const { isLocked, lockReason, lockTimestamp, getLockDuration, unlockButtons } = useButtonLockingContext();
  const { isExternalTabOpen, isButtonsLocked: isMandatosLocked, lockReason: mandatosLockReason } = useMandatosTransaction();
  const { hasExternalTabs, externalTabsCount } = useTabCommunication();
  const [isVisible, setIsVisible] = useState(false);
  const [lockDuration, setLockDuration] = useState<number | null>(null);
  const [hasOpenTabs, setHasOpenTabs] = useState(false);
  const [checkingTabs, setCheckingTabs] = useState(false);

  // Función para verificar si hay pestañas abiertas
  const checkForOpenTabs = async () => {
    setCheckingTabs(true);
    try {
      console.log('[ButtonLocking] Verificando estado de pestañas externas...');

      // Usar el nuevo servicio de comunicación que es más confiable
      const tabsAreOpen = hasExternalTabs;
      setHasOpenTabs(tabsAreOpen);

      console.log('[ButtonLocking] Estado de pestañas desde useTabCommunication:', {
        hasExternalTabs,
        externalTabsCount,
        tabsAreOpen,
        isExternalTabOpen,
        isMandatosLocked,
        mandatosLockReason
      });

      return tabsAreOpen;
    } catch (error) {
      console.error('[ButtonLocking] Error al verificar pestañas:', error);
      setHasOpenTabs(false);
      return false;
    } finally {
      setCheckingTabs(false);
    }
  };

  // Función para manejar el desbloqueo con verificación de pestañas
  const handleUnlockWithTabCheck = async () => {
    console.log('[Manual] Usuario solicitó desbloqueo manual con verificación de pestañas');

    const tabsAreOpen = await checkForOpenTabs();

    if (tabsAreOpen) {
      console.log(' [Manual] No se puede desbloquear - hay pestañas abiertas');
      // No desbloquear si hay pestañas abiertas
      return;
    }

    console.log(' [Manual] No hay pestañas abiertas - procediendo con desbloqueo');

    // Limpiar el estado persistente de pestaña externa
    localStorage.removeItem('consalud_external_tab_active');
    localStorage.removeItem('consalud_external_tab_open');
    console.log('🧹 [Manual] Estado persistente de pestaña externa limpiado (consalud_external_tab_active y consalud_external_tab_open)');

    unlockButtons();
  };

  // Actualizar duración del bloqueo cada segundo
  useEffect(() => {
    if (!isLocked || !lockTimestamp) {
      setLockDuration(null);
      return;
    }

    const updateDuration = () => {
      const duration = getLockDuration();
      setLockDuration(duration);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 1000);

    return () => clearInterval(interval);
  }, [isLocked, lockTimestamp, getLockDuration]);

  // Verificar estado de pestañas cuando se monta el componente
  useEffect(() => {
    if (isLocked) {
      checkForOpenTabs();
    }
  }, [isLocked]);

  // Actualizar estado cuando cambie hasExternalTabs
  useEffect(() => {
    console.log('🔍 [ButtonLocking] hasExternalTabs cambió:', hasExternalTabs, 'count:', externalTabsCount);
    setHasOpenTabs(hasExternalTabs);
  }, [hasExternalTabs, externalTabsCount]);

  // Monitoreo continuo de pestañas cuando está bloqueado
  useEffect(() => {
    if (!isLocked) {
      return;
    }

    const monitorInterval = setInterval(async () => {
      const tabsAreOpen = await checkForOpenTabs();

      // Si no hay pestañas abiertas, desbloquear automáticamente
      if (!tabsAreOpen) {
        console.log('🔓 [Auto] No hay pestañas abiertas - desbloqueando automáticamente');
        unlockButtons();
      }
    }, 3000); // Verificar cada 3 segundos

    return () => clearInterval(monitorInterval);
  }, [isLocked, unlockButtons]);

  // Mostrar/ocultar notificación
  useEffect(() => {
    if (isLocked) {
      setIsVisible(true);
    } else {
      if (autoHide) {
        const timer = setTimeout(() => setIsVisible(false), hideDelay);
        return () => clearTimeout(timer);
      } else {
        setIsVisible(false);
      }
    }
  }, [isLocked, autoHide, hideDelay]);

  // Formatear duración del bloqueo
  const formatDuration = (ms: number | null): string => {
    if (!ms) return '';

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Obtener icono según el tipo de bloqueo
  const getLockIcon = (): string => {
    if (!lockReason) return '🔒';

    if (lockReason.toLowerCase().includes('pestaña externa')) return '🌐';
    if (lockReason.includes('procesando')) return '⏳';
    if (lockReason.includes('error')) return '❌';
    if (lockReason.includes('cargando')) return '🔄';

    return '🔒';
  };

  // Obtener mensaje según el tipo de bloqueo
  const getLockMessage = (): string => {
    if (!lockReason) return 'Operación en progreso';

    if (lockReason.toLowerCase().includes('pestaña externa')) {
      return 'Formulario de mandatos abierto en nueva pestaña';
    }
    if (lockReason.includes('procesando')) {
      return 'Procesando información';
    }
    if (lockReason.includes('error')) {
      return 'Error en la operación';
    }
    if (lockReason.includes('cargando')) {
      return 'Cargando datos';
    }

    return lockReason;
  };

  // Obtener instrucciones según el tipo de bloqueo
  const getLockInstructions = (): string => {
    if (!lockReason) return 'Por favor espere...';

    if (lockReason.toLowerCase().includes('pestaña externa')) {
      return 'Complete el formulario en la nueva pestaña y ciérrela para continuar. La página permanecerá bloqueada hasta que cierre la pestaña externa.';
    }
    if (lockReason.includes('procesando')) {
      return 'No cierre esta ventana mientras se procesa la información';
    }
    if (lockReason.includes('error')) {
      return 'Se ha producido un error. Intente nuevamente o contacte al soporte';
    }
    if (lockReason.includes('cargando')) {
      return 'Cargando información, por favor espere...';
    }

    return 'Por favor espere mientras se completa la operación';
  };

  if (!isVisible || !isLocked) {
    return null;
  }

  return (
    <>
      {/* Barra superior de notificación */}
      {showTopBar && (
        <div className="button-lock-indicator">
          <span className="icon">{getLockIcon()}</span>
          <span>{getLockMessage()}</span>
          {lockDuration && (
            <span className="ml-2">({formatDuration(lockDuration)})</span>
          )}
        </div>
      )}

      {/* Overlay modal */}
      {showOverlay && (
        <div className="buttons-locked-overlay">
          <div className="buttons-locked-message">
            <div className="icon">{getLockIcon()}</div>
            <h3>Operación en Progreso</h3>
            <p>{getLockInstructions()}</p>

            {lockReason && (
              <div className="lock-reason">
                <strong>Detalles:</strong> {lockReason}
              </div>
            )}

            {lockDuration && (
              <div className="lock-duration">
                Tiempo transcurrido: {formatDuration(lockDuration)}
              </div>
            )}

            {/* Notificación especial si ha pasado mucho tiempo */}
            {lockDuration && lockDuration > 5000 && lockReason?.toLowerCase().includes('pestaña externa') && (
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '6px',
                padding: '10px',
                marginTop: '15px',
                textAlign: 'center'
              }}>
                <p style={{ margin: '0', fontSize: '14px', color: '#856404' }}>
                  ⚠️ <strong>¿Cerraste la pestaña externa por error?</strong><br/>
                  Si ya completaste el formulario o cerraste la pestaña, usa el botón de desbloqueo manual.
                </p>
              </div>
            )}

            {/* Botón de desbloqueo manual - SIEMPRE visible para pestañas externas */}
            {lockReason?.toLowerCase().includes('pestaña externa') && (
              <div className="manual-unlock-section" style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '16px', color: '#333', marginBottom: '15px', fontWeight: 'bold' }}>
                  {lockDuration && lockDuration > 1000
                    ? '¿Ya completaste el formulario en la pestaña externa?'
                    : 'Complete el formulario en la nueva pestaña y ciérrela para continuar'
                  }
                </p>

                {/* Mensaje informativo sobre el estado de la pestaña */}
                <div style={{
                  backgroundColor: '#e7f3ff',
                  border: '1px solid #b3d9ff',
                  borderRadius: '6px',
                  padding: '10px 15px',
                  marginBottom: '15px',
                  fontSize: '14px',
                  color: '#0066cc'
                }}>
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong>ℹ️ Información:</strong> La pestaña externa debería haberse abierto en tu navegador.
                  </p>
                  <p style={{ margin: '0', fontSize: '13px', color: '#004499' }}>
                    <strong>Importante:</strong> El sistema NO se desbloqueará automáticamente. Debes usar el botón de desbloqueo manual cuando termines.
                  </p>
                </div>

        {/* Botón principal - siempre visible */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <button
            onClick={handleUnlockWithTabCheck}
            disabled={checkingTabs}
            style={{
              padding: '15px 30px',
              backgroundColor: hasOpenTabs ? '#dc3545' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: checkingTabs ? 'wait' : (hasOpenTabs ? 'not-allowed' : 'pointer'),
              fontSize: '20px',
              fontWeight: 'bold',
              boxShadow: hasOpenTabs ? '0 6px 12px rgba(220,53,69,0.4)' : '0 6px 12px rgba(0,123,255,0.4)',
              transition: 'all 0.3s',
              minWidth: '250px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              animation: hasOpenTabs ? 'none' : 'pulse 2s infinite',
              opacity: checkingTabs ? 0.7 : 1
            }}
            onMouseOver={(e) => {
              if (!checkingTabs && !hasOpenTabs) {
                e.currentTarget.style.backgroundColor = '#0056b3';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,123,255,0.6)';
              }
            }}
            onMouseOut={(e) => {
              if (!checkingTabs && !hasOpenTabs) {
                e.currentTarget.style.backgroundColor = '#007bff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,123,255,0.4)';
              }
            }}
                  >
                    {checkingTabs ? '⏳ Verificando...' :
                     hasOpenTabs ? '🚫 Pestañas Abiertas' :
                     '🔓 Desbloquear Ahora'}
                  </button>

                  {/* Mensaje informativo basado en el estado de las pestañas */}
                  <div style={{
                    backgroundColor: hasOpenTabs ? '#fff3cd' : '#e7f3ff',
                    border: `1px solid ${hasOpenTabs ? '#ffeaa7' : '#b3d9ff'}`,
                    borderRadius: '8px',
                    padding: '10px 15px',
                    maxWidth: '400px'
                  }}>
                    <p style={{ margin: '0', fontSize: '14px', color: hasOpenTabs ? '#856404' : '#0066cc' }}>
                      {checkingTabs ? (
                        <>
                          <strong>⏳ Verificando:</strong> Comprobando si hay pestañas externas abiertas...
                        </>
                      ) : hasOpenTabs ? (
                        <>
                          <strong>⚠️ Pestañas Detectadas:</strong> Hay pestañas externas abiertas. El sistema permanecerá bloqueado hasta que se cierren todas las pestañas.
                        </>
                      ) : (
                        <>
                          <strong>💡 Consejo:</strong> Use este botón cuando haya terminado de trabajar en la pestaña externa o si la cerró por error.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ButtonLockingNotification;
