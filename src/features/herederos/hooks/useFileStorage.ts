import { useState, useCallback, useEffect } from 'react';
import { Documento, DocumentFileState } from '../interfaces/Documento';
import {
  saveFileToStorage,
  getFilesFromStorage,
  getFileByType,
  removeFileFromStorage,
  clearAllFiles,
  getStorageStats,
} from '../services/fileStorageService';

interface UseFileStorageReturn {
  // Estado
  documentFiles: DocumentFileState;
  loading: boolean;
  error: string | null;
  storageStats: {
    totalFiles: number;
    totalSize: number;
    maxSize: number;
    percentageUsed: number;
  };

  // Métodos
  handleFileChange: (file: File, tipoId: number, tipo: string, rut: string) => Promise<void>;
  removeFile: (tipoId: number, rut: string) => void;
  clearAllFiles: (rut: string) => void;
  loadFilesFromStorage: (rut: string) => void;
  getFileByType: (tipoId: number, rut: string) => Documento | null;
  validateFile: (file: File) => string | null;
}

export const useFileStorage = (): UseFileStorageReturn => {
  const [documentFiles, setDocumentFiles] = useState<DocumentFileState>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [storageStats, setStorageStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    maxSize: 50 * 1024 * 1024, // 50MB
    percentageUsed: 0,
  });

  // Validar archivo
  const validateFile = useCallback((file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf'];

    if (file.size > maxSize) {
      return 'El archivo debe ser menor a 10MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos PDF';
    }

    return null;
  }, []);

  // Manejar cambio de archivo
  const handleFileChange = useCallback(
    async (file: File, tipoId: number, tipo: string, rut: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        // Validar archivo
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }

        // Guardar archivo en storage
        const documento = await saveFileToStorage(file, tipoId, tipo, rut);

        // Actualizar estado local
        setDocumentFiles(prev => ({
          ...prev,
          [tipoId]: {
            file,
            error: null,
            documento,
          },
        }));

        // Actualizar estadísticas
        const stats = getStorageStats(rut);
        setStorageStats(stats);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al guardar el archivo';
        setError(errorMessage);

        // Actualizar estado con error
        setDocumentFiles(prev => ({
          ...prev,
          [tipoId]: {
            file: null,
            error: errorMessage,
            documento: undefined,
          },
        }));
      } finally {
        setLoading(false);
      }
    },
    [validateFile]
  );

  // Eliminar archivo
  const removeFile = useCallback((tipoId: number, rut: string): void => {
    try {
      const success = removeFileFromStorage(rut, tipoId);
      if (success) {
        setDocumentFiles(prev => {
          const newState = { ...prev };
          delete newState[tipoId];
          return newState;
        });

        // Actualizar estadísticas
        const stats = getStorageStats(rut);
        setStorageStats(stats);
      }
    } catch (err) {
      console.error('Error al eliminar archivo:', err);
    }
  }, []);

  // Limpiar todos los archivos
  const clearAllFilesHandler = useCallback((rut: string): void => {
    try {
      clearAllFiles(rut);
      setDocumentFiles({});
      setStorageStats({
        totalFiles: 0,
        totalSize: 0,
        maxSize: 50 * 1024 * 1024,
        percentageUsed: 0,
      });
    } catch (err) {
      console.error('Error al limpiar archivos:', err);
    }
  }, []);

  // Cargar archivos desde storage
  const loadFilesFromStorage = useCallback((rut: string): void => {
    try {
      const documentos = getFilesFromStorage(rut);
      const newDocumentFiles: DocumentFileState = {};

      documentos.forEach(documento => {
        newDocumentFiles[documento.tipoId] = {
          file: null, // No podemos restaurar el File object, solo la metadata
          error: null,
          documento,
        };
      });

      setDocumentFiles(newDocumentFiles);

      // Actualizar estadísticas
      const stats = getStorageStats(rut);
      setStorageStats(stats);
    } catch (err) {
      console.error('Error al cargar archivos desde storage:', err);
    }
  }, []);

  // Obtener archivo por tipo
  const getFileByTypeHandler = useCallback((tipoId: number, rut: string): Documento | null => {
    return getFileByType(rut, tipoId);
  }, []);

  // Limpiar error después de un tiempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    // Estado
    documentFiles,
    loading,
    error,
    storageStats,

    // Métodos
    handleFileChange,
    removeFile,
    clearAllFiles: clearAllFilesHandler,
    loadFilesFromStorage,
    getFileByType: getFileByTypeHandler,
    validateFile,
  };
};
