import { useState, useEffect } from 'react';
import { TipoDocumento } from '../interfaces/Pargen';
import { fetchTiposDocumento } from '../services/herederosService';

interface UseTiposDocumentoReturn {
  tiposDocumento: TipoDocumento[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTiposDocumento = (): UseTiposDocumentoReturn => {
  const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTiposDocumento();
      setTiposDocumento(data);
    } catch (err) {
      console.error('Error al obtener tipos de documento:', err);
      setError('Error al cargar los tipos de documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = async () => {
    await fetchData();
  };

  return {
    tiposDocumento,
    loading,
    error,
    refetch,
  };
};
