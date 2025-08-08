import React from 'react';
import { CargaDocumento } from '@/features/herederos/components/CargaDocumento'
import { StepperProvider, useStepper, Stepper } from '@/features/herederos/components/Stepper';
import * as ConsaludCore from '@consalud/core';
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
    <>
      {/* Header Section: Breadcrumb y botón volver */}
      <div style={{ width: '100%', marginBottom: 24 }}>
        <div style={{ marginLeft: 48 }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 8 }}>
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
              onClick={() => navigate(-1)}
              aria-label="Volver a la página anterior"
            >
              <span className="back-button-icon">←</span> Volver
            </button>
          </div>
          
          {/* Título arriba del stepper */}
          <div className="mb-1" style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <ConsaludCore.Typography
              variant="h5"
              component="h1"
              style={{ 
                fontWeight: 700, 
                textAlign: 'center', 
                color: '#222', 
                fontSize: '2rem',
                marginBottom: '24px'
              }}
            >
              Carga de documentos
            </ConsaludCore.Typography>
          </div>
          
          {/* Stepper debajo del título */}
          <div className="mb-5" style={{ marginBottom: '40px' }}>
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
    </>
  );
};

const CargaDocumentoPage: React.FC = () => {
  return (
    <StepperProvider>
      <div className="route-container layout-stable" style={{ 
        overflowY: 'auto', 
        height: '100vh', 
        paddingBottom: 40,
        backgroundColor: '#F8F9FA'
      }}>
        <CargaDocumentoPageContent />
      </div>
    </StepperProvider>
  );
};

export default CargaDocumentoPage;