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
      console.log('🔍 Debug useDocumentos - err.message:', err.message);
      console.log('🔍 Debug useDocumentos - err completo:', err);
      setError(errorMessage);

      // Verificar si es un error que debe propagarse (retry agotado)
      if (err.message && (
        err.message.includes('Falló definitivamente después de') ||
        err.message.includes('Falló definitivamente') ||
        err.message.includes('definitivamente después de')
      )) {
        console.log('🚨 Error crítico en useDocumentos - propagando error');
        console.log('🚨 Mensaje de error crítico:', err.message);
        // Re-lanzar el error para que sea capturado por CargaMandatosCard
        throw err;
      }

      // Verificar si es "Failed to fetch" que también debe propagarse
      if (err.message && err.message.includes('Failed to fetch')) {
        console.log('🚨 Error "Failed to fetch" en useDocumentos - propagando error');
        throw err;
      }

      console.log('⚠️ Error no crítico en useDocumentos - retornando respuesta de error');
      // Retornar respuesta de error para errores no críticos
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
