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
 * Incluye mejoras para detección robusta y feedback visual
 */
export const useButtonLocking = (): UseButtonLockingReturn => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState<string | null>(null);
  const [lockTimestamp, setLockTimestamp] = useState<number | null>(null);

  /**
   * Bloquea los botones con una razón específica
   */
  const lockButtons = useCallback((reason: string) => {
    setIsLocked(true);
    setLockReason(reason);
    setLockTimestamp(Date.now());

    // Agregar clase CSS al body para indicar que la interfaz está bloqueada
    document.body.classList.add('buttons-locked');
  }, []);

  /**
   * Desbloquea los botones
   */
  const unlockButtons = useCallback(() => {
    setIsLocked(false);
    setLockReason(null);
    setLockTimestamp(null);

    // Remover clase CSS del body
    document.body.classList.remove('buttons-locked');
  }, []);

  /**
   * Alterna el estado de bloqueo
   */
  const toggleLock = useCallback(
    (reason?: string) => {
      if (isLocked) {
        unlockButtons();
      } else {
        lockButtons(reason || 'Operación en progreso');
      }
    },
    [isLocked, lockButtons, unlockButtons]
  );

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
        console.warn('⚠️ Desbloqueando botones automáticamente después de 10 minutos');
        unlockButtons();
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isLocked, lockTimestamp, unlockButtons]);

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
    toggleLock,
  };
};
