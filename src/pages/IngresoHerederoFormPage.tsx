import React from 'react';
import { SecureLayout } from '@consalud/core';
import FormIngresoHeredero from '../features/herederos/components/FormIngresoHeredero';


const IngresoHerederoFormPage: React.FC = () => {
  return (
    <SecureLayout pageTitle="Ingreso Herederos" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <FormIngresoHeredero />
    </SecureLayout>
  );
};

export default IngresoHerederoFormPage;