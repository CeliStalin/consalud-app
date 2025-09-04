import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MENSAJES_ERROR, validarEdadConMensaje } from "../../../utils/ageValidation";
import { extraerNumerosRut, formatearRut } from "../../../utils/rutValidation";
import { HerederoContext } from "../contexts/HerederoContext";
import { useRutChileno } from "../hooks/useRutChileno";
import { FormHerederoData } from '../interfaces/FormData';
import { Heredero } from "../interfaces/Heredero";
import { HerederoContextType } from "../interfaces/HerederoContext";
import { HerederoProviderProps } from "../interfaces/HerederoProviderProps";
import { fetchSolicitanteMejorContactibilidad } from '../services';

export const HerederoProvider: React.FC<HerederoProviderProps> = ({ children }) => {
  const [heredero, setHeredero] = useState<Heredero | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldsLocked, setFieldsLocked] = useState<boolean>(false);
  const [lastSearchedRut, setLastSearchedRut] = useState<string>('');
  const { formatSimpleRut } = useRutChileno();
  const navigate = useNavigate();

  // Función para obtener la clave del storage basada en RUT
  const getStorageKey = useCallback((rut: string) => {
    return `formHerederoData_${rut.replace(/[^0-9kK]/g, '')}`;
  }, []);

  // Función para convertir Heredero a FormHerederoData
  const herederoToFormHerederoData = useCallback((herederoData: Heredero): FormHerederoData => {
    return {
      RutPersona: parseInt(herederoData.rut.replace(/[^0-9kK]/g, '').slice(0, -1)),
      NombrePersona: herederoData.nombre || '',
      ApellidoPaterno: herederoData.apellidoPat || '',
      ApellidoMaterno: herederoData.apellidoMat || '',
      RutCompleto: herederoData.rut,
      RutDigito: herederoData.rut.slice(-1).toUpperCase(),
      CodigoSexo: herederoData.Genero || '',
      FechaNacimiento: herederoData.fechaNacimiento || new Date().toISOString(),
      IdParentesco: 0, // Valor por defecto - se establecerá cuando el usuario seleccione
      IdTipoSolicitante: 1, // Valor por defecto para heredero
      EstadoRegistro: 'V', // Activo por defecto
      NumTelef: parseInt(herederoData.contactabilidad?.telefono?.numero || '0') || 0,
      Mail: herederoData.contactabilidad?.correo?.[0]?.mail || '',
      IdRegion: herederoData.codRegion || 0,
      DesRegion: herederoData.descripcionRegion || '',
      IdCiudad: herederoData.codCiudad || 0,
      DesCiudad: herederoData.descripcionCiudad || '',
      IdComuna: herederoData.codComuna || 0,
      DesComuna: herederoData.descripcionComuna || '',
      Calle: herederoData.contactabilidad?.direccion?.calle || '',
      NumCalle: herederoData.contactabilidad?.direccion?.numero || 0,
      villa: herederoData.contactabilidad?.direccion?.villa || '',
      DepBlock: herederoData.contactabilidad?.direccion?.departamento ? parseInt(herederoData.contactabilidad.direccion.departamento) : 0,
      Usuario: ''
    };
  }, []);

  // Función para convertir FormHerederoData a Heredero
  const formHerederoDataToHeredero = useCallback((formData: FormHerederoData): Heredero => {
    return {
      id: formData.RutPersona,
      rut: formData.RutCompleto,
      fechaNacimiento: formData.FechaNacimiento,
      nombre: formData.NombrePersona,
      apellidoPat: formData.ApellidoPaterno,
      apellidoMat: formData.ApellidoMaterno,
      parentesco: formData.IdParentesco,
      Genero: formData.CodigoSexo,
      indFallecido: 'N',
      contactabilidad: {
        direccion: {
          calle: formData.Calle,
          numero: formData.NumCalle,
          comunaId: formData.IdComuna,
          comunaNombre: formData.DesComuna,
          regionId: formData.IdRegion,
          regionNombre: formData.DesRegion,
          ciudadId: formData.IdCiudad,
          ciudadNombre: formData.DesCiudad,
          villa: formData.villa,
          departamento: formData.DepBlock.toString()
        },
        telefono: {
          numero: formData.NumTelef.toString(),
          tipo: "CELULAR",
          codPais: "56",
          codCiudad: "2"
        },
        correo: [{
          mail: formData.Mail,
          validacion: 1
        }]
      },
      codCiudad: formData.IdCiudad,
      codComuna: formData.IdComuna,
      codRegion: formData.IdRegion,
      codigoPostal: 0,
      email: formData.Mail,
      descripcionCiudad: formData.DesCiudad,
      descripcionComuna: formData.DesComuna,
      descripcionRegion: formData.DesRegion,
      numeroBloque: 0,
      numeroDepartamento: formData.DepBlock,
      nombreVillaCondominio: formData.villa,
      nombreCalle: formData.Calle,
      numeroCalle: formData.NumCalle,
      numeroCelular: formData.NumTelef,
      numeroFijo: 0,
      tipoDireccion: ''
    };
  }, []);



  // Función para buscar heredero por RUT usando BFF
  const buscarHeredero = useCallback(async (rut: string) => {
    setLoading(true);
    setError(null);
    setFieldsLocked(false); // Resetear el estado de bloqueo al iniciar nueva búsqueda

    // Limpiar heredero anterior si el RUT cambió
    if (lastSearchedRut && lastSearchedRut !== rut) {
      setHeredero(null);
      // Limpiar sessionStorage del heredero anterior usando la nueva estructura
      const oldStorageKey = getStorageKey(lastSearchedRut);
      sessionStorage.removeItem(oldStorageKey);
    }

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
          setLastSearchedRut(rut);

          // NO guardar en session storage aquí - solo cuando el usuario modifique el formulario
          // Esto permite que la primera carga muestre "SELECCIONAR" en los campos

          // Bloquear campos cuando la API devuelve 200 exitosamente
          setFieldsLocked(true);

        } catch (err: any) {
          // Manejar específicamente el status 412
          if (err.message && err.message.includes('412')) {
            // Para 412, crear un heredero vacío con campos habilitados
            const mensaje = 'No se encontró información del heredero. Puede llenar los datos manualmente.';
            console.warn(mensaje);

            // Crear un heredero vacío con el RUT ingresado
            const herederoVacio: Heredero = {
              id: 0,
              rut: formatearRut(rut),
              fechaNacimiento: '',
              nombre: '',
              apellidoPat: '',
              apellidoMat: '',
              parentesco: 0,
              Genero: '',
              indFallecido: 'N',
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

            setHeredero(herederoVacio);
            setLastSearchedRut(rut);
            // NO bloquear campos para permitir edición manual
            setFieldsLocked(false);
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
        setLastSearchedRut(rut);

        // NO guardar en session storage aquí - solo cuando el usuario modifique el formulario
        // Esto permite que la primera carga muestre "SELECCIONAR" en los campos

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
  }, [formatSimpleRut, navigate, lastSearchedRut, getStorageKey, herederoToFormHerederoData]);

  const limpiarHeredero = useCallback(() => {
    console.log('HerederoProvider - limpiarHeredero llamado');
    setHeredero(null);
    setError(null);
    setLoading(false); // Asegurar que loading se resetee
    setFieldsLocked(false); // Limpiar también el estado de bloqueo
    setLastSearchedRut(''); // Limpiar el último RUT buscado

    // Limpiar session storage usando la nueva estructura
    if (lastSearchedRut) {
      const storageKey = getStorageKey(lastSearchedRut);
      sessionStorage.removeItem(storageKey);
    }
  }, [lastSearchedRut, getStorageKey]);

  // Cargar heredero desde sessionStorage al inicializar
  useEffect(() => {
    try {
      // Buscar en todas las claves de formHerederoData para encontrar datos del heredero
      const storageKeys = Object.keys(sessionStorage).filter(key =>
        key.startsWith('formHerederoData_')
      );

      if (storageKeys.length > 0) {
        // Tomar la primera clave encontrada (asumiendo que solo hay un heredero activo)
        const storageKey = storageKeys[0];
        const storedData = sessionStorage.getItem(storageKey);

        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);

            // Verificar si es la nueva estructura FormHerederoData
            if (parsed.RutPersona) {
              const herederoData = formHerederoDataToHeredero(parsed);
              setHeredero(herederoData);
              setLastSearchedRut(herederoData.rut);
              setFieldsLocked(true); // Los campos están bloqueados si hay datos guardados
            }
          } catch (error) {
            console.error('Error al parsear datos del heredero desde sessionStorage:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar heredero desde sessionStorage:', error);
    }
  }, [formHerederoDataToHeredero]);

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
