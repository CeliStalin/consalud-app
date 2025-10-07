import * as ConsaludCore from '@consalud/core';
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stepper } from '../components/Stepper';
import { useTitular } from '../contexts/TitularContext';
import { useStorageCleanup } from '../hooks/useStorageCleanup';
import { DatosTitularCard } from './DatosTitularCard';

interface BreadcrumbItem {
  label: string;
}

const DatosTitular: React.FC = () => {
  const navigator = useNavigate();
  const { titular, loading, buscarTitular } = useTitular();
  const { cleanupAllDocuments } = useStorageCleanup();
  const hasRedirected = useRef<boolean>(false);

  // Limpiar documentos del sessionStorage cuando se inicie el flujo desde Datos del titular
  useEffect(() => {
    cleanupAllDocuments();
  }, [cleanupAllDocuments]);

  // Si no hay titular pero hay rut en sessionStorage, re-buscar
  useEffect(() => {
    if (!titular && !loading) {
      const rutSession = sessionStorage.getItem('rutTitular');
      if (rutSession) {
        buscarTitular(rutSession);
      }
    }
  }, [titular, loading, buscarTitular]);

  const handleClick = useCallback((): void => {
    navigator('/mnherederos/ingresoher/RegistroTitular');
  }, [navigator]);

  const handleBackClick = useCallback((): void => {
    navigator(-1);
  }, [navigator]);

  if (loading) {
    return (
      <div className="route-container layout-stable">
        <div className="columns is-centered is-vcentered" style={{ minHeight: '60vh' }}>
          <div className="column is-narrow has-text-centered">
            <ConsaludCore.LoadingSpinner size="large" />
            <span className="ml-3">Cargando datos del titular...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!titular || !titular.nombre || !titular.apellidoPat) {
    useEffect(() => {
      if (!hasRedirected.current) {
        hasRedirected.current = true;
        navigator('/mnherederos/ingresoher/ingresotitular', { replace: true });
      }
    }, [navigator]);
    return null;
  }

  const breadcrumbItems: BreadcrumbItem[] = [{ label: 'Administración devolución herederos' }];

  const cleanedBreadcrumbItems = breadcrumbItems.map(item => ({
    ...item,
    label: typeof item.label === 'string' ? item.label.replace(/^\/+/, '') : item.label,
  }));

  return (
    <div className="route-container layout-stable">
      {/* Header Section */}
      <div style={{ width: '100%', marginBottom: 8 }}>
        <div style={{ marginLeft: 48 }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: 4 }}>
            <ConsaludCore.Breadcrumb
              items={cleanedBreadcrumbItems}
              separator={<span>{'>'}</span>}
              showHome={true}
              className="breadcrumb-custom"
            />
          </div>
          {/* Botón volver */}
          <div>
            <button
              className="back-button"
              onClick={handleBackClick}
              aria-label="Volver a la página anterior"
            >
              <span className="back-button-icon">←</span> Volver
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      {/* Título centrado y en negrita */}
      <div className="mb-1" style={{ display: 'flex', justifyContent: 'center' }}>
        <ConsaludCore.Typography
          variant="h5"
          component="h2"
          style={{
            fontWeight: 700,
            textAlign: 'center',
            color: '#222',
            fontSize: '2rem',
          }}
        >
          Datos del titular
        </ConsaludCore.Typography>
      </div>
      <Stepper step={1} />
      {/* Centered Card Container */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          marginTop: 0,
        }}
      >
        <div className="card-responsive">
          <div className="generalContainer">
            <DatosTitularCard
              nombre={titular?.nombre || ''}
              apellidoPat={titular?.apellidoPat || ''}
              apellidoMat={titular?.apellidoMat || ''}
              fechaDefuncion={titular?.fechaDefuncion || ''}
              onContinuar={handleClick}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { DatosTitular };
