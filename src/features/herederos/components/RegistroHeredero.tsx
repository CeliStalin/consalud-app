import React from 'react';
import * as ConsaludCore from '@consalud/core';
import { useHeredero } from '../contexts/HerederoContext';
import { useHerederoNavigation } from '../hooks/useHerederoNavigation';
import { FormHerederoProvider } from '../provider/FormHerederoProvider';
import { RegistroTitularCard } from './RegistroTitularCard';
import { Stepper } from './Stepper';

const RegistroHeredero: React.FC = () => {
  const { heredero, buscarHeredero, error, limpiarHeredero } = useHeredero();
  const { goToRegistroTitularClean } = useHerederoNavigation();
  
  /**
   * Función para manejar el botón volver
   * - Limpia el formulario del heredero del contexto
   * - Navega a la misma ruta usando replace para evitar entradas duplicadas en el historial
   * - Esto permite que el usuario vuelva a buscar un heredero con el formulario limpio
   */
  const handleVolver = () => {
    // Limpiar el heredero del contexto para resetear el formulario
    if (limpiarHeredero) {
      limpiarHeredero();
    }
    // Navegar a la misma ruta pero con el formulario limpio usando replace
    goToRegistroTitularClean();
  };


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
                                onClick={handleVolver}
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
