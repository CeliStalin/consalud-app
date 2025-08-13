import { useState, useEffect, useCallback } from 'react';
import { fetchNumerosCalle, NumeroCalle } from '../services';

interface UseNumerosCalleAutocompleteProps {
  nombreCalle?: string;
  idComuna?: number;
}

interface UseNumerosCalleAutocompleteReturn {
  numeros: NumeroCalle[];
  loading: boolean;
  error: string | null;
  searchNumeros: (searchTerm: string) => void;
  clearNumeros: () => void;
}

export const useNumerosCalleAutocomplete = ({
  nombreCalle,
  idComuna
}: UseNumerosCalleAutocompleteProps): UseNumerosCalleAutocompleteReturn => {
  const [numeros, setNumeros] = useState<NumeroCalle[]>([]);
  const [allNumeros, setAllNumeros] = useState<NumeroCalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los números de la calle cuando cambia la calle o comuna
  useEffect(() => {
    if (!nombreCalle || !idComuna) {
      setAllNumeros([]);
      setNumeros([]);
      return;
    }

    const loadNumeros = async () => {
      setLoading(true);
      setError(null);

      try {
        const numerosData = await fetchNumerosCalle(nombreCalle, idComuna);
        setAllNumeros(numerosData);
        setNumeros([]); // Inicialmente no mostrar nada hasta que el usuario escriba
      } catch (err) {
        setError('Error al cargar los números');
        setAllNumeros([]);
        setNumeros([]);
        console.error('Error fetching numeros:', err);
      } finally {
        setLoading(false);
      }
    };

    loadNumeros();
  }, [nombreCalle, idComuna]);

  // Función para buscar números
  const searchNumeros = useCallback((searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 1) {
      setNumeros([]);
      return;
    }

    const filteredNumeros = allNumeros.filter(numero =>
      numero.numeroCalle.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setNumeros(filteredNumeros);
  }, [allNumeros]);

  // Función para limpiar los números
  const clearNumeros = useCallback(() => {
    setNumeros([]);
    setError(null);
  }, []);

  return {
    numeros,
    loading,
    error,
    searchNumeros,
    clearNumeros
  };
}; 