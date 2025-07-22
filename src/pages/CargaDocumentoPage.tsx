import React from 'react';
import { CargaDocumento } from '@/features/herederos/components/CargaDocumento'

const CargaDocumentoPage: React.FC = () => {
  return (
    <div className="route-container layout-stable" style={{ overflowY: 'auto', height: '100vh', paddingBottom: 40 }}>
      <CargaDocumento />
    </div>
  );
};

export default CargaDocumentoPage; // Asegurar export default si se usa con React.lazy