import React from 'react';
import * as ConsaludCore from '@consalud/core';
import { IngresoTitular } from '@/features/herederos/components/IngresoTitular';
import { useNavigate } from 'react-router-dom';

const IngresoTitularPage: React.FC = () => {
  const navigate = useNavigate();

  // Breadcrumb items - sin incluir "Inicio" ya que el core lo agrega automáticamente
  const breadcrumbItems = [
    { label: 'Administración devolución herederos' }
  ];

  // Limpieza defensiva: eliminar cualquier slash inicial en los labels
  const cleanedBreadcrumbItems = breadcrumbItems.map(item => ({
    ...item,
    label: typeof item.label === 'string' ? item.label.replace(/^\/+/, '') : item.label
  }));

  // Log para depuración
  console.log('Breadcrumb items:', cleanedBreadcrumbItems);

  return (
    <div style={{ minHeight: '100vh', background: '#fafbfc' }}>
      {/* Container principal con padding lateral para alinearse con el menú */}
      <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 20 }}>
        {/* Breadcrumb y botón volver reorganizados */}
        <div style={{ maxWidth: 1200, marginBottom: 24 }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 8 }}>
            <ConsaludCore.Breadcrumb 
              items={cleanedBreadcrumbItems} 
              separator={<span>{'>'}</span>}
              showHome={true}
              className="breadcrumb-custom"
            />
          </div>
          
          {/* Botón volver debajo del breadcrumb */}
          <div>
            <button
              className="back-button"
              onClick={() => navigate(-1)}
              aria-label="Volver a la página anterior"
            >
              <span className="back-button-icon">
                ←
              </span> 
              Volver
            </button>
          </div>
        </div>
        
        {/* Contenido principal centrado */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'flex-start', 
          minHeight: '70vh', 
          maxWidth: 1200, 
          margin: '0 auto' 
        }}>
          <IngresoTitular />
        </div>
      </div>
    </div>
  );
};

export default IngresoTitularPage;