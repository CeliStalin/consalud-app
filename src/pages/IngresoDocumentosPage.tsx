import React, { useState, useEffect, useRef } from 'react';
import { SecureLayout, Card, Button } from '@consalud/core';
import { useNavigate } from 'react-router-dom';
import { externalAppService } from '../features/documentos/services/ExternalAppService';
import './styles/IngresoDocumentosPage.css';

const IngresoDocumentosPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados para manejar la integración con la aplicación externa
  const [isExternalAppOpen, setIsExternalAppOpen] = useState(false);
  const [externalWindow, setExternalWindow] = useState<Window | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'error' | 'cancelled' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref para el intervalo de verificación
  const intervalRef = useRef<number | undefined>(undefined);
  // Ref para rastrear si el usuario cerró la ventana intencionalmente
  const userClosedRef = useRef(false);

  // Función para abrir la aplicación externa
  const openExternalApp = async () => {
    setLoading(true);
    setError(null);
    userClosedRef.current = false;
    
    try {
      // Usamos datos de prueba en lugar de los datos reales
      const datosEjemplo = {
        empleado: localStorage.getItem('userName') || 'SISTEMA',
        rutafiliado: '17175966-8',
        nombres: 'Ignacio Javier',
        appaterno: 'Quintana',
        apmaterno: 'Asenjo',
        tipo: 'HER', // Tipo de operación (Heredero)
        transactionId: externalAppService.generateTransactionId()
      };
      
      // Abrir la aplicación externa usando el servicio
      const result = await externalAppService.openExternalApp(datosEjemplo);
      
      // Guardar referencias
      setExternalWindow(result.window);
      setTransactionId(result.transactionId);
      setIsExternalAppOpen(true);
      setTransactionStatus('pending');
      
      // Agregar un evento beforeunload a la ventana externa para detectar cierre intencional
      if (result.window) {
        try {
          result.window.addEventListener('beforeunload', () => {
            userClosedRef.current = true;
          });
        } catch (e) {
          console.warn('No se pudo agregar listener a ventana externa (restricciones de CORS)');
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al abrir la aplicación externa';
      console.error(errorMessage);
      setError(errorMessage);
      setTransactionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  // Verificar periódicamente si la ventana externa ha sido cerrada
  useEffect(() => {
    if (isExternalAppOpen && externalWindow) {
      // Limpiar cualquier intervalo existente
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      
      // Establecer nuevo intervalo
      intervalRef.current = window.setInterval(async () => {
        // Verificar si la ventana fue cerrada
        if (externalWindow.closed) {
          // Detener el intervalo
          if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = undefined;
          }
          
          console.log('La ventana externa fue cerrada');
          setIsExternalAppOpen(false);
          
          // Consultar el estado real de la transacción en el servidor
          try {
            const result = await externalAppService.checkTransactionStatus(transactionId);
            
            // Si la transacción fue exitosa según el servidor
            if (result.status === 'success') {
              setTransactionStatus('success');
              setError(null);
            } 
            // Si detectamos que el usuario cerró la ventana intencionalmente
            else if (userClosedRef.current) {
              setTransactionStatus('cancelled');
              setError('La operación fue cancelada. Por favor, complete el proceso para continuar.');
            } 
            // Si hubo un error en la transacción según el servidor
            else {
              setTransactionStatus('error');
              setError(result.error || 'La operación no se completó correctamente');
            }
          } catch (err) {
            console.error('Error al verificar estado:', err);
            setTransactionStatus('error');
            setError('No se pudo verificar el resultado de la operación');
          }
          
          // Limpiar tracking
          localStorage.removeItem('currentExternalTransaction');
        }
      }, 1000) as unknown as number;
    }
    
    // Limpieza al desmontar
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [isExternalAppOpen, externalWindow, transactionId]);

  // Verificar al cargar si hay una transacción pendiente
  useEffect(() => {
    const checkPendingTransaction = async () => {
      const storedTransactionId = localStorage.getItem('currentExternalTransaction');
      
      if (storedTransactionId) {
        try {
          setLoading(true);
          const result = await externalAppService.checkTransactionStatus(storedTransactionId);
          
          if (result.status === 'success') {
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

  // Función para continuar el flujo después de una operación exitosa
  const handleContinue = () => {
    navigate('/mnherederos/ingresoher/success');
  };

  // Función para reintentar la operación
  const handleRetry = () => {
    setTransactionStatus(null);
    setError(null);
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
              Para cargar los documentos requeridos para el proceso de devolución, 
              haga clic en el botón "Cargar Documentos" a continuación. Se abrirá una 
              ventana externa donde podrá seleccionar y subir los archivos necesarios.
            </p>
            
            {/* Mensajes específicos según el estado */}
            {error && (
              <div className="notification is-danger">
                <p>{error}</p>
              </div>
            )}
            
            {transactionStatus === 'success' && (
              <div className="notification is-success">
                <p>Los documentos se han cargado exitosamente.</p>
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
            
            <div className="documentos-actions">
              {/* Botón para iniciar el proceso externo */}
              <Button 
                variant="primary"
                loading={loading}
                disabled={isExternalAppOpen || loading || transactionStatus === 'success'}
                onClick={openExternalApp}
                className="cargar-documentos-btn"
              >
                {isExternalAppOpen ? 'Procesando en otra ventana...' : 'Cargar Documentos'}
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