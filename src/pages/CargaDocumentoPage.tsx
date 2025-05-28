import React from 'react';
import * as ConsaludCore from '@consalud/core'; // Cambiado para usar el alias
import { CargaDocumento } from '@/features/herederos/components/CargaDocumento'


const CargaDocumentoPage: React.FC = () => {
  return (
    <ConsaludCore.SecureLayout pageTitle="Carga Documentos" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <CargaDocumento />
    </ConsaludCore.SecureLayout>
  );
};

export default CargaDocumentoPage; // Asegurar export default si se usa con React.lazy