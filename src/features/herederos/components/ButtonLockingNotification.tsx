import React, { useEffect, useState } from 'react';
import { useButtonLockingContext } from '../contexts/ButtonLockingContext';
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
  const [isVisible, setIsVisible] = useState(false);
  const [lockDuration, setLockDuration] = useState<number | null>(null);

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

    if (lockReason.includes('pestaña externa')) return '🌐';
    if (lockReason.includes('procesando')) return '⏳';
    if (lockReason.includes('error')) return '❌';
    if (lockReason.includes('cargando')) return '🔄';

    return '🔒';
  };

  // Obtener mensaje según el tipo de bloqueo
  const getLockMessage = (): string => {
    if (!lockReason) return 'Operación en progreso';

    if (lockReason.includes('pestaña externa')) {
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

    if (lockReason.includes('pestaña externa')) {
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

            {/* Botón de desbloqueo manual para casos de emergencia */}
            {lockReason?.includes('pestaña externa') && (
              <div className="manual-unlock-section" style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  {lockDuration && lockDuration > 5
                    ? 'Si ya cerró la pestaña externa, puede desbloquear manualmente:'
                    : 'Complete el formulario en la nueva pestaña y ciérrela para continuar'
                  }
                </p>
                {lockDuration && lockDuration > 5 && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => {
                        console.log('🔓 [Manual] Usuario solicitó desbloqueo manual');
                        unlockButtons();
                      }}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s',
                        minWidth: '200px'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#218838';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#28a745';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                      }}
                    >
                      ✅ Desbloquear Ahora
                    </button>
                    <p style={{ fontSize: '12px', color: '#999', margin: '0' }}>
                      Use este botón si ya cerró la pestaña externa
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ButtonLockingNotification;
