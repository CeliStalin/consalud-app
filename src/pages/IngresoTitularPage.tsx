import * as ConsaludCore from '@consalud/core';
import { IngresoTitular } from '@/features/herederos/components/IngresoTitular';
import { useNavigate } from 'react-router-dom';

const IngresoTitularPage: React.FC = () => {
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: 'Administración devolución herederos' }
  ];

  return (
    <div className="main-content" style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <ConsaludCore.Breadcrumb
          items={breadcrumbItems}
          separator={<span>{'>'}</span>}
          showHome={true}
          className="breadcrumb-custom"
        />
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          aria-label="Volver a la página anterior"
          style={{ marginTop: 8 }}
        >
          <span className="back-button-icon">←</span> Volver
        </button>
      </div>
      <IngresoTitular />
    </div>
  );
};

export default IngresoTitularPage;