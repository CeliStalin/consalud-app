import React from 'react';
import { CargaDocumento } from '@/features/herederos/components/CargaDocumento'
import { StepperProvider } from '@/features/herederos/components/Stepper';

const CargaDocumentoPage: React.FC = () => {
  return (
    <StepperProvider>
      <div className="route-container layout-stable" style={{ overflowY: 'auto', height: '100vh', paddingBottom: 40 }}>
        <CargaDocumento />
      </div>
    </StepperProvider>
  );
};

export default CargaDocumentoPage; // Asegurar export default si se usa con React.lazy