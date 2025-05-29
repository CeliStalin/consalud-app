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
                  <ConsaludCore.Typography variant="body" style={{ marginBottom: '12px' }}>
                    Bienvenido al sistema de gestión de herederos
                  </ConsaludCore.Typography>
                  <ConsaludCore.Typography variant="bodySmall" color="secondary">
                    Aquí podrás registrar y gestionar la información de los beneficiarios para la devolución de fondos.
                  </ConsaludCore.Typography>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <ConsaludCore.Button 
                    variant="primary"
                    onClick={handleNavigateToForm}
                    size="large"
                  >
                    Comenzar proceso
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