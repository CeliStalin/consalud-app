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
        {/* Título "¡Listo!" */}
        <div className="success-page-title">
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
            ¡Listo!
          </ConsaludCore.Typography>
        </div>

        {/* Stepper con todos los pasos completados - mismo tamaño que otras páginas */}
        <div className="success-page-stepper">
          <Stepper step={4} />
        </div>

        {/* Tarjeta de éxito */}
        <div className="success-card">
          {/* Icono de éxito */}
          <div className="success-icon">
            <img
              src={CheckRequisitosIcon}
              alt="Solicitud completada"
              width="40"
              height="40"
            />
          </div>

          {/* Título principal */}
          <h1 className="success-title">
            La solicitud de devolución se ingresó correctamente
          </h1>

          {/* Mensaje descriptivo */}
          <p className="success-message">
            La persona heredera recibirá a través de su correo electronico registrado una notificacion de ingreso de la solicitud
          </p>

          {/* Botón de acción */}
          <button
            className="success-button"
            onClick={handleBackToHome}
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </StepperProvider>
  );
};

export default SuccessPage;
