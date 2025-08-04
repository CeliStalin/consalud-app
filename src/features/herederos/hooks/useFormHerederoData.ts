import { useCallback } from 'react';
import { useFormHeredero } from '../contexts/FormHerederoContext';
import { FormData } from '../interfaces/FormData';

export const useFormHerederoData = () => {
  const {
    formData,
    loading,
    error,
    isDirty,
    saveFormData,
    updateFormData,
    clearFormData,
    validateFormData,
    getFormData,
    reloadFromStorage,
    forceSyncFromStorage
  } = useFormHeredero();

  // Hook para manejar cambios en campos específicos
  const handleFieldChange = useCallback((field: string | number | symbol, value: any) => {
    updateFormData(field, value);
  }, [updateFormData]);

  // Hook para guardar datos completos del formulario
  const handleSaveForm = useCallback((data: FormData) => {
    saveFormData(data);
  }, [saveFormData]);

  // Hook para limpiar formulario
  const handleClearForm = useCallback(() => {
    clearFormData();
  }, [clearFormData]);

  // Hook para validar formulario
  const handleValidateForm = useCallback(() => {
    return validateFormData();
  }, [validateFormData]);

  // Hook para obtener datos del formulario
  const handleGetFormData = useCallback(() => {
    return getFormData();
  }, [getFormData]);

  // Hook para recargar datos del storage
  const handleReloadFromStorage = useCallback(() => {
    reloadFromStorage();
  }, [reloadFromStorage]);

  // Hook para forzar sincronización
  const handleForceSyncFromStorage = useCallback(() => {
    forceSyncFromStorage();
  }, [forceSyncFromStorage]);

  return {
    // Estado
    formData,
    loading,
    error,
    isDirty,
    
    // Métodos
    handleFieldChange,
    handleSaveForm,
    handleClearForm,
    handleValidateForm,
    handleGetFormData,
    handleReloadFromStorage,
    handleForceSyncFromStorage,
    
    // Métodos directos del contexto
    saveFormData,
    updateFormData,
    clearFormData,
    validateFormData,
    getFormData,
    reloadFromStorage,
    forceSyncFromStorage
  };
}; 