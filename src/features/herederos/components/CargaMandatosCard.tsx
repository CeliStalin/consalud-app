import * as ConsaludCore from '@consalud/core';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOCUMENTOS_MESSAGES } from '../constants';
import { useDocumentos } from '../hooks/useDocumentos';
import { useMandatosTransaction } from '../hooks/useMandatosTransaction';
import { createSolicitante, createSolicitud, CuentaBancariaResponse, fetchTitularByRut, getCuentaBancaria, obtenerDocumentosAlmacenados } from '../services/herederosService';
import { mandatosTransactionService } from '../services/mandatosTransactionService';
import { MandatoResult, mockMandatoService } from '../services/mockMandatoService';
import { useStepper } from './Stepper';

/**
 * Función helper para formatear fecha al formato esperado por la API (YYYY-MM-DD)
 */
const formatDateForAPI = (date: Date | string | null | undefined): string => {
  // Si la fecha es null o undefined, usar fecha actual
  if (!date) {
    date = new Date();
  }

  let dateObj: Date;

  if (typeof date === 'string') {
    // Si ya está en formato YYYY-MM-DD, devolverlo tal como está
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Si es un string de fecha en formato dd-MM-yyyy u otro formato, convertirlo a Date
    dateObj = new Date(date);

    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      console.warn('Fecha inválida recibida:', date, 'usando fecha actual');
      dateObj = new Date();
    }
  } else {
    dateObj = date;
  }

  // Retornar en formato YYYY-MM-DD como espera la API
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Función helper para formatear nombres con primera letra en mayúscula y resto en minúscula
 */
const formatName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

/**
 * Función para obtener datos del heredero desde sessionStorage
 */
const getHerederoDataFromSessionStorage = () => {
  try {
    const allKeys = Object.keys(sessionStorage);
    const formKeys = allKeys.filter(key => key.includes('formHeredero') || key.includes('heredero'));

    for (const key of formKeys) {
      const data = sessionStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed && (parsed.NombrePersona || parsed.ApellidoPaterno || parsed.ApellidoMaterno)) {
            return {
              NombrePersona: parsed.NombrePersona || '',
              ApellidoPaterno: parsed.ApellidoPaterno || '',
              ApellidoMaterno: parsed.ApellidoMaterno || '',
              RutCompleto: parsed.RutCompleto || ''
            };
          }
        } catch (parseError) {
          continue;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error al obtener datos del heredero desde sessionStorage:', error);
    return null;
  }
};

interface CargaMandatosCardProps {
  onSave: () => void;
}

