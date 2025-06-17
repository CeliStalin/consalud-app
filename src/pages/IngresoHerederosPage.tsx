import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';
import { useHerederoNavigation } from '../features/herederos/hooks/useHerederoNavigation';
import './styles/IngresoHerederosPage.css';

const IngresoHerederosPage: React.FC = () => {
  const navigate = useNavigate();
  const { startProcess } = useHerederoNavigation();

  useEffect(() => {
    // Redirigir automáticamente al IngresoTitularPage
    navigate('/mnherederos/ingresoher/ingresotitular', { replace: true });
  }, [navigate]);

  // Renderiza un loader o nada, ya que la redirección es instantánea
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
                <div className="card-info-box app-card ingreso-info-box animate-fade-in-up">
                  <ConsaludCore.Typography variant="body" style={{ marginBottom: '12px' }}>
                    Bienvenido al sistema de gestión de herederos
                  </ConsaludCore.Typography>
                  <ConsaludCore.Typography variant="bodySmall" color="secondary">
                    Aquí podrás registrar y gestionar la información de los beneficiarios para la devolución de fondos.
                  </ConsaludCore.Typography>
                </div>
                <div className="button-action-container">
                  <ConsaludCore.Button 
                    variant="primary"
                    size="large"
                    className="proceso-button"
                    disabled
                  >
                    Redirigiendo...
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