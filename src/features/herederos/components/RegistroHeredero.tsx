import { useNavigate } from "react-router-dom";
import { useRutChileno } from "@/features/herederos/hooks/useRutChileno";
import { Stepper } from "../components/Stepper";
import { useHeredero } from "../contexts/HerederoContext";
import * as ConsaludCore from '@consalud/core';
import { RegistroTitularCard } from "./RegistroTitularCard";

const RegistroHeredero = () => {
    useRutChileno();
    const navigator = useNavigate();
    const { buscarHeredero, error } = useHeredero();

    const breadcrumbItems = [
      { label: 'Administración devolución herederos' }
    ];
    const cleanedBreadcrumbItems = breadcrumbItems.map(item => ({
      ...item,
      label: typeof item.label === 'string' ? item.label.replace(/^\/+/,'') : item.label
    }));

    return (
        <div className="route-container layout-stable">
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
          <div className="generalContainer">
            <div style={{ width: 1000, marginLeft: 48 }}>
              <div className="textoTituloComponentes">
                <span className="titleComponent">
                  Registrar persona heredera
                </span>
              </div>
              <Stepper step={2} />
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '60vh', width: '100%' }}>
                <RegistroTitularCard buscarHeredero={buscarHeredero} error={error} />
              </div>
            </div>
          </div>
        </div>
    );
};

export { RegistroHeredero };
