import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecureLayout } from '@consalud/core';
import './styles/SuccessPage.css';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Redirección automática después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/mnherederos/ingresoher');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  const handleRedirect = () => {
    navigate('/mnherederos/ingresoher');
  };
  
  return (
    <SecureLayout pageTitle="Operación Exitosa" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <div className="success-container">
        <div className="success-card">
          <div className="success-icon">
            <div className="icon-circle">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#04A59B">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </div>
          </div>
          
          <h2 className="success-title">¡Registro completado exitosamente!</h2>
          <p className="success-message">
            Los datos del heredero se han guardado correctamente en el sistema.
          </p>
          
          <button 
            className="success-button"
            onClick={handleRedirect}
          >
            Volver a Ingreso de Herederos
          </button>
          
          <p className="redirect-text">
            Serás redirigido automáticamente en unos segundos...
          </p>
        </div>
      </div>
    </SecureLayout>
  );
};

export default SuccessPage;