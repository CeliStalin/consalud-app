import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import { useRutChileno } from "@/features/herederos/hooks/useRutChileno";
import { Stepper } from "../components/Stepper";
import { useHeredero } from "../contexts/HerederoContext";
import * as ConsaludCore from '@consalud/core';
import { RegistroTitularCard } from "./RegistroTitularCard";

interface BreadcrumbItem {
    label: string;
}

const RegistroHeredero: React.FC = () => {
    useRutChileno();
    const navigator = useNavigate();
    const { buscarHeredero, error } = useHeredero();

    const handleBackClick = useCallback((): void => {
        navigator(-1);
    }, [navigator]);

    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Administración devolución herederos' }
    ];
    
    const cleanedBreadcrumbItems = breadcrumbItems.map(item => ({
        ...item,
        label: typeof item.label === 'string' ? item.label.replace(/^\/+/, '') : item.label
    }));

    return (
        <div className="route-container layout-stable" style={{ overflowY: 'auto', height: '100vh', paddingBottom: 40 }}>
            {/* Header Section */}
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
                            onClick={handleBackClick}
                            aria-label="Volver a la página anterior"
                        >
                            <span className="back-button-icon">←</span> Volver
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Section */}
            <div className="container">
                <div className="columns is-centered">
                    <div className="column is-10-desktop is-12-tablet">
                        {/* Title */}
                        <div className="textoTituloComponentes mb-4">
                            <span className="titleComponent">
                                Registrar persona heredera
                            </span>
                        </div>
                        
                        {/* Stepper */}
                        <div className="mb-5">
                            <Stepper step={2} />
                        </div>
                        
                        {/* Centered Card Container */}
                        <div className="card-center-container">
                            <div className="card-responsive">
                                <div className="generalContainer">
                                    <RegistroTitularCard 
                                        buscarHeredero={buscarHeredero} 
                                        error={error} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export { RegistroHeredero };
