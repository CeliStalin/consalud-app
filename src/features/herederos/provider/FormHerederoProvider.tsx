import React, { useState, useCallback, useEffect } from "react";
import { FormData } from "../interfaces/FormData";
import { FormHerederoContextType } from "../interfaces/FormHerederoContext";
import { FormHerederoContext } from "../contexts/FormHerederoContext";

interface FormHerederoProviderProps {
  children: React.ReactNode;
  rutHeredero?: string; // Agregar RUT como prop
}

const STORAGE_KEY_PREFIX = 'formHerederoData';

export const FormHerederoProvider: React.FC<FormHerederoProviderProps> = ({ children, rutHeredero }) => {
  // Generar clave única basada en el RUT
  const getStorageKey = useCallback(() => {
    if (!rutHeredero) return STORAGE_KEY_PREFIX;
    return `${STORAGE_KEY_PREFIX}_${rutHeredero.replace(/[^0-9kK]/g, '')}`;
  }, [rutHeredero]);

  const [formData, setFormData] = useState<FormData | null>(() => {
    const storageKey = getStorageKey();
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Convertir la fecha de vuelta a objeto Date si existe
        if (parsed.fechaNacimiento) {
          parsed.fechaNacimiento = new Date(parsed.fechaNacimiento);
        }
        return parsed as FormData;
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(() => {
    // Verificar si hay datos en sessionStorage para determinar si está dirty
    const storageKey = getStorageKey();
    return sessionStorage.getItem(storageKey) !== null;
  });

  // Guardar en sessionStorage cuando cambie formData
  useEffect(() => {
    const storageKey = getStorageKey();
    if (formData) {
      const dataToStore = {
        ...formData,
        fechaNacimiento: formData.fechaNacimiento ? formData.fechaNacimiento.toISOString() : null
      };
      sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
      setIsDirty(true);
    } else {
      sessionStorage.removeItem(storageKey);
      setIsDirty(false);
    }
  }, [formData, getStorageKey]);

  // Escuchar cambios en sessionStorage para sincronización entre tabs
  useEffect(() => {
    const handleStorage = () => {
      const storageKey = getStorageKey();
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.fechaNacimiento) {
            parsed.fechaNacimiento = new Date(parsed.fechaNacimiento);
          }
          setFormData(parsed as FormData);
          setIsDirty(true);
        } catch {
          setFormData(null);
          setIsDirty(false);
        }
      } else {
        setFormData(null);
        setIsDirty(false);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [getStorageKey]);

  // Función para recargar datos del sessionStorage
  const reloadFromStorage = useCallback(() => {
    const storageKey = getStorageKey();
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.fechaNacimiento) {
          parsed.fechaNacimiento = new Date(parsed.fechaNacimiento);
        }
        setFormData(parsed as FormData);
        setIsDirty(true);
      } catch {
        setFormData(null);
        setIsDirty(false);
      }
    }
  }, [getStorageKey]);

  const saveFormData = useCallback((data: FormData) => {
    console.log('💾 Guardando datos en provider:', data);
    setLoading(true);
    setError(null);
    try {
      // Guardar inmediatamente en sessionStorage
      const storageKey = getStorageKey();
      const dataToStore = {
        ...data,
        fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.toISOString() : null
      };
      sessionStorage.setItem(storageKey, JSON.stringify(dataToStore));
      console.log('✅ Datos guardados en sessionStorage');
      
      // Actualizar el estado del contexto
      setFormData(data);
      setIsDirty(true);
      console.log('✅ Estado del contexto actualizado');
    } catch (err) {
      console.error('❌ Error al guardar datos:', err);
      setError('Error al guardar los datos del formulario');
    } finally {
      setLoading(false);
    }
  }, [getStorageKey]);

  const updateFormData = useCallback((field: string | number | symbol, value: any) => {
    setFormData(prev => {
      if (!prev) {
        // Si no hay datos previos, crear un objeto base
        const baseData: FormData = {
          fechaNacimiento: null,
          nombres: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          sexo: '',
          parentesco: '',
          telefono: '',
          correoElectronico: '',
          ciudad: '',
          comuna: '',
          calle: '',
          numero: '',
          deptoBloqueOpcional: '',
          villaOpcional: '',
          region: ''
        };
        return { ...baseData, [field]: value };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const clearFormData = useCallback(() => {
    setFormData(null);
    setError(null);
    setIsDirty(false);
    const storageKey = getStorageKey();
    sessionStorage.removeItem(storageKey);
  }, [getStorageKey]);

  const validateFormData = useCallback((): boolean => {
    if (!formData) return false;

    // Validaciones básicas
    const requiredFields: (keyof FormData)[] = [
      'nombres', 'apellidoPaterno', 'apellidoMaterno', 
      'sexo', 'parentesco', 'telefono', 'correoElectronico'
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field] === '') {
        return false;
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correoElectronico)) {
      return false;
    }

    // Validar teléfono (al menos 8 dígitos)
    if (formData.telefono.replace(/\D/g, '').length < 8) {
      return false;
    }

    // Validar fecha de nacimiento
    if (!formData.fechaNacimiento) {
      return false;
    }

    return true;
  }, [formData]);

  const getFormData = useCallback((): FormData | null => {
    return formData;
  }, [formData]);

  const forceSyncFromStorage = useCallback(() => {
    console.log('🔄 Forzando sincronización desde sessionStorage');
    const storageKey = getStorageKey();
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.fechaNacimiento) {
          parsed.fechaNacimiento = new Date(parsed.fechaNacimiento);
        }
        setFormData(parsed as FormData);
        setIsDirty(true);
        console.log('✅ Sincronización forzada completada');
      } catch (error) {
        console.error('❌ Error en sincronización forzada:', error);
      }
    }
  }, [getStorageKey]);

  const contextValue: FormHerederoContextType = {
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
  };

  return (
    <FormHerederoContext.Provider value={contextValue}>
      {children}
    </FormHerederoContext.Provider>
  );
}; 