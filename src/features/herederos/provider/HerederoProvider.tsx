import React, { useState, useCallback } from "react";
import { HerederoProviderProps } from "../interfaces/HerederoProviderProps";
import { Heredero } from "../interfaces/Heredero";
import axios from "axios";
import { HerederoContextType } from "../interfaces/HerederoContext";
import { HerederoContext } from "../contexts/HerederoContext";
import { useRutChileno } from "../hooks/useRutChileno";

export const HerederoProvider: React.FC<HerederoProviderProps> = ({ children }) => {
  const [heredero, setHeredero] = useState<Heredero | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { formatSimpleRut } = useRutChileno();
  
  // Función para buscar heredero por RUT
  const buscarHeredero = useCallback(async (rut: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener los datos del API mock
      const { data } = await axios.get('http://localhost:3001/Heredero');
      const formattedRut = formatSimpleRut(rut);
      
      // Buscar el heredero con el RUT proporcionado
      const herederoEncontrado = data.find((h: Heredero) => h.rut === formattedRut);
      
      if (!herederoEncontrado) {
        throw new Error('Heredero no encontrado');
      }
      
      setHeredero(herederoEncontrado);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar el heredero';
      setError(errorMessage);
      setHeredero(null);
      console.error('Error en buscarHeredero:', err);
    } finally {
      setLoading(false);
    }
  }, [formatSimpleRut]);

  const limpiarHeredero = useCallback(() => {
    setHeredero(null);
    setError(null);
  }, []);

  // Valor del contexto
  const value: HerederoContextType = {
    heredero,
    loading,
    error,
    buscarHeredero,
    limpiarHeredero
  };

  return (
    <HerederoContext.Provider value={value}>
      {children}
    </HerederoContext.Provider>
  );
};

export default HerederoProvider;