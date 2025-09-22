import { useCallback, useEffect, useState } from 'react';

export interface UseButtonLockingReturn {
  // Estados
  isLocked: boolean;
  lockReason: string | null;

  // Acciones
  lockButtons: (reason: string) => void;
  unlockButtons: () => void;
  toggleLock: (reason?: string) => void;
}

/**
 * Hook para manejar el bloqueo de botones durante operaciones críticas
 * Útil para bloquear la interfaz cuando hay pestañas externas abiertas
 */
export const useButtonLocking = (): UseButtonLockingReturn => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState<string | null>(null);

  /**
   * Bloquea los botones con una razón específica
   */
  const lockButtons = useCallback((reason: string) => {
    console.log('🔒 Bloqueando botones:', reason);
    setIsLocked(true);
    setLockReason(reason);
  }, []);

  /**
   * Desbloquea los botones
   */
  const unlockButtons = useCallback(() => {
    console.log('🔓 Desbloqueando botones');
    setIsLocked(false);
    setLockReason(null);
  }, []);

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
   * Limpia el estado al desmontar el componente
   */
  useEffect(() => {
    return () => {
      unlockButtons();
    };
  }, [unlockButtons]);

  return {
    // Estados
    isLocked,
    lockReason,

    // Acciones
    lockButtons,
    unlockButtons,
    toggleLock
  };
};
