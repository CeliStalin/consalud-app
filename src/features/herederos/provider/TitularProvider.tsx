import { useState } from "react";
import { Titular } from "../interfaces/Titular";
import { TitularProviderProps } from "../interfaces/TitularProviderProps";
import axios from "axios";
import { TitularContextType } from "../interfaces/TitularContext";
import { TitularContext } from "../contexts/TitularContext";
import { useRutChileno } from "../hooks/useRutChileno";

export const TitularProvider: React.FC<TitularProviderProps> = ({ children }) => {
    // Estado para el titular
    const [titular, setTitular] = useState<Titular | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const {formatSimpleRut} = useRutChileno();
  
    const buscarTitular = async (rut: string) => {
      setLoading(true);
      setError(null);
      try {
        // Obtener los datos del API mock
        const { data } = await axios.get('http://localhost:3001/Titular');
        const formattedRut = formatSimpleRut(rut);
        // Buscar el titular con el RUT proporcionado
        //todo solo consultar con el rut  sin el dv o agregar el -
        const titularEncontrado = data.find((t: Titular) => t.rut === formattedRut);
        console.log(titularEncontrado);
        if (!titularEncontrado) {
          throw new Error('Titular no encontrado');
        }
        
        // Establecer el titular encontrado en el estado
        setTitular(titularEncontrado);
        
      } catch (err) {
        // Manejo de errores
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error al buscar el titular');
        }
        
        setTitular(null);
      } finally {
        setLoading(false);
      }
    };
  
    // Función para limpiar el titular del estado
    const limpiarTitular = () => {
      setTitular(null);
      setError(null);
    };
  
    // Valor del contexto
    const value: TitularContextType = {
      titular,
      loading,
      error,
      buscarTitular,
      limpiarTitular
    };
  
    // Retornar el proveedor
    return (
      <TitularContext.Provider value={value}>
        {children}
      </TitularContext.Provider>
    );
  };
  
  export default TitularProvider;