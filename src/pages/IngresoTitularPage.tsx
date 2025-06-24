import * as ConsaludCore from '@consalud/core';
import { IngresoTitular } from '@/features/herederos/components/IngresoTitular';
import { useNavigate, useLocation } from 'react-router-dom';

const IngresoTitularPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const breadcrumbItems = [
    { label: 'Administración devolución herederos' }
  ];

  return (
    <>
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
    </>
  );
};

export default IngresoTitularPage;