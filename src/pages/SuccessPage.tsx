import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecureLayout } from '@consalud/core';
import './styles/SuccessPage.css';
import { Stepper } from '@/features/herederos/components/Stepper';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleRedirect = useCallback(() => {
    navigate('/mnherederos/ingresoher');
  }, [navigate]);
  
  // Redirección automática después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(handleRedirect, 5000);
    return () => clearTimeout(timer);
  }, [handleRedirect]);
  
  return (
    <SecureLayout pageTitle="Operación Exitosa" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <div className="app-content-main">
        <div className="app-container">
          <div className="textoTituloComponentes" style={{ margin: '24px' }}>
            <span className="titleComponent">¡Listo!</span>
          </div>
          <Stepper step={4} />
          
          <div className="app-card" style={{ textAlign: 'center', marginTop: '32px' }}>
            <h2 style={{ color: '#04A59B', marginBottom: '16px' }}>
              Proceso completado exitosamente
            </h2>
            <p style={{ marginBottom: '24px' }}>
              Serás redirigido automáticamente en 5 segundos...
            </p>
            <button 
              className="button is-primary"
              onClick={handleRedirect}
              style={{ backgroundColor: '#04A59B' }}
            >
              Ir al inicio ahora
            </button>
          </div>
        </div>
      </div>
    </SecureLayout>
  );
};

export default SuccessPage;