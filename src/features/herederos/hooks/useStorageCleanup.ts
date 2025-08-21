import { useCallback } from 'react';
import { clearAllFiles } from '../services/fileStorageService';

interface UseStorageCleanupReturn {
  cleanupFormHerederoData: (currentRut?: string) => void;
  cleanupAllHerederoData: () => void;
  migrateOldKeys: (currentRut: string) => void;
  cleanupDocumentsByRut: (rut: string) => void;
}

export const useStorageCleanup = (): UseStorageCleanupReturn => {
  // Limpiar claves específicas de formHerederoData
  const cleanupFormHerederoData = useCallback((currentRut?: string) => {
    try {
      if (currentRut) {
        const currentKey = `formHerederoData_${currentRut.replace(/[^0-9kK]/g, '')}`;

        // Limpiar la clave antigua sin RUT si existe
        const oldKey = 'formHerederoData';
        const oldData = sessionStorage.getItem(oldKey);
        if (oldData) {
          sessionStorage.removeItem(oldKey);
        }

        // Limpiar otras claves de formHerederoData que no correspondan al RUT actual
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('formHerederoData_') && key !== currentKey) {
            const storedData = sessionStorage.getItem(key);
            if (storedData) {
              try {
                const parsedData = JSON.parse(storedData);
                // Solo limpiar si los datos no están completos o son muy antiguos
                const isCompleteData = parsedData.nombres && parsedData.fechaNacimiento && parsedData.telefono;
                if (!isCompleteData) {
                  sessionStorage.removeItem(key);
                }
              } catch {
                // Si hay error al parsear, limpiar
                sessionStorage.removeItem(key);
              }
            }
          }
        });
      } else {
        // Si no hay RUT, limpiar todas las claves de formHerederoData
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('formHerederoData')) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error al limpiar claves de formHerederoData:', error);
    }
  }, []);

  // Limpiar documentos específicos por RUT
  const cleanupDocumentsByRut = useCallback((rut: string) => {
    try {
      const rutLimpio = rut.replace(/[^0-9kK]/g, '');
      if (rutLimpio) {
        // Limpiar archivos usando el servicio
        clearAllFiles(rutLimpio);

        // Limpiar otras claves de documentos que no correspondan al RUT actual
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('fileStorage_') && !key.includes(rutLimpio)) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error al limpiar documentos por RUT:', error);
    }
  }, []);

  // Limpiar todos los datos relacionados con herederos
  const cleanupAllHerederoData = useCallback(() => {
    try {
      // Limpiar datos del heredero
      sessionStorage.removeItem('herederoData');

      // Limpiar datos del formulario del heredero
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('formHerederoData')) {
          sessionStorage.removeItem(key);
        }
      });

      // Limpiar datos de archivos
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('fileStorage_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error al limpiar todos los datos de herederos:', error);
    }
  }, []);

  // Migrar datos de claves antiguas a nuevas
  const migrateOldKeys = useCallback((currentRut: string) => {
    try {
      const currentKey = `formHerederoData_${currentRut.replace(/[^0-9kK]/g, '')}`;
      const oldKey = 'formHerederoData';

      // Verificar si existe la clave antigua sin RUT
      const oldData = sessionStorage.getItem(oldKey);
      const currentData = sessionStorage.getItem(currentKey);

      if (oldData && !currentData) {
        // Migrar datos de la clave antigua a la nueva
        sessionStorage.setItem(currentKey, oldData);
        sessionStorage.removeItem(oldKey);
      } else if (oldData && currentData) {
        // Si ambas claves existen, mantener solo la nueva y limpiar la antigua
        sessionStorage.removeItem(oldKey);
      }
    } catch (error) {
      console.error('Error al migrar claves:', error);
    }
  }, []);

  return {
    cleanupFormHerederoData,
    cleanupAllHerederoData,
    migrateOldKeys,
    cleanupDocumentsByRut
  };
};
