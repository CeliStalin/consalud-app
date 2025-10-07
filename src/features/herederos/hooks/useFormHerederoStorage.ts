import { useCallback, useEffect, useState } from 'react';
import { FormData, FormHerederoData } from '../interfaces/FormData';
import { FormDataTransformer } from '../services/formDataTransformer';

/**
 * Hook personalizado para manejar el session storage con la nueva estructura FormHerederoData
 * Mantiene compatibilidad con la estructura anterior
 */
export const useFormHerederoStorage = (rut: string) => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storageKey = `formHerederoData_${rut.replace(/[^0-9kK]/g, '')}`;

  // Cargar datos del session storage
  const loadFromStorage = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Verificar si es la nueva estructura o la antigua
        if (parsed.RutPersona) {
          // Nueva estructura FormHerederoData
          const convertedData = FormDataTransformer.toFormData(parsed as FormHerederoData);
          setFormData(convertedData);
          return convertedData;
        } else {
          // Estructura antigua FormData
          if (parsed.fechaNacimiento) {
            parsed.fechaNacimiento = new Date(parsed.fechaNacimiento);
          }
          setFormData(parsed as FormData);
          return parsed as FormData;
        }
      }
      return null;
    } catch (err) {
      console.error('Error al cargar datos del storage:', err);
      setError('Error al cargar datos del storage');
      return null;
    }
  }, [storageKey]);

  // Guardar datos en el session storage
  const saveToStorage = useCallback(
    (data: FormData) => {
      try {
        setIsLoading(true);
        setError(null);

        // Convertir FormData a FormHerederoData para el storage
        const formHerederoData = FormDataTransformer.toFormHerederoData(data, rut);
        sessionStorage.setItem(storageKey, JSON.stringify(formHerederoData));

        setFormData(data);
        return true;
      } catch (err) {
        console.error('Error al guardar datos en el storage:', err);
        setError('Error al guardar datos en el storage');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [storageKey, rut]
  );

  // Limpiar datos del session storage
  const clearStorage = useCallback(() => {
    try {
      sessionStorage.removeItem(storageKey);
      setFormData(null);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error al limpiar storage:', err);
      setError('Error al limpiar storage');
      return false;
    }
  }, [storageKey]);

  // Obtener datos en formato FormHerederoData (nueva estructura)
  const getFormHerederoData = useCallback((): FormHerederoData | null => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.RutPersona) {
          return parsed as FormHerederoData;
        } else if (formData) {
          // Convertir FormData existente a FormHerederoData
          return FormDataTransformer.toFormHerederoData(formData, rut);
        }
      }
      return null;
    } catch (err) {
      console.error('Error al obtener FormHerederoData:', err);
      return null;
    }
  }, [storageKey, formData, rut]);

  // Migrar datos de estructura antigua a nueva
  const migrateToNewStructure = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);

        // Si ya está en la nueva estructura, no hacer nada
        if (parsed.RutPersona) {
          return true;
        }

        // Si está en la estructura antigua, convertir y guardar
        if (parsed.fechaNacimiento) {
          parsed.fechaNacimiento = new Date(parsed.fechaNacimiento);
        }

        const oldFormData = parsed as FormData;
        const newFormHerederoData = FormDataTransformer.toFormHerederoData(oldFormData, rut);

        sessionStorage.setItem(storageKey, JSON.stringify(newFormHerederoData));
        setFormData(oldFormData);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error en migración:', err);
      return false;
    }
  }, [storageKey, rut]);

  // Cargar datos al inicializar
  useEffect(() => {
    if (rut) {
      loadFromStorage();
    }
  }, [rut, loadFromStorage]);

  // Escuchar cambios en el session storage
  useEffect(() => {
    const handleStorageChange = () => {
      loadFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadFromStorage]);

  return {
    formData,
    isLoading,
    error,
    loadFromStorage,
    saveToStorage,
    clearStorage,
    getFormHerederoData,
    migrateToNewStructure,
  };
};
