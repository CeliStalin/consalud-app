import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HerederoProviderProps } from "../interfaces/HerederoProviderProps";
import { Heredero } from "../interfaces/Heredero";
import axios from "axios";
import { HerederoContextType } from "../interfaces/HerederoContext";
import { HerederoContext } from "../contexts/HerederoContext";
import { useRutChileno } from "../hooks/useRutChileno";
import { fetchSolicitanteMejorContactibilidad } from "../services";

export const HerederoProvider: React.FC<HerederoProviderProps> = ({ children }) => {
  const [heredero, setHeredero] = useState<Heredero | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldsLocked, setFieldsLocked] = useState<boolean>(false);
  const { formatSimpleRut } = useRutChileno();
  const navigate = useNavigate();
  
  // Función para calcular la edad
  const calcularEdad = (fechaNacimiento: string): number => {
    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = fechaNac.getMonth();
    const diaActual = hoy.getDate();
    const diaNacimiento = fechaNac.getDate();
    
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento)) {
      edad--;
    }
    
    return edad;
  };

  // Función para validar edad mayor de 18 años
  const validarEdadMayorDe18 = (fechaNacimiento: string): boolean => {
    const edad = calcularEdad(fechaNacimiento);
    return edad >= 18;
  };
  
  // Función para crear un heredero vacío para el caso de status 412
  const createEmptyHeredero = (rut: string): Heredero => {
    return {
      id: 0,
      rut: rut,
      fechaNacimiento: '',
      nombre: '',
      apellidoPat: '',
      apellidoMat: '',
      parentesco: 0,
      Genero: '',
      contactabilidad: {
        direccion: {
          calle: '',
          numero: 0,
          comunaId: 0,
          comunaNombre: '',
          regionId: 0,
          regionNombre: '',
          ciudadId: 0,
          ciudadNombre: '',
          villa: '',
          departamento: ''
        },
        telefono: {
          numero: '',
          tipo: "CELULAR",
          codPais: "56",
          codCiudad: "2"
        },
        correo: [{
          mail: '',
          validacion: 1
        }]
      },
      // Campos adicionales del BFF vacíos
      codCiudad: 0,
      codComuna: 0,
      codRegion: 0,
      codigoPostal: 0,
      email: '',
      descripcionCiudad: '',
      descripcionComuna: '',
      descripcionRegion: '',
      numeroBloque: 0,
      numeroDepartamento: 0,
      nombreVillaCondominio: '',
      nombreCalle: '',
      numeroCalle: 0,
      numeroCelular: 0,
      numeroFijo: 0,
      tipoDireccion: ''
    };
  };
  
  // Función para buscar heredero por RUT usando BFF
  const buscarHeredero = useCallback(async (rut: string) => {
    setLoading(true);
    setError(null);
    setFieldsLocked(false); // Resetear el estado de bloqueo al iniciar nueva búsqueda
    
    try {
      const bffDns = import.meta.env.VITE_BFF_HEREDEROS_DNS;
      if (bffDns) {
        // Usar BFF
        const rutLimpio = rut.replace(/[^0-9kK]/g, '');
        // Extraer solo la parte numérica del RUT (sin DV) para el BFF
        const rutSinDV = rutLimpio.slice(0, -1); // Remueve el último carácter (DV)
        // Obtener userName desde localStorage o sessionStorage si existe
        const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName') || '';
        
        try {
          const response = await fetchSolicitanteMejorContactibilidad(Number(rutSinDV), userName);
          
          // Validar edad mayor de 18 años
          if (response.SolicitanteInMae.FecNacimiento && response.SolicitanteInMae.FecNacimiento.trim() !== '') {
            const esMayorDeEdad = validarEdadMayorDe18(response.SolicitanteInMae.FecNacimiento);
            if (!esMayorDeEdad) {
              throw new Error('La persona heredera debe tener al menos 18 años');
            }
          } else {
            // Si no hay fecha de nacimiento, también lanzar error
            throw new Error('La fecha de nacimiento es requerida para continuar');
          }
          
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
          
          // Bloquear campos cuando la API devuelve 200 exitosamente
          setFieldsLocked(true);
          
        } catch (err: any) {
          // Manejar específicamente el status 412
          if (err.message && err.message.includes('412')) {
            // Crear heredero vacío para status 412
            const emptyHeredero = createEmptyHeredero(rutLimpio);
            setHeredero(emptyHeredero);
            setFieldsLocked(false); // No bloquear campos para formulario vacío
            setError(null); // No mostrar error
            return; // IMPORTANTE: retornar aquí para evitar el catch general
          }
          
          // Para otros errores, propagar el error
          throw err;
        }
        
      } else {
        // Fallback a mock (para desarrollo)
        const { data } = await axios.get('http://localhost:3001/Heredero');
        const formattedRut = formatSimpleRut(rut);
        
        const herederoEncontrado = data.find((h: Heredero) => h.rut === formattedRut);
        
        if (!herederoEncontrado) {
          throw new Error('Heredero no encontrado');
        }
        
        setHeredero(herederoEncontrado);
        // Para desarrollo, también bloquear campos
        setFieldsLocked(true);
      }
      
    } catch (err: any) {
      // Solo manejar errores que NO sean 412
      if (!err.message || !err.message.includes('412')) {
        const errorMessage = err instanceof Error ? err.message : 'Error al buscar el heredero';
        setError(errorMessage);
        setHeredero(null);
        setFieldsLocked(false); // No bloquear campos si hay error
        console.error('Error en buscarHeredero:', err);
      }
      // Si es error 412, no hacer nada (ya se manejó arriba)
    } finally {
      setLoading(false);
    }
  }, [formatSimpleRut, navigate]);

  const limpiarHeredero = useCallback(() => {
    setHeredero(null);
    setError(null);
    setFieldsLocked(false); // Limpiar también el estado de bloqueo
  }, []);

  // Valor del contexto
  const value: HerederoContextType = {
    heredero,
    loading,
    error,
    buscarHeredero,
    limpiarHeredero,
    fieldsLocked
  };

  return (
    <HerederoContext.Provider value={value}>
      {children}
    </HerederoContext.Provider>
  );
};

export default HerederoProvider;