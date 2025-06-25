import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Stepper } from "../components/Stepper";
import { useTitular } from "../contexts/TitularContext";
import * as ConsaludCore from '@consalud/core';
import { DatosTitularCard } from "./DatosTitularCard";

const DatosTitular = () => {
    const navigator = useNavigate();
    const { titular, loading, buscarTitular } = useTitular();
    const hasRedirected = useRef(false);

    // Si no hay titular pero hay rut en sessionStorage, re-buscar
    useEffect(() => {
        if (!titular && !loading) {
            const rutSession = sessionStorage.getItem('rutTitular');
            if (rutSession) {
                buscarTitular(rutSession);
            }
        }
    }, [titular, loading, buscarTitular]);

    if (loading) {
        return (
            <div className="route-container layout-stable" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ConsaludCore.LoadingSpinner  size="large" />
                <span style={{ marginLeft: 16 }}>Cargando datos del titular...</span>
            </div>
        );
    }

    if (!titular || !titular.nombre || !titular.apellidoPat) {
        useEffect(() => {
            if (!hasRedirected.current) {
                navigator('/mnherederos/ingresoher/ingresotitular', { replace: true });
            }
        }, [navigator]);
        return null;
    }

    const handleClick = () => {
        navigator('/mnherederos/ingresoher/RegistroTitular');
    };

    const breadcrumbItems = [
      { label: 'Administración devolución herederos' }
    ];
    const cleanedBreadcrumbItems = breadcrumbItems.map(item => ({
      ...item,
      label: typeof item.label === 'string' ? item.label.replace(/^\/+/,'') : item.label
    }));
    return (
        <div className="route-container layout-stable" style={{ paddingTop: 20 }}>
          <div style={{ width: '100%', marginBottom: 24 }}>
            <div style={{ marginLeft: 48 }}>
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
          </div>
          <div className="generalContainer" style={{ alignItems: 'center', paddingLeft: 0 }}>
            <div style={{ width: 1000, marginLeft: 48 }}>
              <Stepper step={1}/>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '60vh', width: '100%' }}>
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
}

export { DatosTitular };