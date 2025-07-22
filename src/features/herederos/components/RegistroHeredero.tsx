import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
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
    const { buscarHeredero, error, heredero } = useHeredero();

    const [loadingTransition, setLoadingTransition] = useState(true);
    const [step, setStep] = useState(1);
    
    useEffect(() => {
        // Si ya hay un heredero cargado, evitar las animaciones de carga
        if (heredero) {
            setLoadingTransition(false);
            setStep(2);
            return;
        }
        
        // Solo ejecutar animaciones si no hay heredero cargado
        const timeout1 = setTimeout(() => setLoadingTransition(false), 700);
        const timeout2 = setTimeout(() => setStep(2), 150); // Pequeño delay para animar el llenado
        return () => {
            clearTimeout(timeout1);
            clearTimeout(timeout2);
        };
    }, [heredero]);

    const handleBackClick = useCallback((): void => {
        setStep(1);
        setLoadingTransition(true);
        setTimeout(() => {
            navigator(-1);
        }, 700); // Espera a que la animación de vaciado termine
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
            {/* Título centrado y en negrita */}
            <div className="mb-1" style={{ display: 'flex', justifyContent: 'center' }}>
                <ConsaludCore.Typography
                    variant="h5"
                    component="h2"
                    style={{ fontWeight: 700, textAlign: 'center', color: '#222', fontSize: '2rem' }}
                >
                    Registrar persona heredera
                </ConsaludCore.Typography>
            </div>
            {/* Espacio entre título y Stepper */}
            <div style={{ height: 24 }} />
            {/* Stepper */}
            <div className="mb-5">
                <Stepper step={step} loadingTransition={loadingTransition} />
            </div>
            {/* Centered Card Container */}
            <div className="container">
                <div className="columns is-centered">
                    <div className="column is-10-desktop is-12-tablet">
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
