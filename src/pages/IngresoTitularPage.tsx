import React from 'react';
import * as ConsaludCore from '@consalud/core';
import { IngresoTitular } from '@/features/herederos/components/IngresoTitular'; 

const IngresoTitularPage: React.FC = () => {
  return (
    <ConsaludCore.SecureLayout 
      pageTitle="Ingreso RUT Titular" 
      allowedRoles={['USER', 'ADMIN', 'Developers']}
    >
      <div className="app-content-main">
        <div className="app-container">
          {/* Aquí se renderiza el componente IngresoTitular */}
          <IngresoTitular />
        </div>
      </div>
    </ConsaludCore.SecureLayout>
  );
};

export default IngresoTitularPage;