import { useState } from "react";
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
     const {formatSimpleRut} = useRutChileno();
    // Función para buscar heredero por RUT
    const buscarHeredero = async (rut: string) => {
      setLoading(true);
      setError(null);
      
      try {
        // Obtener los datos del API mock
        const { data } = await axios.get('http://localhost:3001/Heredero');
        const formattedRut = formatSimpleRut(rut);
        console.log(formattedRut);
        console.log(data);
        // Buscar el heredero con el RUT proporcionado
        const herederoEncontrado = data.find((h: Heredero) => h.rut === formattedRut);
        
        if (!herederoEncontrado) {
          throw new Error('Heredero no encontrado');
        }
        
        // Establecer el heredero encontrado en el estado
        setHeredero(herederoEncontrado);
        
      } catch (err) {
        // Manejo de errores
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error al buscar el heredero');
        }
        
        setHeredero(null);
      } finally {
        setLoading(false);
      }
    };
  
    // Función para limpiar el heredero del estado
    const limpiarHeredero = () => {
      setHeredero(null);
      setError(null);
    };
  
    // Valor del contexto
    const value: HerederoContextType = {
      heredero,
      loading,
      error,
      buscarHeredero,
      limpiarHeredero
    };
  
    // Retornar el proveedor
    return (
      <HerederoContext.Provider value={value}>
        {children}
      </HerederoContext.Provider>
    );
  };
  
  export default HerederoProvider;