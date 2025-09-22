import * as ConsaludCore from '@consalud/core';
import React, { useEffect, useState } from 'react';
import { MandatoResult, mandatoSoapService } from '../../documentos/services/MandatoSoapService';
import { DOCUMENTOS_MESSAGES } from '../constants';
import { useDocumentos } from '../hooks/useDocumentos';
import { useMandatosTransaction } from '../hooks/useMandatosTransaction';
import { createSolicitante, createSolicitud, fetchTitularByRut, obtenerDocumentosAlmacenados } from '../services/herederosService';
// import MandatosIframeModal from './MandatosIframeModal'; // No utilizado - sistema usa pestañas externas
import { useStepper } from './Stepper';
import './styles/DetalleMandatoModal.css';

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

interface DetalleMandatoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const DetalleMandatoModal: React.FC<DetalleMandatoModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [mandatoInfo, setMandatoInfo] = useState<MandatoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { setStep } = useStepper();
  const { enviarDocumentos, loading: documentosLoading, error: documentosError } = useDocumentos();

  // Hook para manejar transacciones de mandatos con pestaña externa
  const {
    loading: iframeLoading,
    error: iframeError,
    refreshMandatosData,
    transactionId,
    // Funcionalidad de pestaña externa
    isExternalTabOpen,
    openExternalTab,
    closeExternalTab,
    externalTabUrl,
    // Funcionalidad de bloqueo de botones
    isButtonsLocked,
    lockReason,
    // Token de transacción
    transactionToken,
    hasActiveTransaction
  } = useMandatosTransaction();

  // Debug: Log del estado de bloqueo
  console.log('🔍 [DetalleMandatoModal] Estado completo:', {
    isButtonsLocked,
    lockReason,
    isExternalTabOpen,
    transactionToken,
    hasActiveTransaction,
    timestamp: Date.now()
  });

  // Verificar si los botones deberían estar bloqueados
  const shouldBeLocked = isButtonsLocked || hasActiveTransaction;
  console.log('🔍 [DetalleMandatoModal] ¿Deberían estar bloqueados?', {
    isButtonsLocked,
    hasActiveTransaction,
    shouldBeLocked
  });

  // Función para manejar el clic en "Actualizar Mandato"
  const handleActualizarMandato = async () => {
    try {
      // Verificar si ya hay una pestaña externa abierta
      if (isExternalTabOpen) {
        throw new Error('Ya hay una pestaña externa abierta. Cierre la pestaña actual antes de abrir una nueva.');
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

      console.log('🔄 Abriendo pestaña externa para actualización de mandatos, RUT:', rutHeredero);
      await openExternalTab(rutHeredero);
    } catch (err: any) {
      console.error('❌ Error al abrir pestaña externa:', err);
      setError(err.message || 'Error al abrir el formulario de actualización');
    }
  };

  // Función para manejar el cierre de pestaña externa
  const handleExternalTabClose = () => {
    closeExternalTab();
    refreshMandatosData();

    // Recargar datos del mandato
    const fetchMandatoData = async () => {
      setLoading(true);
      try {
        const rutCliente = localStorage.getItem('currentRutCliente') || '17175966';
        const mandatoId = localStorage.getItem('currentMandatoId') || '';

        console.log(`🔄 Recargando detalles para RUT: ${rutCliente}, Mandato: ${mandatoId}`);

        const resultado = await mandatoSoapService.getMandatoInfo(rutCliente, mandatoId);
        setMandatoInfo(resultado);
      } catch (err) {
        console.error('Error al recargar detalles del mandato:', err);
        setError('No se pudo recargar la información del mandato');
      } finally {
        setLoading(false);
      }
    };

    fetchMandatoData();
  };

     // Obtener datos del mandato cuando se abre el modal
   useEffect(() => {
     if (isOpen) {
       // Avanzar al paso 4 del stepper cuando se abre el modal
       setStep(4);

       // Limpiar documentos de sesiones anteriores (opcional - comentar si no se desea)
       // const allKeys = Object.keys(sessionStorage);
       // const documentoKeys = allKeys.filter(key => key.includes('documentos'));
       // documentoKeys.forEach(key => {
       //   console.log('🧹 Limpiando documentos de sesión anterior:', key);
       //   sessionStorage.removeItem(key);
       // });

      const fetchMandatoData = async () => {
        setLoading(true);
        try {
          // Buscar en localStorage
          const rutCliente = localStorage.getItem('currentRutCliente') || '17175966';
          const mandatoId = localStorage.getItem('currentMandatoId') || '';

          console.log(`Obteniendo detalles para RUT: ${rutCliente}, Mandato: ${mandatoId}`);

          // Llamar al servicio
          const resultado = await mandatoSoapService.getMandatoInfo(rutCliente, mandatoId);
          setMandatoInfo(resultado);
        } catch (err) {
          console.error('Error al cargar detalles del mandato:', err);
          setError('No se pudo cargar la información del mandato');
        } finally {
          setLoading(false);
        }
      };

      fetchMandatoData();
    }
  }, [isOpen, setStep]);

  // Restaurar al paso 3 cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      setStep(3);
    }
  }, [isOpen, setStep]);

  // Función para manejar el guardado del solicitante
  const handleSave = async () => {
    if (!mandatoInfo) return;

    setSaving(true);
    setError(null);

    try {
      // Buscar automáticamente en todas las claves del sessionStorage que contengan datos de herederos
      const allKeys = Object.keys(sessionStorage);
      const formKeys = allKeys.filter(key => key.includes('formHeredero') || key.includes('heredero'));

      console.log('Claves disponibles en sessionStorage:', allKeys);
      console.log('Claves relacionadas con herederos:', formKeys);

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
              console.log('Datos encontrados en clave:', key);
              break;
            }
          } catch (parseError) {
            console.log('Error al parsear datos de la clave:', key, parseError);
            continue;
          }
        }
      }

      if (!storedData) {
        throw new Error(`No se encontraron datos válidos del formulario en el sessionStorage. Claves revisadas: ${formKeys.join(', ')}`);
      }

      const formData = JSON.parse(storedData);
      console.log('Datos del formulario parseados:', formData);

      // Verificar datos del titular en sessionStorage
      const titularContextData = sessionStorage.getItem('titularContext');
      if (titularContextData) {
        const titularData = JSON.parse(titularContextData);
        console.log('Datos del titular en sessionStorage:', titularData);
        console.log('IdPersona del titular disponible:', titularData.id);
      } else {
        console.warn('No se encontraron datos del titular en sessionStorage');
      }

      // Extraer el RUT del formulario encontrado
      const rutFormulario = formData.RutPersona || formData.RutCompleto || '0';
      console.log('RUT del formulario encontrado:', rutFormulario);

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

      console.log('Datos preparados para la API:', solicitanteData);

      // Llamar a la API para crear el solicitante
      const resultSolicitante = await createSolicitante(solicitanteData, 'SISTEMA');

      console.log('Respuesta completa de createSolicitante:', resultSolicitante);

      if (resultSolicitante.success && resultSolicitante.status === 201) {
        console.log('Solicitante creado exitosamente:', resultSolicitante);

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

          console.log('Fecha actual en formato ISO (local):', fechaISO);
          console.log('Hora local actual:', new Date().toLocaleString());
          console.log('Offset de zona horaria (minutos):', new Date().getTimezoneOffset());

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
              console.log('✅ IdPersona del titular obtenido desde sessionStorage:', titularData.id);

              // Obtener el RUT del titular desde sessionStorage
              if (titularData.rut) {
                rutTitular = titularData.rut;
                console.log('✅ RUT del titular obtenido desde sessionStorage:', rutTitular);
              } else if (titularData.rutPersona) {
                rutTitular = titularData.rutPersona;
                console.log('✅ RUT del titular obtenido desde sessionStorage (rutPersona):', rutTitular);
              }
            }

            // Si no se encontró en sessionStorage, usar el RUT del mandato
            if (!rutTitular || rutTitular === 0) {
              rutTitular = mandatoInfo.rutCliente;
              console.log('🔍 RUT del titular obtenido del mandato (fallback):', rutTitular);

              // Si tampoco tenemos idMae, consultar la API
              if (!idMae || idMae === 0) {
                const titularInfo = await fetchTitularByRut(parseInt(rutTitular), 'SISTEMA');
                idMae = titularInfo.id;
                console.log('✅ IdPersona del titular obtenido desde API:', idMae);
              }
            }

            console.log('🔍 RUT del titular final para documentos:', rutTitular);
            console.log('🔍 IdPersona del titular final:', idMae);

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

          console.log('IDs extraídos de la respuesta:', { newIdSolicitante, idMae });

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

          console.log('Datos para crear solicitud:', solicitudData);

          // Llamar a la API para crear la solicitud
          const resultSolicitud = await createSolicitud(solicitudData, 'SISTEMA');

          console.log('Respuesta completa de createSolicitud:', resultSolicitud);

          if (resultSolicitud.success && resultSolicitud.status === 201) {
            console.log('Solicitud creada exitosamente:', resultSolicitud);

                         // Obtener el ID de la solicitud creada
             console.log('🔍 Respuesta completa de createSolicitud para debugging:', JSON.stringify(resultSolicitud, null, 2));
             console.log('🔍 Estructura de resultSolicitud.data:', resultSolicitud.data);

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

                          console.log('🔍 ID de solicitud extraído:', newIdSolicitud);

             if (newIdSolicitud) {
               console.log('✅ ID de solicitud obtenido exitosamente:', newIdSolicitud);

                                            try {
                 // Obtener el RUT del titular fallecido (sin DV, solo números)
                 let rutTitularFallecido: number;

                 if (typeof rutTitular === 'string') {
                   // Extraer solo los números del RUT (sin puntos, guiones ni DV)
                   const rutNumeros = rutTitular.replace(/[^0-9]/g, '');
                   rutTitularFallecido = parseInt(rutNumeros);
                   console.log('🔍 RUT original:', rutTitular);
                   console.log('🔍 RUT solo números:', rutNumeros);
                   console.log('🔍 RUT del titular fallecido (sin DV):', rutTitularFallecido);
                 } else {
                   rutTitularFallecido = rutTitular;
                   console.log('🔍 RUT del titular fallecido (ya numérico):', rutTitularFallecido);
                 }

                 if (!rutTitularFallecido || rutTitularFallecido === 0) {
                   console.error('❌ ERROR: rutTitularFallecido es 0 o inválido. No se pueden buscar documentos.');
                   throw new Error('RUT del titular fallecido es 0 o inválido');
                 }

                                                  // Obtener documentos almacenados del session storage
                 console.log('🔍 Buscando documentos en sessionStorage con RUT:', rutTitularFallecido);
                 console.log('🔍 Claves disponibles en sessionStorage:', Object.keys(sessionStorage));

                 // Verificar si existe la clave específica de documentos
                 const expectedKey = `documentos_${rutTitularFallecido.toString().replace(/[^0-9kK]/g, '')}`;
                 console.log('🔍 Clave esperada para documentos:', expectedKey);
                 console.log('🔍 ¿Existe la clave en sessionStorage?', sessionStorage.getItem(expectedKey) ? 'SÍ' : 'NO');

                 const documentos = obtenerDocumentosAlmacenados(rutTitularFallecido);
                 console.log('📄 Documentos obtenidos del storage:', documentos);

                 // Si no hay documentos, buscar manualmente en todas las claves que contengan "documentos"
                 if (documentos.length === 0) {
                   const allKeys = Object.keys(sessionStorage);
                   const documentoKeys = allKeys.filter(key => key.includes('documentos'));
                   console.log('🔍 Claves que contienen "documentos":', documentoKeys);

                   // Buscar documentos en cualquier clave disponible
                   for (const key of documentoKeys) {
                     const data = sessionStorage.getItem(key);
                     console.log(`🔍 Contenido de ${key}:`, data ? 'TIENE DATOS' : 'VACÍO');

                     if (data) {
                       try {
                         const documentosAlternativos = JSON.parse(data);
                         if (documentosAlternativos && documentosAlternativos.length > 0) {
                           console.log('✅ Documentos encontrados en clave alternativa:', key);
                           console.log('📄 Documentos alternativos:', documentosAlternativos);

                           // Usar estos documentos como fallback
                           documentos.push(...documentosAlternativos);
                           break; // Usar el primer conjunto de documentos encontrados
                         }
                       } catch (parseError) {
                         console.log('Error al parsear documentos de clave alternativa:', key, parseError);
                       }
                     }
                   }

                   console.log('📄 Total de documentos encontrados (incluyendo alternativos):', documentos.length);
                 }

                if (documentos.length > 0) {
                    console.log('Documentos encontrados para enviar:', documentos);

                    // Enviar documentos a la API usando el hook
                    console.log('Iniciando envío de documentos con:', {
                      newIdSolicitud,
                      rutTitularFallecido,
                      totalDocumentos: documentos.length
                    });

                    const resultDocumentos = await enviarDocumentos(
                      newIdSolicitud,
                      'SISTEMA',
                      rutTitularFallecido,
                      documentos
                    );

                    if (resultDocumentos.success) {
                      console.log('Documentos enviados exitosamente:', resultDocumentos);
                      setSaveSuccess(true);
                      // Cerrar el modal después de 3 segundos
                      setTimeout(() => {
                        onSave();
                      }, 3000);
                    } else {
                      console.warn(DOCUMENTOS_MESSAGES.ERROR.DOCUMENTS_SEND_FAILED, resultDocumentos.message);
                      setSaveSuccess(true);
                      // Cerrar el modal después de 3 segundos aunque fallen los documentos
                      setTimeout(() => {
                        onSave();
                      }, 3000);
                    }
                  } else {
                    console.log(DOCUMENTOS_MESSAGES.ERROR.NO_DOCUMENTS);
                    setSaveSuccess(true);
                    // Cerrar el modal después de 3 segundos
                    setTimeout(() => {
                      onSave();
                    }, 3000);
                  }
              } catch (errorDocumentos: any) {
                console.error('Error al enviar documentos:', errorDocumentos);
                // Aunque fallen los documentos, la solicitud se creó correctamente
                setSaveSuccess(true);
                // Cerrar el modal después de 3 segundos
                setTimeout(() => {
                  onSave();
                }, 3000);
              }
            } else {
              console.warn('No se pudo obtener el ID de la solicitud de la respuesta');
              setSaveSuccess(true);
              // Cerrar el modal después de 3 segundos
              setTimeout(() => {
                onSave();
              }, 3000);
            }
          } else {
            throw new Error(`Error al crear la solicitud. Status: ${resultSolicitud.status}, Respuesta: ${JSON.stringify(resultSolicitud)}`);
          }
        } catch (errorSolicitud: any) {
          console.error('Error al crear solicitud:', errorSolicitud);
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

      setError(err.message || 'Error al guardar el solicitante');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="modal-header">
          <h2 className="modal-title">Mandatos</h2>
          <button className="modal-close-button" onClick={onClose} aria-label="Cerrar modal">
            ×
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="modal-body">
          {/* Indicador de bloqueo de botones */}
          {isButtonsLocked && (
            <div className="notification is-warning mb-4">
              <div className="is-flex is-align-items-center">
                <span className="icon is-small mr-2">
                  <i className="fas fa-lock"></i>
                </span>
                <div>
                  <strong>Botones bloqueados:</strong> {lockReason}
                  <br />
                  <small>Complete el proceso en la pestaña externa para desbloquear los botones.</small>
                </div>
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
              <ConsaludCore.Button
                variant="primary"
                onClick={onClose}
                className="mt-4"
              >
                Cerrar
              </ConsaludCore.Button>
            </div>
          ) : mandatoInfo ? (
            <div className="mandato-detalle">
              <div className="columns">
                <div className="column">
                  <div className="field-group">
                    <h4 className="subtitle is-6">Información de la cuenta</h4>
                    <div className="field">
                      <label className="label">Banco</label>
                      <p className="field-value">{mandatoInfo.banco}</p>
                    </div>
                    <div className="field">
                      <label className="label">Tipo de cuenta</label>
                      <p className="field-value">{mandatoInfo.tipoCuenta}</p>
                    </div>
                    <div className="field">
                      <label className="label">Número de cuenta</label>
                      <p className="field-value">{mandatoInfo.numeroCuenta}</p>
                    </div>
                    <div className="field">
                      <label className="label">ID de mandato</label>
                      <p className="field-value">{mandatoInfo.mandatoId}</p>
                    </div>
                    {mandatoInfo.Sindtipo && (
                      <div className="field">
                        <label className="label">Tipo</label>
                        <p className="field-value">{mandatoInfo.Sindtipo === '1' ? 'Cuenta Corriente' :
                                                   mandatoInfo.Sindtipo === '2' ? 'Cuenta Vista' :
                                                   mandatoInfo.Sindtipo === '3' ? 'Cuenta de Ahorro' :
                                                   mandatoInfo.Sindtipo}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="column">
                  <div className="field-group">
                    <h4 className="subtitle is-6">Información del titular</h4>
                    <div className="field">
                      <label className="label">Nombre</label>
                      <p className="field-value">{mandatoInfo.nombreCliente}</p>
                    </div>
                    <div className="field">
                      <label className="label">Apellido Paterno</label>
                      <p className="field-value">{mandatoInfo.apellidoPaterno || '-'}</p>
                    </div>
                    <div className="field">
                      <label className="label">Apellido Materno</label>
                      <p className="field-value">{mandatoInfo.apellido}</p>
                    </div>
                    <div className="field">
                      <label className="label">RUT</label>
                      <p className="field-value">{mandatoInfo.rutCliente}-{mandatoInfo.digitoVerificador}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mostrar campos adicionales del servicio SOAP en un acordeón */}
              <div className="box mt-4">
                <details>
                  <summary className="has-text-primary has-text-weight-medium">Información adicional del mandato</summary>
                  <div className="columns is-multiline mt-3">
                    {Object.entries(mandatoInfo)
                      .filter(([key]) => !['mandatoId', 'banco', 'tipoCuenta', 'numeroCuenta',
                                          'nombreCliente', 'apellido', 'apellidoPaterno', 'rutCliente',
                                          'digitoVerificador', 'mensaje', 'Sindtipo'].includes(key))
                      .map(([key, value]) => (
                        <div className="column is-half" key={key}>
                          <div className="field">
                            <label className="label is-small">{key}</label>
                            <p className="field-value">{String(value || '-')}</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </details>
              </div>

              <div className="notification is-info is-light mt-4">
                <p>Esta información bancaria será utilizada para realizar la devolución de los fondos correspondientes.</p>
                <p className="mt-2 is-size-7">Si los datos no son correctos, por favor vuelva al paso anterior y modifique la información.</p>
              </div>
            </div>
          ) : (
            <div className="has-text-centered p-5">
              <p>No se encontró información de la cuenta bancaria</p>
              <ConsaludCore.Button
                variant="primary"
                onClick={onClose}
                className="mt-4"
              >
                Cerrar
              </ConsaludCore.Button>
            </div>
          )}
        </div>

        {/* Footer del modal con botones */}
        <div className="modal-footer">
          <ConsaludCore.Button
            variant="secondary"
            onClick={onClose}
            className="mr-3"
          >
            Cancelar
          </ConsaludCore.Button>
          {mandatoInfo && (
            <ConsaludCore.Button
              variant="secondary"
              onClick={handleActualizarMandato}
              disabled={iframeLoading || isButtonsLocked}
              className="mr-3"
              title={isButtonsLocked ? `Botones bloqueados: ${lockReason}` : ''}
            >
              {iframeLoading ? 'Cargando...' : isButtonsLocked ? 'Pestaña Externa Abierta' : 'Actualizar Mandato'}
            </ConsaludCore.Button>
          )}
          <ConsaludCore.Button
            variant="primary"
            onClick={handleSave}
            disabled={!mandatoInfo || saving || isButtonsLocked}
            title={isButtonsLocked ? `Botones bloqueados: ${lockReason}` : ''}
          >
            {saving ? 'Guardando...' : isButtonsLocked ? 'Bloqueado' : 'Guardar'}
          </ConsaludCore.Button>
        </div>
      </div>

      {/* Modal de iframe eliminado - sistema usa pestañas externas directamente */}
    </div>
  );
};

export { DetalleMandatoModal };

