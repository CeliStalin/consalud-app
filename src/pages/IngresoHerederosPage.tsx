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
                
                <div className="card-info-box app-card" style={{ 
                  padding: '16px',
                  backgroundColor: ConsaludCore.theme?.colors?.gray?.light || '#f8f9fa',
                  border: `1px solid ${ConsaludCore.theme?.colors?.gray?.medium || '#e0e0e0'}`,
                  borderRadius: '8px',
                  margin: '16px 0',
                  // Animación de entrada suave
                  animation: 'fadeInUp 0.6s ease-out'
                }}>
                  <ConsaludCore.Typography variant="body" style={{ marginBottom: '12px' }}>
                    Bienvenido al sistema de gestión de herederos
                  </ConsaludCore.Typography>
                  <ConsaludCore.Typography variant="bodySmall" color="secondary">
                    Aquí podrás registrar y gestionar la información de los beneficiarios para la devolución de fondos.
                  </ConsaludCore.Typography>
                </div>
                
                <div style={{ 
                  textAlign: 'center', 
                  marginTop: '24px',
                  // Animación de entrada con delay
                  animation: 'fadeInUp 0.6s ease-out 0.2s both'
                }}>
                  <ConsaludCore.Button 
                    variant="primary"
                    onClick={handleNavigateToForm}
                    size="large"
                    style={{
                      // Transición mejorada para el botón
                      transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      // Efecto hover mejorado
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(4, 165, 155, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '';
                    }}
                  >
                    Comenzar proceso
                  </ConsaludCore.Button>
                </div>
              </div>
            </ConsaludCore.Card>
          </div>
        </div>
      </div>
      
      {/* Estilos CSS inline para las animaciones específicas de esta página */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .ingreso-card {
          animation: fadeInScale 0.5s ease-out;
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Efecto ripple para el botón */
        .button-ripple {
          position: relative;
          overflow: hidden;
        }
        
        .button-ripple::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transition: width 0.6s, height 0.6s;
          transform: translate(-50%, -50%);
        }
        
        .button-ripple:active::before {
          width: 300px;
          height: 300px;
        }
      `}</style>
    </ConsaludCore.SecureLayout>
  );
};

export default IngresoHerederosPage;