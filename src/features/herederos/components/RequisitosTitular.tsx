import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import * as ConsaludCore from '@consalud/core'; 
import { useTitular } from "../contexts/TitularContext";

const RequisitosTitular = () => {
    const navigator = useNavigate();
    const { titular, loading } = useTitular();
    const [waiting, setWaiting] = useState(true);

    useEffect(() => {
        if (!titular || !titular.nombre || !titular.apellidoPat) {
            const timeout = setTimeout(() => setWaiting(false), 500);
            return () => clearTimeout(timeout);
        } else {
            setWaiting(true); // Si titular aparece, resetea waiting
        }
    }, [titular]);

    if (loading || (!titular || !titular.nombre || !titular.apellidoPat) && waiting) {
        return (
            <div className="route-container layout-stable" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ConsaludCore.LoadingSpinner  size="large" />
                <span style={{ marginLeft: 16 }}>Cargando datos del titular...</span>
            </div>
        );
    }

    if (!titular || !titular.nombre || !titular.apellidoPat) {
        useEffect(() => {
            navigator('/mnherederos/ingresoher/ingresotitular', { replace: true });
        }, [navigator]);
        return null;
    }

    const handleButtonClick = () => {
        navigator('/mnherederos/ingresoher/DatosTitular');
    };
    const breadcrumbItems = [
      { label: 'Administración devolución herederos' }
    ];
    const cleanedBreadcrumbItems = breadcrumbItems.map(item => ({
      ...item,
      label: typeof item.label === 'string' ? item.label.replace(/^\/+/, '') : item.label
    }));
    return (
        <div className="route-container layout-stable" style={{ paddingTop: 20 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 24 }}>
            {/* Breadcrumb */}
            <div style={{ marginBottom: 8 }}>
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
                onClick={() => navigator(-1)}
                aria-label="Volver a la página anterior"
              >
                <span className="back-button-icon">←</span> Volver
              </button>
            </div>
          </div>
          {/* Título fuera de la Card */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <ConsaludCore.Typography
              variant="h5"
              component="h2"
              weight="bold"
              style={{ textAlign: 'center', fontWeight: 700 }}
              className="titleComponent"
            >
              Requisitos
            </ConsaludCore.Typography>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '70vh', maxWidth: 1200, margin: '0 auto' }}>
            <div className="requitosTitularBox">
              <ConsaludCore.Card
                variant="elevated"
                padding={undefined} // Usamos padding por clase
                className="card-elevated ingreso-card animate-fade-in-up"
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  {/* Icono y subtítulo */}
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      {/* SVG de documento */}
                      <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <rect x="4" y="3" width="16" height="18" rx="2" fill="#04A59B" fillOpacity="0.1"/>
                        <rect x="4" y="3" width="16" height="18" rx="2" stroke="#04A59B" strokeWidth="1.5"/>
                        <path d="M8 7H16M8 11H16M8 15H12" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <ConsaludCore.Typography variant="body" weight="bold" style={{ color: '#04A59B' }}>
                        Requisitos
                      </ConsaludCore.Typography>
                    </div>
                    <ConsaludCore.Typography variant="bodySmall" style={{ color: '#656565', marginBottom: 18 }}>
                      Antes de comenzar, verifica que la persona heredera tenga lo siguiente:
                    </ConsaludCore.Typography>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        {/* SVG check */}
                        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="10" fill="#E6FAF8"/>
                          <path d="M6 10.5L9 13.5L14 8.5" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <ConsaludCore.Typography variant="body" weight="bold">
                          Cédula de identidad vigente.
                        </ConsaludCore.Typography>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="10" fill="#E6FAF8"/>
                          <path d="M6 10.5L9 13.5L14 8.5" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <ConsaludCore.Typography variant="body" weight="bold">
                          Posesión efectiva
                        </ConsaludCore.Typography>
                        <ConsaludCore.Typography variant="body" style={{ marginLeft: 4 }}>
                          que acredite su condición de heredero.
                        </ConsaludCore.Typography>
                      </li>
                      <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                          <circle cx="10" cy="10" r="10" fill="#E6FAF8"/>
                          <path d="M6 10.5L9 13.5L14 8.5" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <ConsaludCore.Typography variant="body" weight="bold">
                          Poder notarial válido
                        </ConsaludCore.Typography>
                        <ConsaludCore.Typography variant="body" style={{ marginLeft: 4 }}>
                          para actuar en representación del titular.
                        </ConsaludCore.Typography>
                      </li>
                    </ul>
                  </div>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                    <ConsaludCore.Button
                      variant="primary"
                      size="large"
                      className="buttonRequisitos"
                      style={{ minWidth: 160, borderRadius: 24 }}
                      onClick={handleButtonClick}
                    >
                      Continuar
                    </ConsaludCore.Button>
                  </div>
                </div>
              </ConsaludCore.Card>
            </div>
          </div>
        </div>
    );
}

export { RequisitosTitular };