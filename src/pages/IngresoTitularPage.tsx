import React from 'react';
import * as ConsaludCore from '@consalud/core';
import { IngresoTitular } from '@/features/herederos/components/IngresoTitular';
import { useNavigate } from 'react-router-dom';


const IngresoTitularPage: React.FC = () => {
  const navigate = useNavigate();

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: 'Administración devolución herederos' }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 24 }}>
      <ConsaludCore.Breadcrumb items={breadcrumbItems} />
      <button
        style={{ background: 'none', border: 'none', color: '#505050', cursor: 'pointer', display: 'flex', alignItems: 'center', margin: '12px 0 24px 0', fontSize: 16 }}
        onClick={() => navigate(-1)}
      >
        <span style={{ marginRight: 6 }}>&larr;</span> Volver
      </button>
      <IngresoTitular />
    </div>
  );
};

export default IngresoTitularPage;