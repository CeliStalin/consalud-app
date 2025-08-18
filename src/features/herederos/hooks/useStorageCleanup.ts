import { useCallback } from 'react';

interface UseStorageCleanupReturn {
  cleanupFormHerederoData: (currentRut?: string) => void;
  cleanupAllHerederoData: () => void;
  migrateOldKeys: (currentRut: string) => void;
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
          console.log('🗑️ Limpiada clave antigua sin RUT:', oldKey);
        }
        
        // Limpiar otras claves de formHerederoData que no correspondan al RUT actual
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('formHerederoData_') && key !== currentKey) {
            sessionStorage.removeItem(key);
            console.log('🗑️ Limpiada clave de RUT anterior:', key);
          }
        });
      } else {
        // Si no hay RUT, limpiar todas las claves de formHerederoData
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('formHerederoData')) {
            sessionStorage.removeItem(key);
            console.log('🗑️ Limpiada clave de formulario heredero:', key);
          }
        });
      }
    } catch (error) {
      console.error('Error al limpiar claves de formHerederoData:', error);
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
          console.log('🗑️ Limpiada clave de formulario heredero:', key);
        }
      });
      
      // Limpiar datos de archivos
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('fileStorage_')) {
          sessionStorage.removeItem(key);
        }
      });
      
      console.log('🧹 Todos los datos de herederos limpiados');
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
        console.log('🔄 Migrado datos de clave antigua a nueva:', oldKey, '→', currentKey);
      } else if (oldData && currentData) {
        // Si ambas claves existen, mantener solo la nueva y limpiar la antigua
        sessionStorage.removeItem(oldKey);
        console.log('🗑️ Limpiada clave duplicada sin RUT:', oldKey);
      }
    } catch (error) {
      console.error('Error al migrar claves:', error);
    }
  }, []);

  return {
    cleanupFormHerederoData,
    cleanupAllHerederoData,
    migrateOldKeys
  };
};
