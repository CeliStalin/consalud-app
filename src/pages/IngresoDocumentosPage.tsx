// src/pages/IngresoDocumentosPage.tsx
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
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs para los intervalos y timeouts
  const checkIntervalRef = useRef<number | null>(null);
  const safetyTimeoutRef = useRef<number | null>(null);

  // Función para abrir la aplicación externa
  const openExternalApp = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Usamos datos de prueba para el ejemplo
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
      
      // Iniciar verificación periódica si la ventana se abrió correctamente
      if (result.window) {
        startWindowCheck(result.window, result.transactionId);
      } else {
        // Si no tenemos ventana pero tenemos transactionId, aún podemos verificar el estado
        console.warn('La ventana externa es null, pero se registró la transacción');
        // Establecer un timeout para verificar el estado después de un tiempo
        setTimeout(() => {
          handleExternalWindowClosed(result.transactionId, 'unknown');
        }, 30000); // Verificar después de 30 segundos
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

  // Función para iniciar la verificación periódica
  const startWindowCheck = (windowObj: Window | null, txId: string) => {
    // Si la ventana es null, no podemos continuar con la verificación normal
    if (!windowObj) {
      console.error('No se pudo iniciar la verificación: ventana externa es null');
      
      // Aún así, podemos verificar el estado de la transacción después de un tiempo
      setTimeout(() => {
        handleExternalWindowClosed(txId, 'unknown');
      }, 5000); // Verificar después de 5 segundos
      
      return;
    }
    
    // Limpiar intervalos previos si existen
    if (checkIntervalRef.current !== null) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    // Limpiar timeout previo si existe
    if (safetyTimeoutRef.current !== null) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    
    // Intentar establecer una propiedad en la ventana externa para verificar si está disponible
    try {
      // Esta operación puede generar un error si la ventana ya está cerrada
      windowObj.name = `external_window_${txId}`;
    } catch (e) {
      // Si hay un error, probablemente la ventana ya esté cerrada
      console.warn('No se pudo acceder a la ventana externa. Posiblemente ya está cerrada:', e);
      handleExternalWindowClosed(txId, 'closed');
      return;
    }
    
    // Establecer un timeout de seguridad (10 minutos)
    safetyTimeoutRef.current = window.setTimeout(() => {
      handleExternalWindowClosed(txId, 'timeout');
    }, 10 * 60 * 1000);
    
    // Verificar cada segundo si la ventana está cerrada
    checkIntervalRef.current = window.setInterval(() => {
      try {
        // Intentar acceder a una propiedad de la ventana
        // Si la ventana está cerrada, esto generará un error
        if (windowObj.closed) {
          handleExternalWindowClosed(txId, 'closed');
        }
      } catch (e) {
        // Si hay un error al acceder a la propiedad, asumimos que la ventana está cerrada
        console.warn('Error al acceder a la ventana externa:', e);
        handleExternalWindowClosed(txId, 'closed');
      }
    }, 1000);
  };

  // Función para manejar el cierre de la ventana externa
  const handleExternalWindowClosed = async (txId: string, reason: 'closed' | 'timeout' | 'unknown') => {
    // Limpiar intervalos
    if (checkIntervalRef.current !== null) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
    
    // Limpiar timeout
    if (safetyTimeoutRef.current !== null) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    
    // Registrar el motivo del cierre
    let logMessage = '';
    switch (reason) {
      case 'closed':
        logMessage = 'Ventana externa cerrada por el usuario';
        break;
      case 'timeout':
        logMessage = 'Tiempo de espera agotado para la ventana externa';
        break;
      case 'unknown':
        logMessage = 'Estado desconocido para la ventana externa';
        break;
    }
    console.log(logMessage);
    
    // Asegurarse de que la UI refleje que la ventana está cerrada
    setIsExternalAppOpen(false);
    setExternalWindow(null);
    
    // Verificar el estado de la transacción
    try {
      const result = await externalAppService.checkTransactionStatus(txId);
      
      // Actualizar el estado de la transacción
      setTransactionStatus(result.status);
      
      // Limpiar tracking
      localStorage.removeItem('currentExternalTransaction');
      
      // Mostrar mensaje según resultado
      if (result.status === 'success') {
        console.log('La operación se completó con éxito');
      } else {
        setError(result.error || 'La operación no se completó correctamente');
      }
    } catch (err) {
      console.error('Error al verificar estado:', err);
      setError('Error al verificar el resultado de la operación');
      setTransactionStatus('error');
    }
  };

  // Limpiar intervalos y timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current !== null) {
        clearInterval(checkIntervalRef.current);
      }
      
      if (safetyTimeoutRef.current !== null) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);

  // Verificar al cargar si hay una transacción pendiente
  useEffect(() => {
    const storedTransactionId = localStorage.getItem('currentExternalTransaction');
    
    if (storedTransactionId) {
      // Hay una transacción pendiente, verificar su estado
      const checkPendingTransaction = async () => {
        try {
          const result = await externalAppService.checkTransactionStatus(storedTransactionId);
          
          if (result.status !== 'pending') {
            // La transacción ya ha finalizado
            setTransactionStatus(result.status);
            
            if (result.status === 'error') {
              setError(result.error || 'La operación no se completó correctamente');
            }
            
            // Limpiar tracking
            localStorage.removeItem('currentExternalTransaction');
          }
        } catch (error) {
          console.error('Error al verificar transacción pendiente:', error);
          // Limpiar el tracking por si acaso
          localStorage.removeItem('currentExternalTransaction');
        }
      };
      
      checkPendingTransaction();
    }
  }, []);

  // Función para continuar el flujo después de una operación exitosa
  const handleContinue = () => {
    // Redirigir a la siguiente página en tu flujo
    navigate('/mnherederos/ingresoher/success');
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
            
            {/* Mensajes de estado */}
            {error && (
              <div className="notification is-danger">
                <p>{error}</p>
              </div>
            )}
            
            {transactionStatus === 'success' && (
              <div className="notification is-success">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <p><strong>Los documentos se han cargado exitosamente.</strong></p>
                </div>
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
                <div className="notification is-warning mt-3">
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
            </div>
          </div>
        </Card>
      </div>
    </SecureLayout>
  );
};

export default IngresoDocumentosPage;