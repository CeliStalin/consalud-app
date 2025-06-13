import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';
import './styles/SuccessPage.css';
import { Stepper } from '@/features/herederos/components/Stepper';

const REDIRECT_PATH = '/mnherederos/ingresoher';
const REDIRECT_TIMEOUT_MS = 5000;

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { Typography, theme } = ConsaludCore;
  
  const handleRedirect = useCallback(() => {
    navigate(REDIRECT_PATH);
  }, [navigate]);
  
  // Redirección automática después de 5 segundos
  useEffect(() => {
    const timer = setTimeout(handleRedirect, REDIRECT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [handleRedirect]);
  
  return (
    <div className="app-container">
      <div className="textoTituloComponentes" style={{ margin: '24px' }}>
        <Typography 
          variant="h4" 
          component="span" 
          style={{ 
            color: theme?.colors?.primary || "#505050" 
          }}
          weight="bold" 
          className="titleComponent"
        >
          ¡Listo!
        </Typography>
      </div>
      <Stepper step={4} />
      <div className="app-card" style={{ textAlign: 'center', marginTop: '32px' }}>
        <h2 style={{ color: '#04A59B', marginBottom: '16px' }}>
          Proceso completado exitosamente
        </h2>
        <p style={{ marginBottom: '24px' }}>
          Serás redirigido automáticamente en {REDIRECT_TIMEOUT_MS / 1000} segundos...
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
  );
};

export default SuccessPage;