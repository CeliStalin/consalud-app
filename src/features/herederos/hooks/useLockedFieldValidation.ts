import { useCallback } from 'react';

interface UseLockedFieldValidationReturn {
  validateLockedFields: (formData: any, fieldsLocked: boolean) => boolean;
  getLockedFieldErrors: (formData: any, fieldsLocked: boolean) => Record<string, string>;
}

/**
 * Hook personalizado para manejar la validación de campos bloqueados
 * Cuando los campos están bloqueados, no se validan ya que no se pueden editar
 */
export const useLockedFieldValidation = (): UseLockedFieldValidationReturn => {
  
  const validateLockedFields = useCallback((fieldsLocked: boolean): boolean => {
    if (!fieldsLocked) {
      return true; // Si no están bloqueados, la validación se hace normalmente
    }
    
    // Cuando están bloqueados, los campos ya tienen datos válidos del sistema
    return true;
  }, []);

  const getLockedFieldErrors = useCallback((fieldsLocked: boolean): Record<string, string> => {
    if (!fieldsLocked) {
      return {}; // Si no están bloqueados, no hay errores específicos
    }
    
    // Cuando están bloqueados, no hay errores de validación
    return {};
  }, []);

  return {
    validateLockedFields,
    getLockedFieldErrors
  };
}; 