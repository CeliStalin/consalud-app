// src/features/documentos/components/IngresoDocumentosPage.tsx
import React from 'react';
import { SecureLayout, Card } from '@consalud/core';

const IngresoDocumentosPage: React.FC = () => {
  return (
    <SecureLayout pageTitle="Ingreso Documentos" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <div className="content-container" style={{ minHeight: '400px' }}>
        <Card 
          title="Ingreso de Documentos" 
          subtitle="Gestión de documentación"
          variant="elevated"
          padding="large"
        >
          <div style={{ marginBottom: '20px' }}>
            <p>Aquí va el contenido del formulario de ingreso de documentos.</p>
            {/* Aquí puedes añadir tu formulario de ingreso de documentos */}
          </div>
        </Card>
      </div>
    </SecureLayout>
  );
};

export default IngresoDocumentosPage;