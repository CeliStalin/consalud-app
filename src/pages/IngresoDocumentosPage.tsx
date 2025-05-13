import React, { useState, useEffect } from 'react';
import { SecureLayout, Card, Button } from '@consalud/core';
import { useNavigate } from 'react-router-dom';
// Ajusta estas rutas según la estructura real de tu proyecto
import { externalAppService } from '../features/documentos/services/ExternalAppService';
// Comentamos temporalmente estas importaciones para evitar dependencias
// import { useTitular } from '../features/herederos/contexts/TitularContext';
// import { useHeredero } from '../features/herederos/contexts/HerederoContext';
import './styles/IngresoDocumentosPage.css';

const IngresoDocumentosPage: React.FC = () => {
  const navigate = useNavigate();
  // Comentamos estas líneas para evitar errores si los contextos no están disponibles
  // const { titular } = useTitular();
  // const { heredero } = useHeredero();
  
  // Estados para manejar la integración con la aplicación externa
  const [isExternalAppOpen, setIsExternalAppOpen] = useState(false);
  const [externalWindow, setExternalWindow] = useState<Window | null>(null);
  const [transactionId, setTransactionId] = useState<string>('');
  const [transactionStatus, setTransactionStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para abrir la aplicación externa
  const openExternalApp = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Quitamos la validación temporalmente
      /* 
      if (!titular || !heredero) {
        throw new Error('No se encontraron los datos del titular o heredero');
      }
      */
      
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
    let intervalId: number | undefined;
    
    const checkWindowStatus = async () => {
      // Verificar si la ventana fue cerrada
      if (externalWindow && externalWindow.closed) {
        console.log('La ventana externa fue cerrada');
        
        // Verificar el estado de la transacción mediante el servicio
        try {
          const result = await externalAppService.checkTransactionStatus(transactionId);
          
          setTransactionStatus(result.status);
          setIsExternalAppOpen(false);
          
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
        
        // Limpiar el intervalo
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    };
    
    if (isExternalAppOpen && externalWindow) {
      // Verificar cada 1 segundo
      intervalId = window.setInterval(checkWindowStatus, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isExternalAppOpen, externalWindow, transactionId]);

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
                <p>Los documentos se han cargado exitosamente.</p>
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
