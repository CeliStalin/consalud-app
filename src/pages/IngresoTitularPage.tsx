import * as ConsaludCore from '@consalud/core';
import { IngresoTitular } from '@/features/herederos/components/IngresoTitular';
import { useNavigate } from 'react-router-dom';

const IngresoTitularPage: React.FC = () => {
  const navigate = useNavigate();

  const breadcrumbItems = [
    { label: 'Administración devolución herederos' }
  ];

  return (
    <>
      {/* Header Section */}
      <div style={{ width: '100%', marginBottom: 24 }}>
        <div style={{ marginLeft: 48 }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 8 }}>
            <ConsaludCore.Breadcrumb
              items={breadcrumbItems}
              separator={<span>{'>'}</span>}
              showHome={true}
              className="breadcrumb-custom"
            />
          </div>
          {/* Botón volver */}
          <div>
            <button
              className="back-button"
              onClick={() => navigate(-1)}
              aria-label="Volver a la página anterior"
            >
              <span className="back-button-icon">←</span> Volver
            </button>
          </div>
        </div>
      </div>
      <IngresoTitular />
    </>
  );
};

export default IngresoTitularPage;