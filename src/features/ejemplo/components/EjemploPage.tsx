// src/features/ejemplo/components/EjemploPage.tsx
import React, { useState } from 'react';
import { SecureLayout, Card, Button } from '@consalud/core';

const EjemploPage: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <SecureLayout pageTitle="Aplicación de Ejemplo" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <div className="content-container" style={{ minHeight: '400px' }}>
        <Card 
          title="Aplicación de Ejemplo" 
          subtitle="Demostración de integración con el core"
          variant="elevated"
          padding="large"
        >
          <div style={{ marginBottom: '20px' }}>
            <p>Esta es una aplicación de ejemplo que utiliza los componentes del core.</p>
            <p>Contador: <strong>{count}</strong></p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button onClick={() => setCount(count + 1)}>
              Incrementar
            </Button>
            <Button variant="secondary" onClick={() => setCount(count - 1)}>
              Decrementar
            </Button>
            <Button variant="danger" onClick={() => setCount(0)}>
              Reiniciar
            </Button>
          </div>
        </Card>
      </div>
    </SecureLayout>
  );
};

export default EjemploPage;