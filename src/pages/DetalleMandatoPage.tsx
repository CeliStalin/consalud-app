import { Stepper, StepperProvider, useStepper } from '@/features/herederos/components/Stepper';
import * as ConsaludCore from '@consalud/core';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MandatoResult, mockMandatoService } from '../features/herederos/services/mockMandatoService';
import './styles/DetalleMandatoPage.css';

const DetalleMandatoPageContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setStep } = useStepper();
  const [loading, setLoading] = useState(false);
  const [mandatoInfo, setMandatoInfo] = useState<MandatoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Establecer el paso 4 del stepper
  useEffect(() => {
    setStep(4);
  }, [setStep]);

  // Obtener el mandatoId o rutCliente del estado de la navegación o localStorage
  useEffect(() => {
    const fetchMandatoData = async () => {
      setLoading(true);
      try {
        // Intentar obtener datos del estado de navegación
        const stateData = location.state as { rutCliente?: string, mandatoId?: string } | null;

        // Si no hay datos en el estado, buscar en localStorage
        const rutCliente = stateData?.rutCliente || localStorage.getItem('currentRutCliente') || '17175966';
        const mandatoId = stateData?.mandatoId || localStorage.getItem('currentMandatoId') || '';

        console.log(`Obteniendo detalles para RUT: ${rutCliente}, Mandato: ${mandatoId}`);

        // Llamar al servicio
        const resultado = await mockMandatoService.getMandatoInfo(rutCliente, mandatoId);
        setMandatoInfo(resultado);
      } catch (err) {
        console.error('Error al cargar detalles del mandato:', err);
        setError('No se pudo cargar la información del mandato');
      } finally {
        setLoading(false);
      }
    };

    fetchMandatoData();
  }, [location]);

  const handleVolver = () => {
    navigate('/mnherederos/ingresoher');
  };

  const handleSiguiente = () => {
    navigate('/mnherederos/ingresoher/success');
  };

  const breadcrumbItems = [
    { label: 'Administración devolución herederos' }
  ];
  const cleanedBreadcrumbItems = breadcrumbItems.map(item => ({
    ...item,
    label: typeof item.label === 'string' ? item.label.replace(/^\/+/,'') : item.label
  }));

  return (
    <div className="detalle-mandato-page-container" style={{
      width: '100%',
      maxWidth: '100%'
    }}>
      {/* Header Section: Breadcrumb y botón volver */}
      <div className="detalle-mandato-header" style={{
        width: '100%',
        marginBottom: '1.5rem'
      }}>
        <div style={{ marginLeft: '3rem' }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: '0.5rem' }}>
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
              onClick={() => navigate('/mnherederos/ingresoher/cargadoc')}
              aria-label="Volver a la página anterior"
            >
              <span className="back-button-icon">←</span> Volver
            </button>
          </div>

          {/* Título arriba del stepper */}
          <div className="mb-1" style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <ConsaludCore.Typography
              variant="h5"
              component="h1"
              style={{
                fontWeight: 700,
                textAlign: 'center',
                color: '#222',
                fontSize: '2rem',
                marginBottom: '1.5rem'
              }}
            >
              Cuenta bancaria
            </ConsaludCore.Typography>
          </div>

          {/* Stepper debajo del título */}
          <div className="mb-5" style={{ marginBottom: '2.5rem' }}>
            <Stepper step={4} />
          </div>
        </div>
      </div>

      {/* Card principal */}
      <div className="card-center-container">
        <div className="card-responsive">
          <div className="generalContainer">
            <ConsaludCore.Card
              title="Información de la Cuenta Bancaria"
              subtitle="Detalles de la cuenta bancaria registrada para la devolución"
              variant="elevated"
              padding="large"
            >
        {loading ? (
          <div className="has-text-centered p-6">
            <div className="loader-container">
              <div className="loader"></div>
            </div>
            <p className="mt-4">Cargando información...</p>
          </div>
        ) : error ? (
          <div className="notification is-danger">
            <p>{error}</p>
            <ConsaludCore.Button
              variant="primary"
              onClick={handleVolver}
              className="mt-4"
            >
              Volver al inicio
            </ConsaludCore.Button>
          </div>
        ) : mandatoInfo ? (
            <div className="mandato-detalle">
            <div className="columns">
              <div className="column">
                <div className="field-group">
                  <h4 className="subtitle is-6">Información de la cuenta</h4>
                  <div className="field">
                    <label className="label">Banco</label>
                    <p className="field-value">{mandatoInfo.banco}</p>
                  </div>
                  <div className="field">
                    <label className="label">Tipo de cuenta</label>
                    <p className="field-value">{mandatoInfo.tipoCuenta}</p>
                  </div>
                  <div className="field">
                    <label className="label">Número de cuenta</label>
                    <p className="field-value">{mandatoInfo.numeroCuenta}</p>
                  </div>
                  <div className="field">
                    <label className="label">ID de mandato</label>
                    <p className="field-value">{mandatoInfo.mandatoId}</p>
                  </div>
                  {mandatoInfo.indTipo && (
                    <div className="field">
                      <label className="label">Tipo</label>
                      <p className="field-value">{mandatoInfo.indTipo === '1' ? 'Cuenta Corriente' :
                                                 mandatoInfo.indTipo === '2' ? 'Cuenta Vista' :
                                                 mandatoInfo.indTipo === '3' ? 'Cuenta de Ahorro' :
                                                 mandatoInfo.indTipo}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="column">
                <div className="field-group">
                  <h4 className="subtitle is-6">Información del titular</h4>
                  <div className="field">
                    <label className="label">Nombre</label>
                    <p className="field-value">{mandatoInfo.nombreCliente}</p>
                  </div>
                  <div className="field">
                    <label className="label">Apellido Paterno</label>
                    <p className="field-value">{mandatoInfo.apellidoPaterno || '-'}</p>
                  </div>
                  <div className="field">
                    <label className="label">Apellido Materno</label>
                    <p className="field-value">{mandatoInfo.apellido}</p>
                  </div>
                  <div className="field">
                    <label className="label">RUT</label>
                    <p className="field-value">{mandatoInfo.rutCliente}-{mandatoInfo.digitoVerificador}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mostrar campos adicionales del servicio SOAP en un acordeón */}
            <div className="box mt-4">
              <details>
                <summary className="has-text-primary has-text-weight-medium">Información adicional del mandato</summary>
                <div className="columns is-multiline mt-3">
                  {Object.entries(mandatoInfo)
                    .filter(([key]) => !['mandatoId', 'banco', 'tipoCuenta', 'numeroCuenta',
                                        'nombreCliente', 'apellido', 'apellidoPaterno', 'rutCliente',
                                        'digitoVerificador', 'mensaje', 'Sindtipo'].includes(key))
                    .map(([key, value]) => (
                      <div className="column is-half" key={key}>
                        <div className="field">
                          <label className="label is-small">{key}</label>
                          <p className="field-value">{String(value || '-')}</p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </details>
            </div>

            <div className="notification is-info is-light mt-4">
              <p>Esta información bancaria será utilizada para realizar la devolución de los fondos correspondientes.</p>
              <p className="mt-2 is-size-7">Si los datos no son correctos, por favor vuelva al paso anterior y modifique la información.</p>
            </div>

            <div className="has-text-centered buttons-container mt-5">
              <ConsaludCore.Button
                variant="secondary"
                onClick={handleVolver}
                className="mr-3"
              >
                Volver
              </ConsaludCore.Button>
              <ConsaludCore.Button
                variant="primary"
                onClick={handleSiguiente}
              >
                Continuar
              </ConsaludCore.Button>
            </div>
          </div>
        ) : (
          <div className="has-text-centered p-5">
            <p>No se encontró información de la cuenta bancaria</p>
            <ConsaludCore.Button
              variant="primary"
              onClick={handleVolver}
              className="mt-4"
            >
              Volver al inicio
            </ConsaludCore.Button>
          </div>
        )}
            </ConsaludCore.Card>
          </div>
        </div>
      </div>

      {/* Espacio adicional para asegurar scroll */}
      <div style={{ height: '8rem' }}></div>
    </div>
  );
};

const DetalleMandatoPage: React.FC = () => {
  return (
    <StepperProvider>
      <div className="route-container layout-stable instant-stable navigation-stable no-flash" style={{
        overflowY: 'auto',
        backgroundColor: '#F8F9FA',
        padding: '0',
        height: '100vh'
      }}>
        <div style={{ minHeight: '120vh', paddingBottom: '4rem' }}>
          <DetalleMandatoPageContent />
        </div>
      </div>
    </StepperProvider>
  );
};

export default DetalleMandatoPage;
