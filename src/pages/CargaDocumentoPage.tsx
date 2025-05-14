import React from 'react';
import { SecureLayout } from '@consalud/core';
import { CargaDocumento } from '@/features/herederos/components/CargaDocumento'


const CargaDocumentoPage: React.FC = () => {
  return (
    <SecureLayout pageTitle="Carga Documentos" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <CargaDocumento />
    </SecureLayout>
  );
};

export { 
  CargaDocumentoPage
};