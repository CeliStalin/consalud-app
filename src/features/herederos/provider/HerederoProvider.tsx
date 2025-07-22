import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HerederoProviderProps } from "../interfaces/HerederoProviderProps";
import { Heredero } from "../interfaces/Heredero";
import axios from "axios";
import { HerederoContextType } from "../interfaces/HerederoContext";
import { HerederoContext } from "../contexts/HerederoContext";
import { useRutChileno } from "../hooks/useRutChileno";
import { fetchSolicitanteMejorContactibilidad } from "../services/bffHerederosService";

export const HerederoProvider: React.FC<HerederoProviderProps> = ({ children }) => {
  const [heredero, setHeredero] = useState<Heredero | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { formatSimpleRut } = useRutChileno();
  const navigate = useNavigate();
  
  // Función para buscar heredero por RUT usando BFF
  const buscarHeredero = useCallback(async (rut: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const bffDns = import.meta.env.VITE_BFF_HEREDEROS_DNS;
      if (bffDns) {
        // Usar BFF
        const rutLimpio = rut.replace(/[^0-9kK]/g, '');
        // Extraer solo la parte numérica del RUT (sin DV) para el BFF
        const rutSinDV = rutLimpio.slice(0, -1); // Remueve el último carácter (DV)
        // Obtener userName desde localStorage o sessionStorage si existe
        const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName') || '';
        const response = await fetchSolicitanteMejorContactibilidad(Number(rutSinDV), userName);
        
        // Mapear la respuesta del BFF al modelo Heredero
        const herederoData: Heredero = {
          id: response.SolicitanteInMae.IdPersona,
          rut: `${response.SolicitanteInMae.RutPersona}-${response.SolicitanteInMae.RutDigito}`,
          fechaNacimiento: response.SolicitanteInMae.FecNacimiento,
          nombre: response.SolicitanteInMae.NomPersona,
          apellidoPat: response.SolicitanteInMae.ApePaterno,
          apellidoMat: response.SolicitanteInMae.ApeMaterno,
          parentesco: 0, // Valor por defecto
          Genero: "", // Valor por defecto
          contactabilidad: {
            direccion: {
              calle: response.MejorContactibilidadSolicitante.nombreCalle,
              numero: response.MejorContactibilidadSolicitante.numeroCalle,
              comunaId: response.MejorContactibilidadSolicitante.CodComuna,
              comunaNombre: response.MejorContactibilidadSolicitante.descripcionComuna,
              regionId: response.MejorContactibilidadSolicitante.CodRegion,
              regionNombre: response.MejorContactibilidadSolicitante.descripcionRegion,
              ciudadId: response.MejorContactibilidadSolicitante.CodCiudad,
              ciudadNombre: response.MejorContactibilidadSolicitante.descripcionCiudad,
              villa: response.MejorContactibilidadSolicitante.nombreVillaCondominio,
              departamento: response.MejorContactibilidadSolicitante.numeroDepartamento.toString()
            },
            telefono: {
              numero: response.MejorContactibilidadSolicitante.numeroCelular.toString(),
              tipo: "CELULAR",
              codPais: "56",
              codCiudad: "2"
            },
            correo: [{
              mail: response.MejorContactibilidadSolicitante.Email,
              validacion: 1
            }]
          },
          // Campos adicionales del BFF
          codCiudad: response.MejorContactibilidadSolicitante.CodCiudad,
          codComuna: response.MejorContactibilidadSolicitante.CodComuna,
          codRegion: response.MejorContactibilidadSolicitante.CodRegion,
          codigoPostal: response.MejorContactibilidadSolicitante.CodigoPostal,
          email: response.MejorContactibilidadSolicitante.Email,
          descripcionCiudad: response.MejorContactibilidadSolicitante.descripcionCiudad,
          descripcionComuna: response.MejorContactibilidadSolicitante.descripcionComuna,
          descripcionRegion: response.MejorContactibilidadSolicitante.descripcionRegion,
          numeroBloque: response.MejorContactibilidadSolicitante.numeroBloque,
          numeroDepartamento: response.MejorContactibilidadSolicitante.numeroDepartamento,
          nombreVillaCondominio: response.MejorContactibilidadSolicitante.nombreVillaCondominio,
          nombreCalle: response.MejorContactibilidadSolicitante.nombreCalle,
          numeroCalle: response.MejorContactibilidadSolicitante.numeroCalle,
          numeroCelular: response.MejorContactibilidadSolicitante.numeroCelular,
          numeroFijo: response.MejorContactibilidadSolicitante.numeroFijo,
          tipoDireccion: response.MejorContactibilidadSolicitante.tipoDireccion
        };
        
        setHeredero(herederoData);
        
        // Comentado: Redirigir a IngresoHerederoFormPage cuando el status sea 200
        // Ahora el formulario se muestra en la misma página
        // navigate('/mnherederos/ingresoher/formingreso');
        
      } else {
        // Fallback a mock (para desarrollo)
        const { data } = await axios.get('http://localhost:3001/Heredero');
        const formattedRut = formatSimpleRut(rut);
        
        const herederoEncontrado = data.find((h: Heredero) => h.rut === formattedRut);
        
        if (!herederoEncontrado) {
          throw new Error('Heredero no encontrado');
        }
        
        setHeredero(herederoEncontrado);
        // Comentado: navegación automática
        // navigate('/mnherederos/ingresoher/formingreso');
      }
      
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Error al buscar el heredero';
      setError(errorMessage);
      setHeredero(null);
      console.error('Error en buscarHeredero:', err);
    } finally {
      setLoading(false);
    }
  }, [formatSimpleRut, navigate]);

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