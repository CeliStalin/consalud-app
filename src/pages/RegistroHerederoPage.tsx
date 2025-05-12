import React from 'react';
import { SecureLayout } from '@consalud/core';
import { RegistroHeredero } from '@/features/herederos/components/RegistroHeredero';


const RegistroTitularPage: React.FC = () => {
  return (
    <SecureLayout pageTitle="Ingreso Herederos" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <RegistroHeredero />
    </SecureLayout>
  );
};

export { 
    RegistroTitularPage
};