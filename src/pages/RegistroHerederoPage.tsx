import React from 'react';
import * as ConsaludCore from '@consalud/core';
import { RegistroHeredero } from '@/features/herederos/components/RegistroHeredero';

const RegistroHerederoPage: React.FC = () => {
  return (
    <ConsaludCore.SecureLayout 
      pageTitle="Registro Heredero" 
      allowedRoles={['USER', 'ADMIN', 'Developers']}
    >
      <RegistroHeredero />
    </ConsaludCore.SecureLayout>
  );
};

export default RegistroHerederoPage;