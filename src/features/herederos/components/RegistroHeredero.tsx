import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';
import { useHeredero } from '../contexts/HerederoContext';
import { FormHerederoProvider } from '../provider/FormHerederoProvider';
import { RegistroTitularCard } from './RegistroTitularCard';
import { Stepper } from './Stepper';

const RegistroHeredero: React.FC = () => {
  const { heredero, buscarHeredero, error } = useHeredero();
  const navigate = useNavigate();
  


    const breadcrumbItems: ConsaludCore.BreadcrumbItem[] = [
        { label: 'Administración devolución herederos' }
    ];

    const cleanedBreadcrumbItems = breadcrumbItems.filter(item => 
        item.label !== 'undefined' && item.label !== 'null'
    ).map(item => ({
        ...item,
        label: item.label || 'Inicio'
    }));

    // Obtener el RUT del heredero para el provider
    const rutHeredero = heredero?.rut || '';

    return (
        <FormHerederoProvider rutHeredero={rutHeredero}>
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
                                onClick={() => navigate(-1)}
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
                <Stepper step={2} />
                {/* Centered Card Container */}
                <div className="container">
                    <div className="card-center-container">
                        <div className="card-responsive">
                            <RegistroTitularCard 
                                buscarHeredero={buscarHeredero}
                                error={error}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </FormHerederoProvider>
    );
};

export { RegistroHeredero };
