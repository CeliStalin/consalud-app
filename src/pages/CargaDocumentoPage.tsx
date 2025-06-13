import React from 'react';
import * as ConsaludCore from '@consalud/core'; // Cambiado para usar el alias
import { CargaDocumento } from '@/features/herederos/components/CargaDocumento'


const CargaDocumentoPage: React.FC = () => {
  return (
    <CargaDocumento />
  );
};

export default CargaDocumentoPage; // Asegurar export default si se usa con React.lazy