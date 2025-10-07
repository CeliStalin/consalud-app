import React, { useCallback, useEffect } from 'react';
import { useStorageCleanup } from '../hooks/useStorageCleanup';
import { clearAllFiles, getStorageStats } from '../services/fileStorageService';

interface StorageCleanupProps {
  rut: string;
  onCleanup?: () => void;
}

export const StorageCleanup: React.FC<StorageCleanupProps> = ({ rut, onCleanup }) => {
  const { cleanupFormHerederoData, migrateOldKeys } = useStorageCleanup();

  // Función para limpiar archivos antiguos automáticamente
  const cleanupOldFiles = useCallback(() => {
    try {
      const stats = getStorageStats(rut);

      // Si el uso es mayor al 90%, limpiar archivos
      if (stats.percentageUsed > 90) {
        console.warn('Limpieza automática de archivos iniciada - uso de storage:', stats.percentageUsed.toFixed(1) + '%');
        clearAllFiles(rut);

        if (onCleanup) {
          onCleanup();
        }
      }
    } catch (error) {
      console.error('Error en limpieza automática:', error);
    }
  }, [rut, onCleanup]);

  // Limpiar claves duplicadas al montar el componente
  useEffect(() => {
    migrateOldKeys(rut);
    cleanupFormHerederoData(rut);
  }, [rut, migrateOldKeys, cleanupFormHerederoData]);

  // Limpiar archivos cuando el componente se desmonta
  useEffect(() => {
    return () => {
      // Solo limpiar si el uso es muy alto
      const stats = getStorageStats(rut);
      if (stats.percentageUsed > 95) {
        cleanupOldFiles();
      }
    };
  }, [rut, cleanupOldFiles]);

  // Limpiar archivos de otros RUTs cuando cambia el RUT actual
  useEffect(() => {
    const cleanupOtherRuts = () => {
      try {
        // Limpiar archivos de otros RUTs para liberar espacio
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('documentos_') && !key.includes(rut.replace(/[^0-9kK]/g, ''))) {
            sessionStorage.removeItem(key);
            console.log('🗑️ Limpiado archivos de RUT anterior:', key);
          }
        });
      } catch (error) {
        console.error('Error al limpiar archivos de otros RUTs:', error);
      }
    };

    cleanupOtherRuts();
  }, [rut]);

  return null;
};
