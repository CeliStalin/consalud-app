import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SecureLayout, Card, Button } from '@consalud/core';

const IngresoHerederosPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleNavigateToForm = () => {
    navigate('/mnherederos/ingresoher/formingreso');
  };
  
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
            <p>Bienvenido al módulo de ingreso de herederos. Desde aquí podrás registrar nuevos herederos en el sistema.</p>
            
            <div className="mt-5">
              <Button 
                variant="primary" 
                onClick={handleNavigateToForm}
                className="has-text-weight-bold"
              >
                Nuevo Ingreso
              </Button>
              
              <div className="mt-4">
                <p className="has-text-grey is-size-7">
                  Haz clic en "Nuevo Ingreso" para registrar un nuevo heredero.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </SecureLayout>
  );
};

export default IngresoHerederosPage;