import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SecureLayout, Card, Button } from '@consalud/core';
import './styles/IngresoHerederosPage.css';

const IngresoHerederosPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleNavigateToForm = () => {
    navigate('/mnherederos/ingresoher/formingreso');
  };
  
  return (
    <SecureLayout pageTitle="Ingreso Herederos" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <div className="content-container" style={{ minHeight: '400px', padding: '24px' }}>
        <div className="ingreso-herederos-wrapper">
          <Card 
            title="Ingreso de Herederos" 
            subtitle="Gestión de beneficiarios"
            variant="elevated"
            padding="large"
            className="ingreso-card"
          >
            <div className="card-content">
              <p className="card-description">
                Bienvenido al módulo de ingreso de herederos. Desde aquí podrás registrar nuevos herederos en el sistema y gestionar su documentación.
              </p>
              
              <div className="card-info-box">
                <div className="info-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                  </svg>
                </div>
                <p className="info-text">
                  Para ingresar un nuevo heredero, haz clic en el botón "Nuevo Ingreso" y completa el formulario con los datos solicitados.
                </p>
              </div>
              
              <div className="button-container">
                <Button 
                  variant="primary" 
                  onClick={handleNavigateToForm}
                  className="nuevo-ingreso-btn"
                >
                  <span className="btn-icon">+</span>
                  Nuevo Ingreso
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SecureLayout>
  );
};

export default IngresoHerederosPage;