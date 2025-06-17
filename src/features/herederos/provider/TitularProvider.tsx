import React, { useState, useCallback } from "react";
import { Titular } from "../interfaces/Titular";
import { TitularProviderProps } from "../interfaces/TitularProviderProps";
import axios from "axios";
import { TitularContextType } from "../interfaces/TitularContext";
import { TitularContext } from "../contexts/TitularContext";
import { useRutChileno } from "../hooks/useRutChileno";
import { fetchTitularByRut } from '../services/bffHerederosService';

export const TitularProvider: React.FC<TitularProviderProps> = ({ children }) => {
  // Estado para el titular
  const [titular, setTitular] = useState<Titular | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { formatSimpleRut } = useRutChileno();

  const buscarTitular = useCallback(async (rut: string) => {
    setLoading(true);
    setError(null);
    try {
      const bffDns = import.meta.env.VITE_BFF_HEREDEROS_DNS;
      if (bffDns) {
        // Llamada al BFF real
        try {
          const result = await fetchTitularByRut(Number(rut.replace(/[^0-9]/g, '')));
          // Aquí deberías parsear el resultado si es necesario
          // setTitular(result); // Descomentar y adaptar según la respuesta real
          setTitular(null); // Por ahora, para no romper el flujo
        } catch (err: any) {
          if (err.message === '500') {
            setError('BFF_ERROR_500');
          } else {
            setError('Error al buscar el titular en BFF');
          }
          setTitular(null);
          return;
        }
      } else {
        // Mock local
        const { data } = await axios.get('http://localhost:3001/Titular');
        const formattedRut = formatSimpleRut(rut);
        const titularEncontrado = data.find((t: Titular) => t.rut === formattedRut);
        if (!titularEncontrado) {
          throw new Error('Titular no encontrado');
        }
        setTitular(titularEncontrado);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar el titular';
      setError(errorMessage);
      setTitular(null);
      console.error('Error en buscarTitular:', err);
    } finally {
      setLoading(false);
    }
  }, [formatSimpleRut]);

  const limpiarTitular = useCallback(() => {
    setTitular(null);
    setError(null);
  }, []);

  // Valor del contexto
  const value: TitularContextType = {
    titular,
    loading,
    error,
    buscarTitular,
    limpiarTitular
  };

  return (
    <TitularContext.Provider value={value}>
      {children}
    </TitularContext.Provider>
  );
};

export default TitularProvider;