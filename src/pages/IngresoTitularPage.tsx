import React from 'react';
import { SecureLayout } from '@consalud/core';
import { IngresoTitular } from '@/features/herederos/components/IngresoTitular';


const IngresoTitularPage: React.FC = () => {
  return (
    <SecureLayout pageTitle="Ingreso Herederos" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <IngresoTitular />
    </SecureLayout>
  );
};

export { 
    IngresoTitularPage
};