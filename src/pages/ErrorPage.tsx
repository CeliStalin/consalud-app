import WarningIcon from '@/assets/Warning.svg';
import { Stepper, StepperProvider } from '@/features/herederos/components/Stepper';
import * as ConsaludCore from '@consalud/core';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/ErrorPage.css';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return (
    <StepperProvider>
      <div className="error-page-container">
        {/* Título "Error en el envío" */}
        <div className="error-page-title">
          <ConsaludCore.Typography
            variant="h4"
            component="h1"
            style={{
              fontWeight: 700,
              textAlign: 'center',
              color: '#333333',
              fontSize: '2rem',
              marginBottom: '1rem'
            }}
          >
            Error en el envío
          </ConsaludCore.Typography>
        </div>

        {/* Stepper con todos los pasos completados - mismo tamaño que otras páginas */}
        <div className="error-page-stepper">
          <Stepper step={4} />
        </div>

        {/* Tarjeta de error */}
        <div className="error-card">
          {/* Icono de error */}
          <div className="error-icon">
            <img
              src={WarningIcon}
              alt="Error en el envío"
              width="48"
              height="48"
            />
          </div>

          {/* Título principal */}
          <h1 className="error-title">
            Ocurrió un error en el envío de tu solicitud
          </h1>

          {/* Mensaje descriptivo */}
          <p className="error-message">
            Por favor, inténtalo nuevamente.
          </p>

          {/* Botón de acción */}
          <button
            className="error-button"
            onClick={handleBackToHome}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </StepperProvider>
  );
};

export default ErrorPage;
