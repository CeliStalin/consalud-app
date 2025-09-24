import * as ConsaludCore from '@consalud/core';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CargaMandatosCard } from '../features/herederos/components/CargaMandatosCard';
import { Stepper, StepperProvider, useStepper } from '../features/herederos/components/Stepper';

const MandatosPageContent: React.FC = () => {
  const navigate = useNavigate();
  const { step } = useStepper();

  const handleSave = () => {
    // Navegar a la página de éxito
    navigate('/mnherederos/ingresoher/success');
  };

  const handleBack = () => {
    // Navegar de vuelta a la página de carga de documentos
    navigate('/mnherederos/ingresoher/cargadoc');
  };

  const breadcrumbItems = [
    { label: 'Administración devolución herederos' }
  ];
  const cleanedBreadcrumbItems = breadcrumbItems.map(item => ({
    ...item,
    label: typeof item.label === 'string' ? item.label.replace(/^\/+/,'') : item.label
  }));

  return (
    <div className="mandatos-page-container" style={{
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Header Section: Breadcrumb y botón volver */}
      <div className="mandatos-header" style={{
        width: '100%',
        marginBottom: '1.5rem'
      }}>
        <div style={{ marginLeft: '3rem' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '0.5rem' }}>
            <ConsaludCore.Breadcrumb
              items={cleanedBreadcrumbItems}
              separator={<span>{'>'}</span>}
              showHome={true}
              className="breadcrumb-custom"
            />
          </div>
          {/* Botón volver */}
          <div>
            <button
              className="back-button"
              onClick={handleBack}
              aria-label="Volver a la página anterior"
            >
              <span className="back-button-icon">←</span> Volver
            </button>
          </div>

          {/* Título arriba del stepper */}
          <div className="mb-1" style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <ConsaludCore.Typography
              variant="h5"
              component="h1"
              style={{
                fontWeight: 700,
                textAlign: 'center',
                color: '#222',
                fontSize: '2rem',
                marginBottom: '1.5rem'
              }}
            >
              Mandatos
            </ConsaludCore.Typography>
          </div>

          {/* Stepper debajo del título */}
          <div className="mb-5" style={{ marginBottom: '2.5rem' }}>
            <Stepper step={step} />
          </div>
        </div>
      </div>

      {/* Card principal */}
      <div className="card-center-container">
        <div className="card-responsive">
          <div className="generalContainer">
            <CargaMandatosCard onSave={handleSave} />
          </div>
        </div>
      </div>

      {/* Espacio adicional para asegurar scroll */}
      <div style={{ height: '8rem' }}></div>
    </div>
  );
};

const MandatosPage: React.FC = () => {
  return (
    <StepperProvider>
      <div className="route-container layout-stable instant-stable navigation-stable no-flash" style={{
        overflowY: 'auto',
        backgroundColor: '#F8F9FA',
        padding: '0',
        height: '100vh'
      }}>
        <div style={{ minHeight: '120vh', paddingBottom: '4rem' }}>
          <MandatosPageContent />
        </div>
      </div>
    </StepperProvider>
  );
};

export default MandatosPage;
