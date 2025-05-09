import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecureLayout } from '@consalud/core';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Redirección automática después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/mnherederos/ingresoher');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  const successStyles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px 0',
    },
    card: {
      width: '600px',
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.08)',
      padding: '32px',
      textAlign: 'center' as const,
    },
    icon: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '24px',
    },
    iconCircle: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundColor: 'rgba(4, 165, 155, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: '24px',
      fontWeight: 600,
      color: '#333333',
      marginBottom: '16px',
    },
    message: {
      fontSize: '16px',
      color: '#656565',
      marginBottom: '32px',
    },
    button: {
      backgroundColor: '#04A59B',
      color: 'white',
      border: 'none',
      borderRadius: '20px',
      padding: '10px 24px',
      fontSize: '16px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    autoRedirect: {
      fontSize: '14px',
      color: '#999999',
      marginTop: '16px',
    }
  };
  
  return (
    <SecureLayout pageTitle="Operación Exitosa" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <div style={successStyles.container}>
        <div style={successStyles.card}>
          <div style={successStyles.icon}>
            <div style={successStyles.iconCircle}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#04A59B">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
          </div>
          
          <h2 style={successStyles.title}>¡Registro completado exitosamente!</h2>
          <p style={successStyles.message}>
            Los datos del heredero se han guardado correctamente en el sistema.
          </p>
          
          <button 
            style={successStyles.button}
            onClick={() => navigate('/mnherederos/ingresoher')}
          >
            Volver a Ingreso de Herederos
          </button>
          
          <p style={successStyles.autoRedirect}>
            Serás redirigido automáticamente en unos segundos...
          </p>
        </div>
      </div>
    </SecureLayout>
  );
};

export default SuccessPage;