import React from 'react';
import * as ConsaludCore from '@consalud/core'; 
import { DatosTitular } from '@/features/herederos/components/DatosTitular';


const DatosTitularPage: React.FC = () => { 
  return (
    <ConsaludCore.SecureLayout pageTitle="Datos Titular" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <DatosTitular />
    </ConsaludCore.SecureLayout>
  );
};

export default DatosTitularPage; 