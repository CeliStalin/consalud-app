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

  const buscarTitular = useCallback(async (rut: string): Promise<Titular | null> => {
    setLoading(true);
    setError(null);
    try {
      const bffDns = import.meta.env.VITE_BFF_HEREDEROS_DNS;
      if (bffDns) {
        try {
          // Extraer solo los números del rut (sin DV)
          const rutNumeros = rut.replace(/[^0-9]/g, '');
          // Eliminar el último dígito (DV)
          const rutSinDV = rutNumeros.slice(0, -1);
          const titularData = await fetchTitularByRut(Number(rutSinDV));
          if (!titularData || !titularData.id) {
            throw new Error('Titular no encontrado');
          }
          setTitular(titularData);
          return titularData;
        } catch (err: any) {
          if (err.message === '500') {
            setError('BFF_ERROR_500');
          } else {
            setError('Error al buscar el titular en BFF');
          }
          setTitular(null);
          return null;
        }
      } else {
        // Mock local - mantener para desarrollo local
        const { data } = await axios.get('http://localhost:3001/Titular');
        const formattedRut = formatSimpleRut(rut);
        const titularEncontrado = data.find((t: Titular) => t.rut === formattedRut);
        if (!titularEncontrado) {
          throw new Error('Titular no encontrado');
        }
        setTitular(titularEncontrado);
        return titularEncontrado;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar el titular';
      setError(errorMessage);
      setTitular(null);
      console.error('Error en buscarTitular:', err);
      return null;
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