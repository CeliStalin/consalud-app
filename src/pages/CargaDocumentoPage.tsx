import { CargaDocumento } from '@/features/herederos/components/CargaDocumento';
import { Stepper, StepperProvider, useStepper } from '@/features/herederos/components/Stepper';
import * as ConsaludCore from '@consalud/core';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CargaDocumentoPageContent: React.FC = () => {
  const navigate = useNavigate();
  const { step } = useStepper();

  const breadcrumbItems = [
    { label: 'Administración devolución herederos' }
  ];
  const cleanedBreadcrumbItems = breadcrumbItems.map(item => ({
    ...item,
    label: typeof item.label === 'string' ? item.label.replace(/^\/+/,'') : item.label
  }));

  return (
    <div className="carga-documentos-page-container" style={{
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Header Section: Breadcrumb y botón volver */}
      <div className="carga-documentos-header" style={{
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
              onClick={() => navigate('/mnherederos/ingresoher/RegistroTitular')}
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
              Carga de documentos
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
            <CargaDocumento />
          </div>
        </div>
      </div>

      {/* Espacio adicional para asegurar scroll */}
      <div style={{ height: '8rem' }}></div>
    </div>
  );
};

const CargaDocumentoPage: React.FC = () => {
  return (
    <StepperProvider>
      <div className="route-container layout-stable instant-stable navigation-stable no-flash" style={{
        overflowY: 'auto',
        backgroundColor: '#F8F9FA',
        padding: '0',
        height: '100vh'
      }}>
        <div style={{ minHeight: '120vh', paddingBottom: '4rem' }}>
          <CargaDocumentoPageContent />
        </div>
      </div>
    </StepperProvider>
  );
};

export default CargaDocumentoPage;
