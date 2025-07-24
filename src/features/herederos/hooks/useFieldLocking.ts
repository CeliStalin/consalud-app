import { useState, useCallback } from 'react';

interface UseFieldLockingReturn {
  isLocked: boolean;
  setLocked: (locked: boolean) => void;
  shouldLockFields: boolean;
}

/**
 * Hook personalizado para manejar el bloqueo de campos del formulario
 * basado en la respuesta exitosa de la API de mejor contactibilidad
 */
export const useFieldLocking = (): UseFieldLockingReturn => {
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const setLocked = useCallback((locked: boolean) => {
    setIsLocked(locked);
  }, []);

  // Los campos se deben bloquear cuando la API devuelve 200 y hay datos del heredero
  const shouldLockFields = isLocked;

  return {
    isLocked,
    setLocked,
    shouldLockFields
  };
}; 