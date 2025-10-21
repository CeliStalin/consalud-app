import CheckRequisitosIcon from '@/assets/check-requisitos.svg';
import { Stepper, StepperProvider } from '@/features/herederos/components/Stepper';
import * as ConsaludCore from '@consalud/core';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/SuccessPage.css';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);
  return (
    <StepperProvider>
      <div className="success-page-container">
        <div className="success-page-title">
          <ConsaludCore.Typography
            variant="h4"
            component="h1"
            style={{
              fontWeight: 700,
              textAlign: 'center',
              color: '#333333',
              fontSize: '2rem',
              marginBottom: '1rem',
            }}
          >
            ¡Listo!
          </ConsaludCore.Typography>
        </div>

        <div className="success-page-stepper">
          <Stepper step={4} />
        </div>

        <div className="success-card">
          <div className="success-icon">
            <img src={CheckRequisitosIcon} alt="Solicitud completada" width="40" height="40" />
          </div>

          <h1 className="success-title">La solicitud de devolución se ingresó correctamente</h1>

          <p className="success-message">
            La persona heredera recibirá a través de su correo electrónico registrado una
            notificación de ingreso de la solicitud.
          </p>

          <button
            className="success-button"
            onClick={handleBackToHome}
            aria-label="Volver a la página de inicio"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </StepperProvider>
  );
};

export default SuccessPage;
