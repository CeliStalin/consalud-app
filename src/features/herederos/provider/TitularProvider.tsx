import React, { useState, useCallback, useEffect } from "react";
import { Titular } from "../interfaces/Titular";
import { TitularProviderProps } from "../interfaces/TitularProviderProps";
import axios from "axios";
import { TitularContextType } from "../interfaces/TitularContext";
import { TitularContext } from "../contexts/TitularContext";
import { useRutChileno } from "../hooks/useRutChileno";
import { fetchTitularByRut } from '../services';

export const TitularProvider: React.FC<TitularProviderProps> = ({ children }) => {
  const [titular, setTitular] = useState<Titular | null>(() => {
    const stored = sessionStorage.getItem('titularContext');
    if (stored) {
      try {
        return JSON.parse(stored) as Titular;
      } catch {
        return null;
      }
    }
    return null;
  });
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
          const rutNumeros = rut.replace(/[^0-9]/g, '');
          const rutSinDV = rutNumeros.slice(0, -1);
          // Obtener userName desde localStorage o sessionStorage si existe
          const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName') || '';
          const titularData = await fetchTitularByRut(Number(rutSinDV), userName);
          if (!titularData || !titularData.id) {
            throw new Error('Titular no encontrado');
          }
          setTitular(titularData);
          sessionStorage.setItem('titularContext', JSON.stringify(titularData));
          return titularData;
        } catch (err: any) {
          if (err.message === '500') {
            setError('BFF_ERROR_500');
          } else if (err.message === 'No hay solicitantes en maestro de contactibilidad') {
            setError('No hay solicitantes en maestro de contactibilidad');
          } else {
            setError('Error al buscar el titular en BFF');
          }
          setTitular(null);
          sessionStorage.removeItem('titularContext');
          return null;
        }
      } else {
        const { data } = await axios.get('http://localhost:3001/Titular');
        const formattedRut = formatSimpleRut(rut);
        const titularEncontrado = data.find((t: Titular) => t.rut === formattedRut);
        if (!titularEncontrado) {
          throw new Error('Titular no encontrado');
        }
        setTitular(titularEncontrado);
        sessionStorage.setItem('titularContext', JSON.stringify(titularEncontrado));
        return titularEncontrado;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar el titular';
      setError(errorMessage);
      setTitular(null);
      sessionStorage.removeItem('titularContext');
      return null;
    } finally {
      setLoading(false);
    }
  }, [formatSimpleRut]);

  const limpiarTitular = useCallback(() => {
    setTitular(null);
    setError(null);
    sessionStorage.removeItem('titularContext');
  }, []);

  useEffect(() => {
    const handleStorage = () => {
      const stored = sessionStorage.getItem('titularContext');
      if (stored) {
        try {
          setTitular(JSON.parse(stored));
        } catch {
          setTitular(null);
        }
      } else {
        setTitular(null);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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