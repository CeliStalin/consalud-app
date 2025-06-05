import React from 'react';
import * as ConsaludCore from '@consalud/core'; // Cambiado para usar el alias
import { RequisitosTitular } from '@/features/herederos/components/RequisitosTitular';


const InfoRequisitosTitularPage: React.FC = () => {
  return (
    <ConsaludCore.SecureLayout pageTitle="Requisitos del Titular" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <RequisitosTitular />
    </ConsaludCore.SecureLayout>
  );
};

export default InfoRequisitosTitularPage;