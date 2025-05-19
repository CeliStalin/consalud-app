import React, { useState, useEffect, useRef } from 'react';
import { SecureLayout, Card, Button } from '@consalud/core';
import { useNavigate } from 'react-router-dom';
import { externalAppService } from '../features/documentos/services/ExternalAppService';
import { mandatoSoapService, MandatoResult } from '../features/documentos/services/MandatoSoapService';
import './styles/IngresoDocumentosPage.css';

const IngresoDocumentosPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados para manejar la integración con la aplicación externa
  const [isExternalAppOpen, setIsExternalAppOpen] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'error' | 'cancelled' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);
  
  // Estado para la información del mandato
  const [mandatoInfo, setMandatoInfo] = useState<MandatoResult | null>(null);
  
  // Ref para rastrear si el usuario cerró la ventana intencionalmente
  const userClosedRef = useRef(false);

  // Estado para los radio buttons que aparecen después de cerrar la ventana
  const [showRadioOptions, setShowRadioOptions] = useState(false);
  const [documentsCompleted, setDocumentsCompleted] = useState<string | null>(null);
  const [windowJustClosed, setWindowJustClosed] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Función para abrir la aplicación externa
  const openExternalApp = async () => {
    setLoading(true);
    setError(null);
    userClosedRef.current = false;
    
    try {
      // Primero, obtener la información actual de la cuenta bancaria
      const rutCliente = '17175966'; // Idealmente esto vendría de tu contexto o props
      await fetchMandatoData(rutCliente);
      
      // Datos de ejemplo
      const datosEjemplo = {
        empleado: localStorage.getItem('userName') || 'SISTEMA',
        rutafiliado: '17175966-8',
        nombres: 'Ignacio Javier',
        appaterno: 'Quintana',
        apmaterno: 'Asenjo',
        tipo: 'HER',
        transactionId: externalAppService.generateTransactionId()
      };
      
      // Usar el método que crea un modal con iframe
      const result = await externalAppService.openExternalAppInModal(datosEjemplo);
      
      // Almacenar IDs
      setModalId(result.modalId);
      setTransactionId(result.transactionId);
      setIsExternalAppOpen(true);
      setTransactionStatus('pending');
      
      // Escuchar el evento de cierre del modal
      const handleExternalAppClosed = (event: CustomEvent) => {
        if (event.detail.transactionId === result.transactionId) {
          setIsExternalAppOpen(false);
          setWindowJustClosed(true);
          setShowRadioOptions(true);
          
          // Actualizar datos
          fetchMandatoData('17175966', true);
          
          // Limpiar tracking
          localStorage.removeItem('currentExternalTransaction');
          
          // Eliminar este listener
          window.removeEventListener('externalAppClosed', handleExternalAppClosed as EventListener);
        }
      };
      
      // Añadir listener para el evento de cierre
      window.addEventListener('externalAppClosed', handleExternalAppClosed as EventListener);
      
      // También escuchar eventos de actualización de mandato
      const handleRefreshRequest = () => {
        if (autoRefreshEnabled) {
          console.log('Recibida solicitud de actualización de datos de mandato');
          fetchMandatoData('17175966', true);
        }
      };
      
      window.addEventListener('refreshMandatoRequest', handleRefreshRequest);
      
      // Limpiar el listener cuando se desmonte el componente
      return () => {
        window.removeEventListener('refreshMandatoRequest', handleRefreshRequest);
      };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al abrir la aplicación externa';
      console.error(errorMessage);
      setError(errorMessage);
      setTransactionStatus('error');
    } finally {
      setLoading(false);
    }
  };
    
  // Función para obtener información del mandato
  const fetchMandatoData = async (rutCliente: string = '17175966', refreshData: boolean = false) => {
    // Si ya tenemos datos y no se solicita actualización, no hacemos nada
    if (mandatoInfo && !refreshData) {
      console.log('Usando información de mandato existente (no se solicitó actualización)');
      return;
    }
    
    setLoading(true);
    try {
      console.log(`Consultando información del mandato para RUT: ${rutCliente}${refreshData ? ' (Actualización forzada)' : ''}`);
      
      // Llamar al servicio SOAP
      const resultado = await mandatoSoapService.getMandatoInfo(rutCliente, '');
      
      console.log('Datos recibidos del servicio:', resultado);
      
      // Actualizar estado con la respuesta
      setMandatoInfo(prevInfo => {
        // Verificar si los datos son diferentes antes de actualizar
        if (prevInfo && prevInfo.numeroCuenta === resultado.numeroCuenta && !refreshData) {
          console.log('Los datos recibidos son idénticos a los actuales, no es necesario actualizar.');
          return prevInfo;
        }
        
        console.log('Actualizando información del mandato con nuevos datos.');
        return resultado;
      });
      
      // Si todo fue bien, marcar como exitoso
      if (resultado.mensaje === 'OK') {
        // Solo actualizamos el estado de la transacción si es una actualización
        // o si no hay una transacción en progreso
        if (refreshData || !isExternalAppOpen) {
          setTransactionStatus('success');
          setError(null);
        }
        
        // Guardar información para uso posterior
        localStorage.setItem('currentRutCliente', rutCliente);
        localStorage.setItem('currentMandatoId', resultado.mandatoId);
        localStorage.setItem('lastMandatoUpdate', Date.now().toString());
        
        console.log('Información del mandato recuperada exitosamente:', resultado);
      } else {
        setTransactionStatus('error');
        setError(`Error en la transacción: ${resultado.mensaje}`);
        console.error('Error en respuesta del servicio:', resultado.mensaje);
      }
    } catch (err) {
      console.error('Error al obtener datos del mandato:', err);
      setTransactionStatus('error');
      setError('Error al obtener información actualizada del mandato');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para limpiar recursos cuando se desmonta el componente
  useEffect(() => {
    return () => {
      // Limpiar cualquier modal que pueda estar abierto
      if (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
          document.body.removeChild(modal);
        }
      }
      
      // Desactivar actualizaciones automáticas al salir
      setAutoRefreshEnabled(false);
    };
  }, [modalId]);

  // Verificar al cargar si hay una transacción pendiente
  useEffect(() => {
    const checkPendingTransaction = async () => {
      const storedTransactionId = localStorage.getItem('currentExternalTransaction');
      
      if (storedTransactionId) {
        try {
          setLoading(true);
          // Verificar el estado en el servidor
          const result = await externalAppService.checkTransactionStatus(storedTransactionId);
          
          if (result.status === 'success') {
            // Si la transacción fue exitosa, obtener datos del mandato
            await fetchMandatoData('17175966');
            setTransactionStatus('success');
          } else if (result.status === 'error') {
            setTransactionStatus('error');
            setError(result.error || 'La operación no se completó correctamente');
          } else {
            // Si sigue pendiente, limpiamos para permitir un nuevo intento
            setTransactionStatus(null);
          }
          
          // Limpiar tracking en cualquier caso
          localStorage.removeItem('currentExternalTransaction');
        } catch (err) {
          console.error('Error al verificar transacción pendiente:', err);
          localStorage.removeItem('currentExternalTransaction');
        } finally {
          setLoading(false);
        }
      }
    };
    
    checkPendingTransaction();
  }, []);

  // Manejador para el cambio de radio buttons
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentsCompleted(e.target.value);
  };

  // Efectuar la actualización de datos cuando hay una respuesta definitiva del usuario
  useEffect(() => {
    if (windowJustClosed && documentsCompleted !== null) {
      // Si seleccionaron "No", reintentar la carga (botón queda habilitado) 
      // la actualización de datos se ejecutó automáticamente al cerrar la ventana
      setWindowJustClosed(false);
    }
  }, [documentsCompleted, windowJustClosed]);

  // Renderizar información del mandato
  const renderMandatoInfo = () => {
    if (!mandatoInfo) return null;
    
    return (
      <div className="mandato-info box my-4">
        <h3 className="title is-5">Información de la cuenta bancaria</h3>
        <div className="content">
          <div className="columns is-multiline">
            <div className="column is-half">
              <p><strong>Banco:</strong> {mandatoInfo.banco}</p>
              <p><strong>Tipo de cuenta:</strong> {mandatoInfo.tipoCuenta}</p>
              <p><strong>Número de cuenta:</strong> {mandatoInfo.numeroCuenta}</p>
            </div>
            <div className="column is-half">
              <p><strong>Titular:</strong> {mandatoInfo.nombreCliente} {mandatoInfo.apellidoPaterno || ''} {mandatoInfo.apellido}</p>
              <p><strong>RUT:</strong> {mandatoInfo.rutCliente}-{mandatoInfo.digitoVerificador}</p>
              <p><strong>ID Mandato:</strong> {mandatoInfo.mandatoId}</p>
            </div>
          </div>
          
          {/* Si el servicio devolvió más campos, mostrarlos en una sección desplegable */}
          {Object.keys(mandatoInfo).length > 9 && (
            <details className="mt-3">
              <summary className="has-text-info is-size-7">Ver información adicional</summary>
              <div className="columns is-multiline mt-2 pl-3 is-size-7">
                {Object.entries(mandatoInfo)
                  .filter(([key]) => !['mandatoId', 'banco', 'tipoCuenta', 'numeroCuenta', 
                                      'nombreCliente', 'apellido', 'apellidoPaterno', 'rutCliente', 
                                      'digitoVerificador', 'mensaje'].includes(key))
                  .map(([key, value]) => (
                    <div className="column is-half" key={key}>
                      <p><strong>{key}:</strong> {String(value || '-')}</p>
                    </div>
                  ))
                }
              </div>
            </details>
          )}
        </div>
      </div>
    );
  };

  // Función para continuar el flujo después de una operación exitosa
  const handleContinue = () => {
    if (mandatoInfo) {
      // Navegar a la página de detalle pasando la información del mandato
      navigate('/mnherederos/ingresoher/detallemandato', {
        state: {
          rutCliente: mandatoInfo.rutCliente,
          mandatoId: mandatoInfo.mandatoId
        }
      });
    } else {
      // Si no hay información, continuar al siguiente paso normal
      navigate('/mnherederos/ingresoher/success');
    }
  };

  // Función para reintentar la operación
  const handleRetry = () => {
    setTransactionStatus(null);
    setError(null);
    setMandatoInfo(null);
    setShowRadioOptions(false);
    setDocumentsCompleted(null);
  };

  return (
    <SecureLayout pageTitle="Ingreso Documentos" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <div className="content-container" style={{ minHeight: '400px' }}>
        <Card 
          title="Ingreso de Documentos" 
          subtitle="Gestión de documentación"
          variant="elevated"
          padding="large"
        >
          <div className="documentos-content">
            <p className="instrucciones">
              Para cargar el mandato requerido para el proceso de devolución, 
              haga clic en el botón "Cargar Mandatos" a continuación. Se abrirá una 
              ventana donde podrá seleccionar y subir su cuenta.
            </p>
            
            {/* Mensajes específicos según el estado */}
            {error && (
              <div className="notification is-danger">
                <p>{error}</p>
              </div>
            )}
            
            {transactionStatus === 'success' && !error && (
              <div className="notification is-success">
                <p><strong>Información actualizada correctamente</strong></p>
                {mandatoInfo && 
                  <p>Se ha {isExternalAppOpen ? "obtenido" : "actualizado"} la información de la cuenta bancaria.</p>
                }
                {!isExternalAppOpen && 
                  <p className="is-size-7 mt-2">
                    Los cambios realizados en la ventana externa se han aplicado correctamente.
                  </p>
                }
              </div>
            )}
            
            {transactionStatus === 'cancelled' && (
              <div className="notification is-warning">
                <p>
                  <strong>La ventana fue cerrada sin completar el proceso.</strong>
                </p>
                <p>
                  Para continuar, debe completar el proceso de carga de documentos.
                </p>
              </div>
            )}
            
            {/* Añadir botón para actualizar manualmente los datos cuando tenemos mandatoInfo */}
            {mandatoInfo && (
              <div className="has-text-right mb-3">
                <button 
                  className="button is-small is-info is-light is-outlined"
                  onClick={() => fetchMandatoData('17175966', true)}
                  disabled={loading || isExternalAppOpen}
                >
                  <span className="icon is-small">
                    <i className="fas fa-sync-alt"></i>
                    {/* Si no tienes Font Awesome, usar un texto simple */}
                    {!document.querySelector('.fas') && '↻'}
                  </span>
                  <span>Actualizar datos</span>
                </button>
              </div>
            )}
            
            {/* Mostrar la información del mandato cuando está disponible */}
            {mandatoInfo && renderMandatoInfo()}
            
            {/* Mostrar radio buttons después de cerrar la ventana */}
            {showRadioOptions && (
              <div className="radio-options-container mt-4 mb-4 p-4 has-background-light has-radius is-rounded">
                <p className="has-text-weight-medium mb-3">¿Completó la carga de documentos en la ventana anterior?</p>
                <div className="control radio-options">
                  <label className="radio mr-5">
                    <input 
                      type="radio" 
                      name="documentsCompleted" 
                      value="si" 
                      checked={documentsCompleted === 'si'} 
                      onChange={handleRadioChange}
                      className="mr-2"
                    />
                    Sí, completé todos los documentos
                  </label>
                  <label className="radio">
                    <input 
                      type="radio" 
                      name="documentsCompleted" 
                      value="no" 
                      checked={documentsCompleted === 'no'} 
                      onChange={handleRadioChange}
                      className="mr-2"
                    />
                    No, necesito volver a Cargar Mandatos
                  </label>
                </div>
              </div>
            )}
            
            <div className="documentos-actions">
              {/* Botón para iniciar el proceso externo */}
              <Button 
                variant="primary"
                loading={loading}
                disabled={isExternalAppOpen || loading || 
                  (showRadioOptions && documentsCompleted === 'si')}
                onClick={openExternalApp}
                className="cargar-documentos-btn"
              >
                {isExternalAppOpen ? 'Procesando en otra ventana...' : 'Cargar Mandatos'}
              </Button>
              
              {/* Mostrar este mensaje mientras la ventana externa está abierta */}
              {isExternalAppOpen && (
                <div className="notification is-info mt-3">
                  <p>
                    <strong>Por favor complete el proceso en la ventana abierta.</strong>
                  </p>
                  <p className="is-size-7 mt-2">
                    Esta aplicación permanecerá bloqueada hasta que finalice el proceso 
                    de carga de documentos o cierre la ventana externa.
                  </p>
                  <p className="is-size-7 mt-2">
                    <strong>Nota:</strong> Al cerrar la ventana, se actualizará automáticamente 
                    la información de la cuenta bancaria.
                  </p>
                </div>
              )}
              
              {/* Mostrar mensaje cuando se está procesando con ventana externa cerrada */}
              {!isExternalAppOpen && mandatoInfo && transactionStatus === 'pending' && (
                <div className="notification is-warning mt-3">
                  <p>
                    <strong>Verificando cambios realizados...</strong>
                  </p>
                  <p className="is-size-7 mt-2">
                    Estamos consultando la información actualizada de la cuenta bancaria.
                  </p>
                </div>
              )}
              
              {/* Botón para continuar después de completar el proceso exitosamente */}
              {transactionStatus === 'success' && (
                <Button 
                  variant="primary"
                  onClick={handleContinue}
                  className="continuar-btn mt-4"
                >
                  Continuar
                </Button>
              )}
              
              {/* Botón para reintentar si hubo un error o cancelación */}
              {(transactionStatus === 'error' || transactionStatus === 'cancelled') && (
                <Button 
                  variant="secondary"
                  onClick={handleRetry}
                  className="retry-btn mt-3"
                >
                  Intentar de nuevo
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </SecureLayout>
  );
};

export default IngresoDocumentosPage;