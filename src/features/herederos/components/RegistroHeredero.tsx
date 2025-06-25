import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRutChileno } from "@/features/herederos/hooks/useRutChileno";
import { Stepper } from "../components/Stepper";
import { useHeredero } from "../contexts/HerederoContext";
import * as ConsaludCore from '@consalud/core';
import { RegistroTitularCard } from "./RegistroTitularCard";

const RegistroHeredero = () => {
    const { rut, isValid: isValidRut, handleRutChange } = useRutChileno();
    const [showError, setShowError] = useState(false);
    const navigator = useNavigate();
    const { buscarHeredero, error } = useHeredero();

    const handleNavigator = async() => {
        const rutLimpio = rut.replace(/[^0-9kK]/g, '');
        if (!isValidRut) {
            return;
        }
        
        try {
            await buscarHeredero(rutLimpio);
            
            if (error) {
                return;
            }
            navigator('/mnherederos/ingresoher/formingreso');
        } catch (err) {
            // Manejo silencioso del error ya que la UI ya muestra el estado
        }
    }
    
    const handleBlur = () => {
        setShowError(rut.length > 0 && !isValidRut);
    };

    const handleFocus = () => {
        setShowError(false);
    };

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
