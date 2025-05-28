import React from 'react';
import * as ConsaludCore from '@consalud/core';
import { RegistroHeredero } from '@/features/herederos/components/RegistroHeredero';

const RegistroHerederoPage: React.FC = () => {
  return (
    <ConsaludCore.SecureLayout 
      pageTitle="Registro de Heredero" 
      allowedRoles={['USER', 'ADMIN', 'Developers']}
    >
      <div className="app-content-main">
        <div className="app-container">
          <RegistroHeredero />
        </div>
      </div>
    </ConsaludCore.SecureLayout>
  );
};

export default RegistroHerederoPage;