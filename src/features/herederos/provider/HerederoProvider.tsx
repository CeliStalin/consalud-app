import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HerederoProviderProps } from "../interfaces/HerederoProviderProps";
import { Heredero } from "../interfaces/Heredero";
import axios from "axios";
import { HerederoContextType } from "../interfaces/HerederoContext";
import { HerederoContext } from "../contexts/HerederoContext";
import { useRutChileno } from "../hooks/useRutChileno";
import { fetchSolicitanteMejorContactibilidad } from "../services";
import { validarEdadConMensaje, MENSAJES_ERROR } from "../../../utils/ageValidation";
import { formatearRut, extraerNumerosRut } from "../../../utils/rutValidation";

export const HerederoProvider: React.FC<HerederoProviderProps> = ({ children }) => {
  const [heredero, setHeredero] = useState<Heredero | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldsLocked, setFieldsLocked] = useState<boolean>(false);
  const { formatSimpleRut } = useRutChileno();
  const navigate = useNavigate();
  
  // Función para crear un heredero vacío para el caso de status 412
  const createEmptyHeredero = (rut: string): Heredero => {
    return {
      id: 0,
      rut: formatearRut(rut),
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
        const rutSinDV = extraerNumerosRut(rut);
        // Obtener userName desde localStorage o sessionStorage si existe
        const userName = localStorage.getItem('userName') || sessionStorage.getItem('userName') || '';
        
        try {
          const response = await fetchSolicitanteMejorContactibilidad(Number(rutSinDV), userName);
          
          // Validar si la persona está fallecida
          if (response.SolicitanteInMae.IndFallecido === 'S') {
            throw new Error('El RUT ingresado corresponde a una persona fallecida');
          }
          
          // Validar edad mayor de 18 años
          if (response.SolicitanteInMae.FecNacimiento && response.SolicitanteInMae.FecNacimiento.trim() !== '') {
            const validacion = validarEdadConMensaje(response.SolicitanteInMae.FecNacimiento, 'La persona heredera debe tener al menos 18 años');
            if (!validacion.esValido) {
              throw new Error(validacion.mensaje || 'La persona heredera debe tener al menos 18 años');
            }
          } else {
            // Si no hay fecha de nacimiento, también lanzar error
            throw new Error(MENSAJES_ERROR.FECHA_REQUERIDA);
          }
          
          // Mapear la respuesta del BFF al modelo Heredero
          const herederoData: Heredero = {
            id: response.SolicitanteInMae.IdPersona,
            rut: formatearRut(`${response.SolicitanteInMae.RutPersona}${response.SolicitanteInMae.RutDigito}`),
            fechaNacimiento: response.SolicitanteInMae.FecNacimiento,
            nombre: response.SolicitanteInMae.NomPersona,
            apellidoPat: response.SolicitanteInMae.ApePaterno,
            apellidoMat: response.SolicitanteInMae.ApeMaterno,
            parentesco: 0, // Valor por defecto
            Genero: response.SolicitanteInMae.CodSexo || '',
            indFallecido: response.SolicitanteInMae.IndFallecido,
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
            const emptyHeredero = createEmptyHeredero(rut);
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
    console.log('HerederoProvider - limpiarHeredero llamado');
    setHeredero(null);
    setError(null);
    setLoading(false); // Asegurar que loading se resetee
    setFieldsLocked(false); // Limpiar también el estado de bloqueo
    // Limpiar también el sessionStorage
    sessionStorage.removeItem('herederoData');
  }, []);



  // Cargar heredero desde sessionStorage al inicializar
  useEffect(() => {
    try {
      const storedHeredero = sessionStorage.getItem('herederoData');
      if (storedHeredero) {
        const herederoData: Heredero = JSON.parse(storedHeredero);
        setHeredero(herederoData);
        setFieldsLocked(true); // Los campos están bloqueados si hay datos guardados
      }
    } catch (error) {
      console.error('Error al cargar heredero desde sessionStorage:', error);
    }
  }, []);

  // Guardar heredero en sessionStorage cuando cambie
  useEffect(() => {
    if (heredero) {
      try {
        sessionStorage.setItem('herederoData', JSON.stringify(heredero));
      } catch (error) {
        console.error('Error al guardar heredero en sessionStorage:', error);
      }
    } else {
      // Si no hay heredero, limpiar sessionStorage
      sessionStorage.removeItem('herederoData');
    }
  }, [heredero]);

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