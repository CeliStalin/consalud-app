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
      return 'Complete el formulario en la nueva pestaña y ciérrela para continuar';
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
            {lockReason?.includes('pestaña externa') && lockDuration && lockDuration > 10 && (
              <div className="manual-unlock-section" style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  Si ya cerró la pestaña externa, puede desbloquear manualmente:
                </p>
                <button
                  onClick={() => {
                    console.log('🔓 [Manual] Usuario solicitó desbloqueo manual');
                    unlockButtons();
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Desbloquear Manualmente
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ButtonLockingNotification;
