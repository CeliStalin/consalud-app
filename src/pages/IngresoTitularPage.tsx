import React from 'react';
import * as ConsaludCore from '@consalud/core';
import { IngresoTitular } from '@/features/herederos/components/IngresoTitular';

const IngresoTitularPage: React.FC = () => {
  return (
    <ConsaludCore.SecureLayout pageTitle="Ingreso Titular" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <IngresoTitular />
    </ConsaludCore.SecureLayout>
  );
};

export default IngresoTitularPage;