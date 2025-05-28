import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';
import './styles/IngresoHerederosPage.css';

const IngresoHerederosPage: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigateToForm = () => {
    navigate('/mnherederos/ingresoher/ingresotitular');
  };
  
  return (
    <ConsaludCore.SecureLayout pageTitle="Ingreso Herederos" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <div className="app-content-main">
        <div className="app-container">
          <div className="ingreso-herederos-wrapper">
            <ConsaludCore.Card 
              title="Ingreso de Herederos" 
              subtitle="Gestión de beneficiarios"
              variant="elevated"
              padding="large"
              className="ingreso-card"
            >
              <div className="card-content">
                
                <div className="card-info-box app-card" style={{ 
                  padding: '16px',
                  backgroundColor: ConsaludCore.theme?.colors?.gray?.light || '#f8f9fa',
                  border: `1px solid ${ConsaludCore.theme?.colors?.gray?.medium || '#e0e0e0'}`,
                  borderRadius: '8px',
                  margin: '16px 0'
                }}>
                  <div className="info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                  </div>
                  <p className="info-text">
                    Para ingresar un nuevo heredero, haz clic en el botón "Nuevo Ingreso" y completa el formulario con los datos solicitados.
                  </p>
                </div>
                
                <div className="button-container" style={{ textAlign: 'center', marginTop: '32px' }}>
                  <ConsaludCore.Button 
                    variant="primary" 
                    onClick={handleNavigateToForm}
                    className="nuevo-ingreso-btn"
                  >
                    <span className="btn-icon">+</span>
                    Nuevo Ingreso
                  </ConsaludCore.Button>
                </div>
              </div>
            </ConsaludCore.Card>
          </div>
        </div>
      </div>
    </ConsaludCore.SecureLayout>
  );
};

export default IngresoHerederosPage;