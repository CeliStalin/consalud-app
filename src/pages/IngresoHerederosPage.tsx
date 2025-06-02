import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';
import { useHerederoNavigation } from '../features/herederos/hooks/useHerederoNavigation';
import './styles/IngresoHerederosPage.css';

const IngresoHerederosPage: React.FC = () => {
  const navigate = useNavigate();
  const { startProcess, configureTransition } = useHerederoNavigation();

  // Configurar transición específica para esta página usando el core
  React.useEffect(() => {
    configureTransition({
      preset: 'fadeIn',
      duration: 250,
      easing: 'ease-in-out'
    });
  }, [configureTransition]);

  // Actualizada para dirigir al flujo principal con transición suave del core
  const handleNavigateToForm = () => {
    // Usar el hook mejorado de navegación que utiliza ConsaludCore.PageTransition
    startProcess({
      transitionConfig: {
        preset: 'slideLeft',
        duration: 350,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }
    });
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
                
                <div className="card-info-box app-card ingreso-info-box">
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
                    onClick={handleNavigateToForm}
                    size="large"
                    className="proceso-button"
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