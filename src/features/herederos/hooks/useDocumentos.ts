import { useCallback, useState } from 'react';
import { Documento, DocumentosResponse } from '../interfaces/Documento';
import { enviarDocumentos as enviarDocumentosService } from '../services/herederosService';

interface UseDocumentosReturn {
  loading: boolean;
  error: string | null;
  success: boolean;
  enviarDocumentos: (
    idSolicitud: number,
    usuarioCreacion: string,
    rutTitularFallecido: number,
    documentos: Documento[]
  ) => Promise<DocumentosResponse>;
  resetState: () => void;
}

/**
 * Hook personalizado para manejar el envío de documentos
 * Proporciona estado y métodos para enviar documentos a la API
 */
export const useDocumentos = (): UseDocumentosReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const enviarDocumentos = useCallback(async (
    idSolicitud: number,
    usuarioCreacion: string,
    rutTitularFallecido: number,
    documentos: Documento[]
  ): Promise<DocumentosResponse> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('Iniciando envío de documentos:', {
        idSolicitud,
        usuarioCreacion,
        rutTitularFallecido,
        totalDocumentos: documentos.length
      });

      const result = await enviarDocumentosService(
        idSolicitud,
        usuarioCreacion,
        rutTitularFallecido,
        documentos
      );

      if (result.success) {
        console.log('Documentos enviados exitosamente');
        setSuccess(true);
        return result;
      } else {
        throw new Error('Error en la respuesta de la API');
      }

    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al enviar documentos';
      console.error('Error en useDocumentos:', errorMessage);
      setError(errorMessage);

      // Retornar respuesta de error
      return {
        success: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  return {
    loading,
    error,
    success,
    enviarDocumentos,
    resetState
  };
};
