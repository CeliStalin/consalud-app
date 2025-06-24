import * as ConsaludCore from '@consalud/core';
import { RequisitosTitular } from '@/features/herederos/components/RequisitosTitular';
import { useNavigate } from 'react-router-dom';

const InfoRequisitosTitularPage: React.FC = () => {
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
      <RequisitosTitular />
    </div>
  );
};

export default InfoRequisitosTitularPage;