import React from 'react';
import * as ConsaludCore from '@consalud/core'; // Cambiado para usar el alias
import { DatosTitular } from '@/features/herederos/components/DatosTitular';


const DatosTitularPage: React.FC = () => { // Considera renombrar a DatosTitularPage si es más preciso
  return (
    <ConsaludCore.SecureLayout pageTitle="Datos Titular" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <DatosTitular />
    </ConsaludCore.SecureLayout>
  );
};

export default DatosTitularPage; // Cambiado a export default