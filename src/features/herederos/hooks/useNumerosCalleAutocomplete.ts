import { useCallback, useEffect, useState } from 'react';
import { fetchNumerosCalle, NumeroCalle } from '../services';

interface UseNumerosCalleAutocompleteProps {
  nombreCalle?: string;
  idComuna?: number;
  hasExistingValue?: boolean; // Nueva prop para indicar si ya hay un valor válido
}

interface UseNumerosCalleAutocompleteReturn {
  numeros: NumeroCalle[];
  loading: boolean;
  error: string | null;
  searchNumeros: (searchTerm: string) => void;
  clearNumeros: () => void;
  resetState: () => void;
}

export const useNumerosCalleAutocomplete = ({
  nombreCalle,
  idComuna,
  hasExistingValue = false,
}: UseNumerosCalleAutocompleteProps): UseNumerosCalleAutocompleteReturn => {
  const [numeros, setNumeros] = useState<NumeroCalle[]>([]);
  const [allNumeros, setAllNumeros] = useState<NumeroCalle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSuccessfulCall, setLastSuccessfulCall] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar todos los números de la calle cuando cambia la calle o comuna
  useEffect(() => {
    // Validar que tenemos todos los datos necesarios
    if (!idComuna || !nombreCalle) {
      setAllNumeros([]);
      setNumeros([]);
      setError(null);
      setIsInitialized(false);
      return;
    }

    // Si ya hay un valor válido, no hacer la llamada a la API
    if (hasExistingValue) {
      setIsInitialized(true);
      return;
    }

    // Crear una clave única para esta combinación de calle y comuna
    const callKey = `${nombreCalle}-${idComuna}`;

    // Si ya tenemos datos para esta combinación y no hay error, no hacer la llamada
    if (lastSuccessfulCall === callKey && allNumeros.length > 0 && !error) {
      setIsInitialized(true);
      return;
    }

    // Evitar llamadas múltiples mientras se está cargando
    if (loading) {
      return;
    }

    // Validar que los datos estén completamente cargados antes de hacer la llamada
    if (!idComuna || idComuna <= 0 || !nombreCalle || nombreCalle.trim() === '') {
      return;
    }

    // Agregar un pequeño delay para asegurar que los datos estén completamente cargados
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const numerosData = await fetchNumerosCalle(nombreCalle, idComuna);
        setAllNumeros(numerosData);
        setNumeros([]); // Inicialmente no mostrar nada hasta que el usuario escriba
        setLastSuccessfulCall(callKey);
        setIsInitialized(true);
      } catch (err) {
        // Solo mostrar error si no tenemos datos previos para esta combinación
        if (lastSuccessfulCall !== callKey) {
          setError('Error al cargar los números');
        }
        // No limpiar los datos existentes si ya teníamos datos para esta combinación
        if (lastSuccessfulCall !== callKey) {
          setAllNumeros([]);
          setNumeros([]);
        }
        setIsInitialized(true);
        console.error('Error fetching numeros:', err);
      } finally {
        setLoading(false);
      }
    }, 100); // Pequeño delay para evitar llamadas prematuras

    return () => {
      clearTimeout(timeoutId);
    };
  }, [
    nombreCalle,
    idComuna,
    lastSuccessfulCall,
    allNumeros.length,
    error,
    loading,
    hasExistingValue,
  ]);

  // Función para buscar números
  const searchNumeros = useCallback(
    (searchTerm: string) => {
      if (!searchTerm || searchTerm.length < 1) {
        setNumeros([]);
        return;
      }

      // Solo buscar si tenemos datos cargados
      if (!isInitialized || allNumeros.length === 0) {
        return;
      }

      const filteredNumeros = allNumeros.filter(numero =>
        numero.numeroCalle.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      setNumeros(filteredNumeros);
    },
    [allNumeros, isInitialized]
  );

  // Función para limpiar los números
  const clearNumeros = useCallback(() => {
    setNumeros([]);
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setNumeros([]);
    setAllNumeros([]);
    setLoading(false);
    setError(null);
    setLastSuccessfulCall('');
    setIsInitialized(false);
  }, []);

  return {
    numeros,
    loading,
    error,
    searchNumeros,
    clearNumeros,
    resetState,
  };
};
