import React from 'react';
import { SecureLayout } from '@consalud/core';
import { RequisitosTitular } from '@/features/herederos/components/RequisitosTitular';


const InfoRequisitosTitularPage: React.FC = () => {
  return (
    <SecureLayout pageTitle="Ingreso Herederos" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <RequisitosTitular />
    </SecureLayout>
  );
};

export { 
    InfoRequisitosTitularPage
};