const CargaMandatosCard: React.FC<CargaMandatosCardProps> = ({ onSave }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mandatoInfo, setMandatoInfo] = useState<MandatoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [manualUrl, setManualUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [esMandatoCorrecto, setEsMandatoCorrecto] = useState<string | null>(null);
  const [herederoData, setHerederoData] = useState<{
    NombrePersona: string;
    ApellidoPaterno: string;
    ApellidoMaterno: string;
    RutCompleto: string;
  } | null>(null);
  const [cuentaBancariaData, setCuentaBancariaData] = useState<CuentaBancariaResponse | null>(null);
  const [loadingCuentaBancaria, setLoadingCuentaBancaria] = useState(false);
  const [shouldResetSelection, setShouldResetSelection] = useState(false);
  const [noTieneCuentaBancaria, setNoTieneCuentaBancaria] = useState(false);
  const [bloquearRadioButtons, setBloquearRadioButtons] = useState(false);
  const [botonActualizarVisible, setBotonActualizarVisible] = useState(false);
  const { setStep } = useStepper();
  const { enviarDocumentos, loading: documentosLoading, error: documentosError } = useDocumentos();

  // Hook para manejar transacciones de mandatos con pestaña externa
  const {
    loading: iframeLoading,
    // Funcionalidad de pestaña externa
    isExternalTabOpen,
    isOpeningTab,
    openExternalTab,
    externalAppStatus,
    closedAt,
    // Funcionalidad de bloqueo de botones
    isButtonsLocked,
    lockReason,
    lockButtons,
    unlockButtons,
  } = useMandatosTransaction();



  // Función para manejar el clic en "Actualizar Mandato"
  const handleActualizarMandato = async () => {
    try {
      // Verificar si ya hay una pestaña externa abierta o se está abriendo una
      if (isExternalTabOpen || isOpeningTab) {
        throw new Error('Ya hay una pestaña externa abierta o se está abriendo una nueva. Espere a que se complete la operación.');
      }

      // Obtener RUT del session storage
      const allKeys = Object.keys(sessionStorage);
      const formKeys = allKeys.filter(key => key.includes('formHeredero'));

      let rutHeredero = '';
      for (const key of formKeys) {
        const data = sessionStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            if (parsed && parsed.RutCompleto) {
              rutHeredero = parsed.RutCompleto;
              break;
            }
          } catch (parseError) {
            continue;
          }
        }
      }

      if (!rutHeredero) {
        throw new Error('No se encontró RUT del heredero en el session storage');
      }



      // Bloquear botones ANTES de intentar abrir la pestaña
      lockButtons('Abriendo pestaña externa...');

      try {
        await openExternalTab(rutHeredero);

      } catch (openError) {
        console.error('❌ Error al abrir pestaña externa:', openError);
        // Desbloquear botones si falla la apertura
        unlockButtons();
        throw openError; // Re-lanzar el error para que se capture en el catch principal
      }
    } catch (err: any) {
      console.error('❌ Error al abrir pestaña externa:', err);

      // Asegurar que los botones estén desbloqueados
      unlockButtons();

      // Mostrar mensaje de error más específico
      if (err.message?.includes('popups estén permitidos')) {
        setError('No se pudo abrir la pestaña externa. Por favor, permita popups para este sitio y vuelva a intentar. Alternativamente, puede copiar la URL y abrirla manualmente en una nueva pestaña.');

        // Intentar obtener la URL que se intentó abrir
        try {
          const rutHeredero = sessionStorage.getItem('RutCompleto');
          if (rutHeredero) {
            const transactionData = await mandatosTransactionService.iniciarTransaccionMandatos(rutHeredero);
            if (transactionData?.encryptedUrl) {
              setManualUrl(transactionData.encryptedUrl);
              setShowManualUrl(true);
            }
          }
        } catch (urlError) {
          console.warn('No se pudo obtener la URL para apertura manual:', urlError);
        }
      } else {
        setError(err.message || 'Error al abrir el formulario de actualización');
      }
    }
  };

  // Obtener datos del mandato cuando se monta el componente
  useEffect(() => {
    // Avanzar al paso 4 del stepper cuando se abre el componente
    setStep(4);

    // Cargar datos del heredero desde sessionStorage
    const herederoDataFromStorage = getHerederoDataFromSessionStorage();
    if (herederoDataFromStorage) {
      setHerederoData(herederoDataFromStorage);


      // Cargar datos de cuenta bancaria si tenemos RUT
      if (herederoDataFromStorage.RutCompleto) {
        loadCuentaBancaria(herederoDataFromStorage.RutCompleto);
      }
    } else {
      console.warn('No se encontraron datos del heredero en sessionStorage');
    }

    const fetchMandatoData = async () => {
      setLoading(true);
      try {
        // Buscar en localStorage
        const rutCliente = localStorage.getItem('currentRutCliente') || '17175966';
        const mandatoId = localStorage.getItem('currentMandatoId') || '';



        // Llamar al servicio
        const resultado = await mockMandatoService.getMandatoInfo(rutCliente, mandatoId);
        setMandatoInfo(resultado);
      } catch (err) {
        console.error('Error al cargar detalles del mandato:', err);
        setError('No se pudo cargar la información del mandato');
      } finally {
        setLoading(false);
      }
    };

    fetchMandatoData();
  }, [setStep]);

  // Función para cargar datos de cuenta bancaria
  const loadCuentaBancaria = async (rutCompleto: string) => {
    setLoadingCuentaBancaria(true);
    setNoTieneCuentaBancaria(false);
    setBloquearRadioButtons(false);
    try {

      const cuentaData = await getCuentaBancaria(rutCompleto);
      setCuentaBancariaData(cuentaData);
      setNoTieneCuentaBancaria(false);
      setBloquearRadioButtons(false);

    } catch (error: any) {
      console.error('❌ Error al cargar datos de cuenta bancaria:', error);

      // Si es error 404, significa que no tiene cuenta bancaria registrada
      if (error?.status === 404 || error?.message?.includes('404')) {

        setNoTieneCuentaBancaria(true);
        setCuentaBancariaData(null);
        setBloquearRadioButtons(true);
      } else {
        // Para otros errores, mantener el comportamiento anterior
        setNoTieneCuentaBancaria(false);
        setBloquearRadioButtons(false);
      }
    } finally {
      setLoadingCuentaBancaria(false);
    }
  };

  // Función para refrescar datos de cuenta bancaria
  const refreshCuentaBancaria = async () => {
    if (herederoData?.RutCompleto) {


      // Limpiar sessionStorage de mandatos_transaction
      const allKeys = Object.keys(sessionStorage);
      const mandatosKeys = allKeys.filter(key => key.includes('mandatos_transaction'));
      mandatosKeys.forEach(key => {
        sessionStorage.removeItem(key);

      });

      // Resetear selección del radio button
      setEsMandatoCorrecto(null);
      setShouldResetSelection(true);

      // Cargar nuevos datos
      await loadCuentaBancaria(herederoData.RutCompleto);
    }
  };

  // Detectar cuando se cierra la ventana externa de mandatos y refrescar datos
  useEffect(() => {
    if (externalAppStatus === 'closed' && closedAt) {

      refreshCuentaBancaria();
    }
  }, [externalAppStatus, closedAt, herederoData?.RutCompleto]);

  // Resetear el flag de reset cuando termine la carga
  useEffect(() => {
    if (shouldResetSelection && !loadingCuentaBancaria) {

      setShouldResetSelection(false);
    }
  }, [shouldResetSelection, loadingCuentaBancaria]);

  // Controlar la visibilidad del botón "Actualizar Mandatos" con animación
  useEffect(() => {
    if (mandatoInfo && (esMandatoCorrecto === 'no' || noTieneCuentaBancaria)) {
      setBotonActualizarVisible(true);
    } else if (esMandatoCorrecto === 'si') {
      // Cuando se marca "Sí", iniciar animación de salida
      const timer = setTimeout(() => {
        setBotonActualizarVisible(false);
      }, 300); // Tiempo para la animación de salida
      return () => clearTimeout(timer);
    } else {
      setBotonActualizarVisible(false);
    }
  }, [mandatoInfo, esMandatoCorrecto, noTieneCuentaBancaria]);

  // Función para manejar el guardado del solicitante
  const handleSave = async () => {
    if (!mandatoInfo) return;

    setSaving(true);
    setError(null);

    try {
      // Buscar automáticamente en todas las claves del sessionStorage que contengan datos de herederos
      const allKeys = Object.keys(sessionStorage);
      const formKeys = allKeys.filter(key => key.includes('formHeredero') || key.includes('heredero'));




      let storedData: string | null = null;

      // Buscar en todas las claves de herederos hasta encontrar una con datos válidos
      for (const key of formKeys) {
        const data = sessionStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            // Verificar que tenga la estructura correcta (al menos RutPersona)
            if (parsed && parsed.RutPersona) {
              storedData = data;

              break;
            }
          } catch (parseError) {

            continue;
          }
        }
      }

      if (!storedData) {
        throw new Error(`No se encontraron datos válidos del formulario en el sessionStorage. Claves revisadas: ${formKeys.join(', ')}`);
      }

      const formData = JSON.parse(storedData);


      // Verificar datos del titular en sessionStorage
      const titularContextData = sessionStorage.getItem('titularContext');
      if (titularContextData) {


      } else {
        console.warn('No se encontraron datos del titular en sessionStorage');
      }

      // Extraer el RUT del formulario encontrado
      const rutFormulario = formData.RutPersona || formData.RutCompleto || '0';


      // Preparar datos para la API
      const solicitanteData = {
        RutPersona: formData.RutPersona || parseInt(rutFormulario.toString()),
        NombrePersona: formData.NombrePersona || '',
        ApellidoPaterno: formData.ApellidoPaterno || '',
        ApellidoMaterno: formData.ApellidoMaterno || '',
        RutCompleto: formData.RutCompleto || rutFormulario.toString(),
        RutDigito: formData.RutDigito || '',
        CodigoSexo: formData.CodigoSexo || '',
        FechaNacimiento: formData.FechaNacimiento ? formatDateForAPI(formData.FechaNacimiento) : formatDateForAPI(new Date()),
        IdParentesco: formData.IdParentesco || 0,
        IdTipoSolicitante: formData.IdTipoSolicitante || 0,
        EstadoRegistro: formData.EstadoRegistro || 'A',
        NumTelef: formData.NumTelef || 0,
        Mail: formData.Mail || '',
        IdRegion: formData.IdRegion || 0,
        DesRegion: formData.DesRegion || '',
        IdCiudad: formData.IdCiudad || 0,
        DesCiudad: formData.DesCiudad || '',
        IdComuna: formData.IdComuna || 0,
        DesComuna: formData.DesComuna || '',
        Calle: formData.Calle || '',
        NumCalle: formData.NumCalle || 0,
        villa: formData.villa || '',
        DepBlock: formData.DepBlock || 0,
        Usuario: formData.Usuario || 'SISTEMA'
      };



      // Llamar a la API para crear el solicitante
      const resultSolicitante = await createSolicitante(solicitanteData, 'SISTEMA');



      if (resultSolicitante.success && resultSolicitante.status === 201) {


        // Ahora crear la solicitud usando los datos del retorno del primer endpoint
        try {
          // Función helper para crear fecha ISO en zona horaria local
          const getLocalISOString = () => {
            const now = new Date();
            const offset = now.getTimezoneOffset();
            const localDate = new Date(now.getTime() - (offset * 60000));
            return localDate.toISOString();
          };

          // Obtener la fecha actual en formato local (sin conversión UTC)
          const fechaISO = getLocalISOString();





          // Extraer el ID del solicitante de la respuesta del primer endpoint
          // El campo correcto es 'newIdSolicitante' según la especificación
          const newIdSolicitante = resultSolicitante.data?.newIdSolicitante ||
                                  resultSolicitante.newIdSolicitante ||
                                  resultSolicitante.data?.idSolicitante ||
                                  resultSolicitante.data?.IdSolicitante ||
                                  resultSolicitante.data?.id ||
                                  resultSolicitante.idSolicitante ||
                                  resultSolicitante.IdSolicitante ||
                                  resultSolicitante.id ||
                                  1001;

                    // Obtener el IdPersona del titular desde sessionStorage
          // Este ID se guarda cuando se consulta /api/Titular/ByRut en el paso de ingreso del titular
          let idMae = 0;
          let rutTitular: string | number = 0; // Allow both string and number types

          try {
            // Primero intentar obtener desde sessionStorage
            const titularContextData = sessionStorage.getItem('titularContext');
            if (titularContextData) {
              const titularData = JSON.parse(titularContextData);
              idMae = titularData.id; // IdPersona del titular


              // Obtener el RUT del titular desde sessionStorage
              if (titularData.rut) {
                rutTitular = titularData.rut;

              } else if (titularData.rutPersona) {
                rutTitular = titularData.rutPersona;

              }
            }

            // Si no se encontró en sessionStorage, usar el RUT del mandato
            if (!rutTitular || rutTitular === 0) {
              rutTitular = mandatoInfo.rutCliente;


              // Si tampoco tenemos idMae, consultar la API
              if (!idMae || idMae === 0) {
                const titularInfo = await fetchTitularByRut(parseInt(rutTitular), 'SISTEMA');
                idMae = titularInfo.id;

              }
            }




          } catch (errorTitular: any) {
            console.error('Error al obtener datos del titular:', errorTitular);
            // Fallback: usar valores por defecto
            if (!idMae || idMae === 0) {
              idMae = formData.IdPersona || 12345;
              console.warn('⚠️ Usando IdPersona por defecto:', idMae);
            }
            if (!rutTitular || rutTitular === 0) {
              rutTitular = mandatoInfo.rutCliente;
              console.warn('⚠️ Usando RUT del mandato por defecto:', rutTitular);
            }
          }



          // Preparar datos para la solicitud
          const solicitudData = {
            idSolicitante: newIdSolicitante, // newIdSolicitante del output de /api/Solicitante
            idMae: idMae, // IdPersona del titular obtenido de /api/Titular/ByRut
            fechaIngreso: fechaISO,
            fechaDeterminacion: fechaISO,
            estadoSolicitud: 1,
            tipoSolicitud: 1,
            observaciones: "Creacion Solicitud Heredero",
            estadoRegistro: "V",
            usuarioCreacion: "SISTEMA", // Usar el usuario logueado
            fechaEstadoRegistro: fechaISO
          };



          // Llamar a la API para crear la solicitud
          const resultSolicitud = await createSolicitud(solicitudData, 'SISTEMA');



          if (resultSolicitud.success && resultSolicitud.status === 201) {


                         // Obtener el ID de la solicitud creada



                          const newIdSolicitud = resultSolicitud.data?.newId ||
                                   resultSolicitud.data?.newIdSolicitud ||
                                   resultSolicitud.data?.idSolicitud ||
                                   resultSolicitud.data?.newIdSolicitante ||
                                   resultSolicitud.data?.idSolicitante ||
                                   resultSolicitud.data?.IdSolicitud ||
                                   resultSolicitud.data?.IdSolicitante ||
                                   resultSolicitud.newId ||
                                   resultSolicitud.newIdSolicitud ||
                                   resultSolicitud.idSolicitud ||
                                   resultSolicitud.newIdSolicitante ||
                                                                       resultSolicitud.idSolicitante;



             if (newIdSolicitud) {


                                            try {
                 // Obtener el RUT del titular fallecido (sin DV, solo números)
                 let rutTitularFallecido: number;

                 if (typeof rutTitular === 'string') {
                   // Extraer solo los números del RUT (sin puntos, guiones ni DV)
                   const rutNumeros = rutTitular.replace(/[^0-9]/g, '');
                   rutTitularFallecido = parseInt(rutNumeros);



                 } else {
                   rutTitularFallecido = rutTitular;

                 }

                 if (!rutTitularFallecido || rutTitularFallecido === 0) {
                   console.error('❌ ERROR: rutTitularFallecido es 0 o inválido. No se pueden buscar documentos.');
                   throw new Error('RUT del titular fallecido es 0 o inválido');
                 }

                                                  // Obtener documentos almacenados del session storage






                 const documentos = obtenerDocumentosAlmacenados(rutTitularFallecido);


                 // Si no hay documentos, buscar manualmente en todas las claves que contengan "documentos"
                 if (documentos.length === 0) {
                   const allKeys = Object.keys(sessionStorage);
                   const documentoKeys = allKeys.filter(key => key.includes('documentos'));


                   // Buscar documentos en cualquier clave disponible
                   for (const key of documentoKeys) {
                     const data = sessionStorage.getItem(key);


                     if (data) {
                       try {
                         const documentosAlternativos = JSON.parse(data);
                         if (documentosAlternativos && documentosAlternativos.length > 0) {



                           // Usar estos documentos como fallback
                           documentos.push(...documentosAlternativos);
                           break; // Usar el primer conjunto de documentos encontrados
                         }
                       } catch (parseError) {

                       }
                     }
                   }


                 }

                if (documentos.length > 0) {


                    // Enviar documentos a la API usando el hook

                    const resultDocumentos = await enviarDocumentos(
                      newIdSolicitud,
                      'SISTEMA',
                      rutTitularFallecido,
                      documentos
                    );

                    if (resultDocumentos.success) {

                      setSaveSuccess(true);
                      // Llamar a la función de guardado exitoso
                      onSave();
                    } else {
                      console.warn(DOCUMENTOS_MESSAGES.ERROR.DOCUMENTS_SEND_FAILED, resultDocumentos.message);

                      // Verificar si el error indica que se agotaron los intentos
                      if (resultDocumentos.message && (
                        resultDocumentos.message.includes('Falló definitivamente después de') ||
                        resultDocumentos.message.includes('Falló definitivamente') ||
                        resultDocumentos.message.includes('definitivamente después de')
                      )) {

                        navigate('/mnherederos/ingresoher/error');
                        return;
                      }

                      // Verificar códigos de error específicos en el mensaje
                      if (resultDocumentos.message && (
                        resultDocumentos.message.includes('500') ||
                        resultDocumentos.message.includes('503') ||
                        resultDocumentos.message.includes('412') ||
                        resultDocumentos.message.includes('400')
                      )) {

                        navigate('/mnherederos/ingresoher/error');
                        return;
                      }

                      // Si no es un error crítico, continuar con éxito
                      setSaveSuccess(true);
                      onSave();
                    }
                  } else {

                    setSaveSuccess(true);
                    // Llamar a la función de guardado exitoso
                    onSave();
                  }
              } catch (errorDocumentos: any) {
                console.error('Error al enviar documentos:', errorDocumentos);




                // Verificar si es un error que debe ir a página de error
                if (errorDocumentos.message && (
                  errorDocumentos.message.includes('Falló definitivamente después de') ||
                  errorDocumentos.message.includes('Falló definitivamente') ||
                  errorDocumentos.message.includes('definitivamente después de')
                )) {


                  navigate('/mnherederos/ingresoher/error');
                  return;
                }

                // Verificar códigos de error específicos
                if (errorDocumentos.status && [500, 503, 412, 400].includes(errorDocumentos.status)) {


                  navigate('/mnherederos/ingresoher/error');
                  return;
                }

                // Verificar si el mensaje contiene "Failed to fetch" que es el error que vemos en la consola
                if (errorDocumentos.message && errorDocumentos.message.includes('Failed to fetch')) {

                  navigate('/mnherederos/ingresoher/error');
                  return;
                }


                // Aunque fallen los documentos, la solicitud se creó correctamente
                setSaveSuccess(true);
                // Llamar a la función de guardado exitoso
                onSave();
              }
            } else {
              console.warn('No se pudo obtener el ID de la solicitud de la respuesta');
              setSaveSuccess(true);
              // Llamar a la función de guardado exitoso
              onSave();
            }
          } else {
            throw new Error(`Error al crear la solicitud. Status: ${resultSolicitud.status}, Respuesta: ${JSON.stringify(resultSolicitud)}`);
          }
        } catch (errorSolicitud: any) {
          console.error('Error al crear solicitud:', errorSolicitud);

          // Verificar si es un error que debe ir a página de error
          if (errorSolicitud.message && (
            errorSolicitud.message.includes('Falló definitivamente después de') ||
            errorSolicitud.message.includes('Falló definitivamente') ||
            errorSolicitud.message.includes('definitivamente después de')
          )) {

            navigate('/mnherederos/ingresoher/error');
            return;
          }

          // Verificar códigos de error específicos
          if (errorSolicitud.status && [500, 503, 412, 400].includes(errorSolicitud.status)) {

            navigate('/mnherederos/ingresoher/error');
            return;
          }

          // Aunque falle la solicitud, el solicitante se creó correctamente
          setError(`Solicitante creado pero error al crear solicitud: ${errorSolicitud.message}`);
        }
      } else {
        throw new Error(`Error al guardar el solicitante. Status: ${resultSolicitante.status}, Respuesta: ${JSON.stringify(resultSolicitante)}`);
      }
    } catch (err: any) {
      console.error('Error al guardar solicitante:', err);

      // Log del error para debugging
      console.error('Error completo:', err);

      // Verificar si el error indica que se agotaron los intentos
      if (err.message && (
        err.message.includes('Falló definitivamente después de') ||
        err.message.includes('Falló definitivamente') ||
        err.message.includes('definitivamente después de')
      )) {


        navigate('/mnherederos/ingresoher/error');
        return;
      }

      // También verificar códigos de error específicos que deben ir a página de error
      if (err.status && [500, 503, 412, 400].includes(err.status)) {


        navigate('/mnherederos/ingresoher/error');
        return;
      }

      setError(err.message || 'Error al guardar el solicitante');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="carga-mandatos-card" style={{
        padding: '2rem 3rem',
        backgroundColor: '#FFFFFF',
        borderRadius: '1.25rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'fit-content',
        maxHeight: 'fit-content',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        {/* Mensaje informativo */}
        <div style={{
          backgroundColor: 'rgb(255 249 229)',
          border: '1px solid rgb(255 250 233)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <div style={{
            width: '1.5rem',
            height: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '0.125rem'
          }}>
            <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.999 8C11.861 8 11.749 8.112 11.75 8.25C11.75 8.388 11.862 8.5 12 8.5C12.138 8.5 12.25 8.388 12.25 8.25C12.25 8.112 12.138 8 11.999 8" stroke="#F5A200" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M12 21V21C7.029 21 3 16.971 3 12V12C3 7.029 7.029 3 12 3V3C16.971 3 21 7.029 21 12V12C21 16.971 16.971 21 12 21Z" stroke="#F5A200" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12V17" stroke="#F5A200" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <ConsaludCore.Typography
            variant="body2"
            style={{
              color: '#856404',
              fontSize: '0.875rem',
              lineHeight: '1.4',
              margin: 0,
              flex: 1
            }}
          >
            Si la persona <span style={{ color: '#BB4E01', fontWeight: 'bold' }}>no tiene una cuenta bancaria registrada o debe editar sus datos</span>. Ingresa en "Actualizar Mandatos", para ingresar Cuenta bancaria o actualizar los datos de su cuenta bancaria.
          </ConsaludCore.Typography>
        </div>

        {/* Title */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2rem',
          flexShrink: 0
        }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="1.25rem" height="1.25rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.5023 6.95098L16.1365 3.79657C15.4993 2.94704 14.3095 2.74323 13.426 3.33227L7.92773 6.99776" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path fillRule="evenodd" clipRule="evenodd" d="M18.501 11.498H21.0021C21.5546 11.498 22.0025 11.9459 22.0025 12.4985V15.4997C22.0025 16.0522 21.5546 16.5001 21.0021 16.5001H18.501C17.1198 16.5001 16 15.3804 16 13.9991V13.9991C16 12.6178 17.1198 11.498 18.501 11.498V11.498Z" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21.0036 11.498V9.49714C21.0036 8.11585 19.8838 6.99609 18.5026 6.99609H5.49714C4.11585 6.99609 2.99609 8.11585 2.99609 9.49714V18.5009C2.99609 19.8822 4.11585 21.0019 5.49714 21.0019H18.5026C19.8838 21.0019 21.0036 19.8822 21.0036 18.5009V16.5001" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <ConsaludCore.Typography
            variant="h6"
            component="h2"
            weight="bold"
            style={{
              fontSize: '1.25rem',
              color: '#505050',
              margin: 0,
              lineHeight: '1.4'
            }}
          >
            Cuenta bancaria
          </ConsaludCore.Typography>
        </div>

        {/* Descripción */}
        <div style={{ marginBottom: '1.5rem' }}>
          <ConsaludCore.Typography
            variant="body2"
            style={{
              color: '#666666',
              fontSize: '0.875rem',
              lineHeight: '1.4',
              margin: 0
            }}
          >
            La devolución se realizará en la cuenta registrada a nombre de la persona heredera.
          </ConsaludCore.Typography>
        </div>


        {/* Mensaje sutil cuando la ventana de mandatos está abierta */}
        {(isExternalTabOpen || isOpeningTab) && (
          <div
            className="notification is-info mb-4"
            style={{
              animation: 'fadeInDown 0.5s ease-out',
              border: '1px solid rgb(255 250 233)',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              backgroundColor: 'rgb(255 249 229)'
            }}
          >
            <div className="is-flex is-align-items-center">
              <span className="icon" style={{ color: '#F5A200' }}>
                <i className="fas fa-external-link-alt"></i>
              </span>
              <span className="ml-2" style={{ color: '#856404', fontWeight: '500' }}>
                Complete el proceso ingresa/actualiza Mandatos, para desbloquear los botones y continuar con el flujo.
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="has-text-centered p-6">
            <div className="loader-container">
              <div className="loader"></div>
            </div>
            <p className="mt-4">Cargando información...</p>
          </div>
        ) : saveSuccess ? (
          <div className="has-text-centered p-6">
            <div className="notification is-success is-light">
              <div className="has-text-centered">
                <i className="fas fa-check-circle" style={{ fontSize: '3rem', color: '#48c774' }}></i>
                <h3 className="title is-4 mt-3" style={{ color: '#48c774' }}>¡CREADO CON ÉXITO!</h3>
                <p className="mt-2">El solicitante y la solicitud han sido creados correctamente.</p>
                <p className="mt-2">
                  {documentosLoading ? DOCUMENTOS_MESSAGES.INFO.SENDING_DOCUMENTS :
                   documentosError ? DOCUMENTOS_MESSAGES.ERROR.DOCUMENTS_SEND_FAILED :
                   DOCUMENTOS_MESSAGES.SUCCESS.DOCUMENTS_SENT}
                </p>
                <p className="is-size-7 mt-2">{DOCUMENTOS_MESSAGES.INFO.CLOSING_MODAL}</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="notification is-danger">
            <p>{error}</p>
          </div>
        ) : mandatoInfo ? (
          <div className="mandato-detalle">
            {/* Cuenta asociada a */}
            <div style={{ marginBottom: '1.5rem' }}>
              <ConsaludCore.Typography
                variant="body2"
                weight="medium"
                style={{
                  color: '#505050',
                  fontSize: '0.875rem',
                  marginBottom: '0.5rem'
                }}
              >
                Cuenta asociada a
              </ConsaludCore.Typography>
              <div style={{
                backgroundColor: '#F8F9FA',
                border: '1px solid #E9ECEF',
                borderRadius: '20px',
                padding: '0.75rem',
                marginBottom: '1rem'
              }}>
                <ConsaludCore.Typography
                  variant="body2"
                  style={{
                    color: '#666666',
                    fontSize: '0.875rem',
                    margin: 0
                  }}
                >
                  {herederoData ?
                    `${formatName(herederoData.NombrePersona)} ${formatName(herederoData.ApellidoPaterno)} ${formatName(herederoData.ApellidoMaterno)}`.trim() :
                    `${mandatoInfo.nombreCliente} ${mandatoInfo.apellidoPaterno || ''} ${mandatoInfo.apellido}`.trim()
                  }
                </ConsaludCore.Typography>
              </div>
            </div>

            {/* Detalles bancarios */}
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E9ECEF',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              {loadingCuentaBancaria ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <div className="loader" style={{ margin: '0 auto' }}></div>
                  <ConsaludCore.Typography
                    variant="body2"
                    style={{
                      color: '#666666',
                      fontSize: '0.875rem',
                      marginTop: '0.5rem'
                    }}
                  >
                    Cargando información bancaria...
                  </ConsaludCore.Typography>
                </div>
              ) : noTieneCuentaBancaria ? (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <ConsaludCore.Typography
                    variant="body2"
                    style={{
                      color: '#666666',
                      fontSize: '0.875rem',
                      fontStyle: 'italic'
                    }}
                  >
                    No tiene una cuenta bancaria registrada
                  </ConsaludCore.Typography>
                </div>
              ) : cuentaBancariaData ? (
                <>
                  <ConsaludCore.Typography
                    variant="body2"
                    weight="bold"
                    style={{
                      color: '#505050',
                      fontSize: '0.875rem',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {cuentaBancariaData.banco}
                  </ConsaludCore.Typography>
                  <ConsaludCore.Typography
                    variant="body2"
                    style={{
                      color: '#505050',
                      fontSize: '0.875rem',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {cuentaBancariaData.tipoCuenta}
                  </ConsaludCore.Typography>
                  <ConsaludCore.Typography
                    variant="body2"
                    style={{
                      color: '#505050',
                      fontSize: '0.875rem',
                      margin: 0
                    }}
                  >
                    N° {cuentaBancariaData.numeroCuenta}
                  </ConsaludCore.Typography>
                </>
              ) : (
                <>
                  <ConsaludCore.Typography
                    variant="body2"
                    weight="bold"
                    style={{
                      color: '#505050',
                      fontSize: '0.875rem',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {mandatoInfo.banco}
                  </ConsaludCore.Typography>
                  <ConsaludCore.Typography
                    variant="body2"
                    style={{
                      color: '#505050',
                      fontSize: '0.875rem',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {mandatoInfo.tipoCuenta}
                  </ConsaludCore.Typography>
                  <ConsaludCore.Typography
                    variant="body2"
                    style={{
                      color: '#505050',
                      fontSize: '0.875rem',
                      margin: 0
                    }}
                  >
                    N° {mandatoInfo.numeroCuenta}
                  </ConsaludCore.Typography>
                </>
              )}
            </div>



            {/* Radio button para confirmar si el mandato es correcto */}
            <div className="field mt-4">
              <div className="control">
                <div className="field">
                  <div className="control">
                    <label className="radio">
                      <input
                        type="radio"
                        name="esMandatoCorrecto"
                        value="si"
                        checked={esMandatoCorrecto === 'si'}
                        onChange={(e) => setEsMandatoCorrecto(e.target.value)}
                        disabled={bloquearRadioButtons || isExternalTabOpen || isOpeningTab}
                      />
                      <span className="ml-2">Sí, los datos corresponden a la persona heredera.</span>
                    </label>
                  </div>
                </div>
                <div className="field">
                  <div className="control">
                    <label className="radio">
                      <input
                        type="radio"
                        name="esMandatoCorrecto"
                        value="no"
                        checked={esMandatoCorrecto === 'no'}
                        onChange={(e) => setEsMandatoCorrecto(e.target.value)}
                        disabled={bloquearRadioButtons || isExternalTabOpen || isOpeningTab}
                      />
                      <span className="ml-2">No, los datos no corresponden a la persona heredera.</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="has-text-centered p-5">
            <p>No se encontró información de la cuenta bancaria</p>
          </div>
        )}

        {/* Botones */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '2rem',
          padding: '1rem 0'
        }}>
          {mandatoInfo && botonActualizarVisible && (
            <button
              className={`button is-primary is-rounded proceso-button ${esMandatoCorrecto === 'si' ? 'animate-fade-out-up' : 'animate-fade-in-up'}${(loading || iframeLoading || isButtonsLocked || isOpeningTab || showManualUrl || (esMandatoCorrecto === null && !noTieneCuentaBancaria) || loadingCuentaBancaria || shouldResetSelection) ? ' buttonRut--invalid' : ' buttonRut--valid'}`}
              disabled={loading || iframeLoading || isButtonsLocked || isOpeningTab || showManualUrl || (esMandatoCorrecto === null && !noTieneCuentaBancaria) || loadingCuentaBancaria || shouldResetSelection}
              onClick={handleActualizarMandato}
              type="button"
              aria-label={noTieneCuentaBancaria ? "Agregar mandato" : "Actualizar mandatos"}
              aria-busy={loading || iframeLoading}
              title={
                loading ? 'Cargando información del mandato...' :
                loadingCuentaBancaria ? 'Cargando información bancaria...' :
                shouldResetSelection ? 'Datos actualizados, seleccione nuevamente si el mandato es correcto' :
                isButtonsLocked ? `Botones bloqueados: ${lockReason}` :
                isOpeningTab ? 'Abriendo pestaña externa...' :
                showManualUrl ? 'Modal de apertura manual abierto' :
                esMandatoCorrecto === 'no' ? 'El mandato es incorrecto, se puede actualizar' :
                esMandatoCorrecto === null ? 'Seleccione si el mandato es correcto o no' :
                'Seleccione si el mandato es correcto o no'
              }
              style={{
                minWidth: 180,
                height: 42,
                fontWeight: 600,
                opacity: (loading || iframeLoading) ? 0.7 : 1,
                transition: 'opacity 0.2s',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                border: 'none',
                boxShadow: 'none',
                fontSize: 16,
                background: (loading || iframeLoading || isButtonsLocked || isOpeningTab || showManualUrl || (esMandatoCorrecto === null && !noTieneCuentaBancaria) || loadingCuentaBancaria || shouldResetSelection) ? '#E0F7F6' : '#04A59B',
                color: '#fff',
                padding: '17px 24px'
              }}
            >
              {loading ? 'Cargando...' :
               loadingCuentaBancaria ? 'Cargando...' :
               shouldResetSelection ? 'Seleccione Opción' :
               iframeLoading ? 'Cargando...' :
               isOpeningTab ? 'Abriendo...' :
               isButtonsLocked ? 'Pestaña Externa Abierta' :
               showManualUrl ? 'Modal Abierto' :
               noTieneCuentaBancaria ? 'Agregar Mandato' :
               'Actualizar Mandatos'}
            </button>
          )}
          <button
            className={`button is-primary is-rounded proceso-button animate-fade-in-up${(!mandatoInfo || saving || isButtonsLocked || esMandatoCorrecto === 'no' || esMandatoCorrecto === null || shouldResetSelection) ? ' buttonRut--invalid' : ' buttonRut--valid'}`}
            disabled={!mandatoInfo || saving || isButtonsLocked || esMandatoCorrecto === 'no' || esMandatoCorrecto === null || shouldResetSelection}
            onClick={handleSave}
            type="button"
            aria-label="Enviar solicitud"
            aria-busy={saving}
            title={
              shouldResetSelection ? 'Datos actualizados, seleccione nuevamente si el mandato es correcto' :
              isButtonsLocked ? `Botones bloqueados: ${lockReason}` :
              esMandatoCorrecto === 'no' ? 'El mandato es incorrecto, debe actualizarse primero' :
              esMandatoCorrecto === null ? 'Seleccione si el mandato es correcto o no' :
              ''
            }
            style={{
              minWidth: 180,
              height: 42,
              fontWeight: 600,
              opacity: saving ? 0.7 : 1,
              transition: 'opacity 0.2s',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 8,
              border: 'none',
              boxShadow: 'none',
              fontSize: 16,
              background: (!mandatoInfo || saving || isButtonsLocked || esMandatoCorrecto === 'no' || esMandatoCorrecto === null || shouldResetSelection) ? '#E0F7F6' : '#04A59B',
              color: '#fff',
              padding: '17px 24px'
            }}
          >
            {saving ? 'Enviando...' :
             shouldResetSelection ? 'Seleccione Opción' :
             isButtonsLocked ? 'Bloqueado' :
             'Enviar solicitud'}
          </button>
        </div>
      </div>

      {/* Modal para mostrar URL manual cuando falla window.open */}
      {showManualUrl && manualUrl && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              borderBottom: '1px solid #dee2e6',
              paddingBottom: '10px'
            }}>
              <h3 style={{ margin: 0, color: '#333' }}>Abrir Formulario Manualmente</h3>
              <button
                onClick={() => setShowManualUrl(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <h4 style={{ color: '#856404', margin: '0 0 10px 0' }}>
                  ⚠️ No se pudo abrir la pestaña automáticamente
                </h4>
                <p style={{ color: '#856404', margin: '0' }}>
                  Su navegador está bloqueando la apertura de popups. Puede abrir el formulario manualmente copiando la URL de abajo.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  URL del formulario:
                </label>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '10px'
                }}>
                  <input
                    type="text"
                    value={manualUrl}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      fontSize: '14px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <ConsaludCore.Button
                    variant="secondary"
                    onClick={() => {
                      navigator.clipboard.writeText(manualUrl);
                      alert('URL copiada al portapapeles');
                    }}
                  >
                    📋 Copiar
                  </ConsaludCore.Button>
                </div>
              </div>

              <div style={{
                backgroundColor: '#e7f3ff',
                border: '1px solid #b3d9ff',
                borderRadius: '6px',
                padding: '15px',
                textAlign: 'left',
                marginBottom: '20px'
              }}>
                <h5 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>Instrucciones:</h5>
                <ol style={{ margin: '0', paddingLeft: '20px', color: '#0066cc' }}>
                  <li>Copie la URL de arriba</li>
                  <li>Abra una nueva pestaña en su navegador</li>
                  <li>Pegue la URL en la barra de direcciones</li>
                  <li>Complete el formulario en la nueva pestaña</li>
                  <li>Regrese a esta pestaña cuando termine</li>
                </ol>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <ConsaludCore.Button
                  variant="secondary"
                  onClick={() => setShowManualUrl(false)}
                >
                  Cerrar
                </ConsaludCore.Button>
                <ConsaludCore.Button
                  variant="primary"
                  onClick={() => {
                    window.open(manualUrl, '_blank');
                    setShowManualUrl(false);
                  }}
                >
                  🌐 Intentar Abrir
                </ConsaludCore.Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { CargaMandatosCard };

