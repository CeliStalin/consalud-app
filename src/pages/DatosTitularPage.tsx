import React from 'react';
import { SecureLayout } from '@consalud/core';
import { DatosTitular } from '@/features/herederos/components/DatosTitular';


const DatosTitullarPage: React.FC = () => {
  return (
    <SecureLayout pageTitle="Datos Titular" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <DatosTitular />
    </SecureLayout>
  );
};

export { 
    DatosTitullarPage
};