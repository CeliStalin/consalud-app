import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export interface ButtonLockingContextType {
  // Estados
  isLocked: boolean;
  lockReason: string | null;
  lockTimestamp: number | null;

  // Acciones
  lockButtons: (reason: string) => void;
  unlockButtons: () => void;
  toggleLock: (reason?: string) => void;

  // Utilidades
  isLockedByReason: (reason: string) => boolean;
  getLockDuration: () => number | null;
}

const ButtonLockingContext = createContext<ButtonLockingContextType | undefined>(undefined);

export interface ButtonLockingProviderProps {
  children: ReactNode;
}

/**
 * Provider global para el manejo del bloqueo de botones
 * Permite bloquear/desbloquear botones desde cualquier parte de la aplicación
 * Incluye detección automática de cierre de pestañas externas
 */
export const ButtonLockingProvider: React.FC<ButtonLockingProviderProps> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState<string | null>(null);
  const [lockTimestamp, setLockTimestamp] = useState<number | null>(null);

  /**
   * Bloquea los botones con una razón específica
   */
  const lockButtons = useCallback((reason: string) => {
    console.log('🔒 [Global] INICIO lockButtons - Razón:', reason);
    console.log('🔍 [Global] Estado ANTES del bloqueo:', { isLocked, lockReason });
    console.trace('🔍 [Global] Stack trace del bloqueo de botones');

    setIsLocked(true);
    setLockReason(reason);
    setLockTimestamp(Date.now());

    console.log('🔍 [Global] Estado DESPUÉS del bloqueo:', {
      isLocked: true,
      lockReason: reason,
      timestamp: Date.now()
    });

    // Agregar clase CSS al body para indicar que la interfaz está bloqueada
    document.body.classList.add('buttons-locked');
    console.log('🔍 [Global] Clase CSS agregada al body');

    // Emitir evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('buttons-locked', {
      detail: { reason, timestamp: Date.now() }
    }));
    console.log('🔍 [Global] Evento personalizado emitido');
  }, [isLocked, lockReason]);

  /**
   * Desbloquea los botones
   */
  const unlockButtons = useCallback(() => {
    console.log('🔓 [Global] INICIO unlockButtons');
    console.log('🔍 [Global] Estado ANTES del desbloqueo:', { isLocked, lockReason });
    console.trace('🔍 [Global] Stack trace del desbloqueo de botones');

    setIsLocked(false);
    setLockReason(null);
    setLockTimestamp(null);

    console.log('🔍 [Global] Estado DESPUÉS del desbloqueo:', {
      isLocked: false,
      lockReason: null,
      timestamp: null
    });

    // Remover clase CSS del body
    document.body.classList.remove('buttons-locked');
    console.log('🔍 [Global] Clase CSS removida del body');

    // Emitir evento personalizado para notificar a otros componentes
    window.dispatchEvent(new CustomEvent('buttons-unlocked', {
      detail: { timestamp: Date.now() }
    }));
    console.log('🔍 [Global] Evento de desbloqueo emitido');
  }, [isLocked, lockReason]);

  /**
   * Alterna el estado de bloqueo
   */
  const toggleLock = useCallback((reason?: string) => {
    if (isLocked) {
      unlockButtons();
    } else {
      lockButtons(reason || 'Operación en progreso');
    }
  }, [isLocked, lockButtons, unlockButtons]);

  /**
   * Verifica si los botones están bloqueados por una razón específica
   */
  const isLockedByReason = useCallback((reason: string): boolean => {
    return isLocked && lockReason === reason;
  }, [isLocked, lockReason]);

  /**
   * Obtiene la duración del bloqueo en milisegundos
   */
  const getLockDuration = useCallback((): number | null => {
    if (!isLocked || !lockTimestamp) return null;
    return Date.now() - lockTimestamp;
  }, [isLocked, lockTimestamp]);

  /**
   * Verifica si el bloqueo ha estado activo por demasiado tiempo
   * (más de 10 minutos) y lo desbloquea automáticamente
   */
  useEffect(() => {
    if (!isLocked || !lockTimestamp) return;

    const timeout = setTimeout(() => {
      const timeElapsed = Date.now() - lockTimestamp;
      const maxLockTime = 10 * 60 * 1000; // 10 minutos

      if (timeElapsed > maxLockTime) {
        console.warn('⚠️ [Global] Desbloqueando botones automáticamente después de 10 minutos');
        unlockButtons();
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isLocked, lockTimestamp, unlockButtons]);

  /**
   * Escucha eventos de cierre de pestañas externas
   */
  useEffect(() => {
    const handleExternalTabClosed = () => {
      if (isLocked && lockReason?.includes('pestaña externa')) {
        console.log('🔄 [Global] Pestaña externa cerrada, desbloqueando botones');
        unlockButtons();
      }
    };

    // Escuchar eventos personalizados de cierre de pestañas
    window.addEventListener('external-tab-closed', handleExternalTabClosed);

    return () => {
      window.removeEventListener('external-tab-closed', handleExternalTabClosed);
    };
  }, [isLocked, lockReason, unlockButtons]);

  /**
   * Limpia el estado al desmontar el componente
   * NOTA: No desbloqueamos automáticamente para evitar interferir con el flujo de pestañas externas
   */
  useEffect(() => {
    return () => {
      // Solo limpiar la clase CSS del body, pero no cambiar el estado de bloqueo
      // para evitar interferir con el flujo de pestañas externas
      document.body.classList.remove('buttons-locked');
      console.log('🧹 [Global] Cleanup: Clase CSS removida del body (sin cambiar estado de bloqueo)');
    };
  }, []);

  const value: ButtonLockingContextType = {
    // Estados
    isLocked,
    lockReason,
    lockTimestamp,

    // Acciones
    lockButtons,
    unlockButtons,
    toggleLock,

    // Utilidades
    isLockedByReason,
    getLockDuration
  };

  return (
    <ButtonLockingContext.Provider value={value}>
      {children}
    </ButtonLockingContext.Provider>
  );
};

/**
 * Hook para usar el contexto de bloqueo de botones
 */
export const useButtonLockingContext = (): ButtonLockingContextType => {
  const context = useContext(ButtonLockingContext);

  if (context === undefined) {
    throw new Error('useButtonLockingContext debe ser usado dentro de un ButtonLockingProvider');
  }

  return context;
};

export default ButtonLockingContext;
