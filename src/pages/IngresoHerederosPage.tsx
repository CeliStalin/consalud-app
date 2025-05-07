import React from 'react';
import { SecureLayout, Card } from '@consalud/core';

const IngresoHerederosPage: React.FC = () => {
  return (
    <SecureLayout pageTitle="Ingreso Herederos" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <div className="content-container" style={{ minHeight: '400px' }}>
        <Card 
          title="Ingreso de Herederos" 
          subtitle="Gestión de beneficiarios"
          variant="elevated"
          padding="large"
        >
          <div style={{ marginBottom: '20px' }}>
            <p>Aquí va el contenido del formulario de ingreso de herederos.</p>
            {/* Aquí se añade  formulario de ingreso de herederos */}
          </div>
        </Card>
      </div>
    </SecureLayout>
  );
};

export default IngresoHerederosPage;