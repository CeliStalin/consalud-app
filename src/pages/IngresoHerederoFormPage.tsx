import React from 'react';
import * as ConsaludCore from '@consalud/core'; // Cambiado para usar el alias
import FormIngresoHeredero from '../features/herederos/components/FormIngresoHeredero';


const IngresoHerederoFormPage: React.FC = () => {
  return (
    <ConsaludCore.SecureLayout pageTitle="Ingreso Herederos" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <FormIngresoHeredero />
    </ConsaludCore.SecureLayout>
  );
};

export default IngresoHerederoFormPage;