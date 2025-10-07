import { useState, useEffect, useCallback } from 'react';
import { fetchCallesPorComuna, Calle } from '../services';

interface UseCallesAutocompleteProps {
  idComuna?: number;
}

interface UseCallesAutocompleteReturn {
  calles: Calle[];
  loading: boolean;
  error: string | null;
  searchCalles: (searchTerm: string) => void;
  clearCalles: () => void;
}

export const useCallesAutocomplete = ({
  idComuna,
}: UseCallesAutocompleteProps): UseCallesAutocompleteReturn => {
  const [calles, setCalles] = useState<Calle[]>([]);
  const [allCalles, setAllCalles] = useState<Calle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las calles de la comuna cuando cambia
  useEffect(() => {
    if (!idComuna) {
      setAllCalles([]);
      setCalles([]);
      return;
    }

    const loadCalles = async () => {
      setLoading(true);
      setError(null);

      try {
        const callesData = await fetchCallesPorComuna(idComuna);
        setAllCalles(callesData);
        setCalles([]); // Inicialmente no mostrar nada hasta que el usuario escriba
      } catch (err) {
        setError('Error al cargar las calles');
        setAllCalles([]);
        setCalles([]);
        console.error('Error fetching calles:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCalles();
  }, [idComuna]);

  // Función para buscar calles
  const searchCalles = useCallback(
    (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 2) {
        setCalles([]);
        return;
      }

      const filteredCalles = allCalles.filter(calle =>
        calle.nombreCalle.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setCalles(filteredCalles);
    },
    [allCalles]
  );

  // Función para limpiar las calles
  const clearCalles = useCallback(() => {
    setCalles([]);
    setError(null);
  }, []);

  return {
    calles,
    loading,
    error,
    searchCalles,
    clearCalles,
  };
};
