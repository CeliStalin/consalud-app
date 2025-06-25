import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import * as ConsaludCore from '@consalud/core'; 
import { useTitular } from "../contexts/TitularContext";
import { useMenuCollapse } from '@consalud/core';
import RequisitosIcon from '@/assets/requisitos.svg';
import CheckIcon from '@/assets/check-requisitos.svg';

const RequisitosTitular = () => {
    const navigator = useNavigate();
    const { titular, loading } = useTitular();
    const [waiting, setWaiting] = useState(true);

    useEffect(() => {
        if (!loading && (!titular || !titular.nombre || !titular.apellidoPat)) {
            const timeout = setTimeout(() => {
                navigator('/mnherederos/ingresoher/ingresotitular', { replace: true });
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [titular, loading, navigator]);

    if (loading) {
        return (
            <div className="route-container layout-stable" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ConsaludCore.LoadingSpinner  size="large" />
                <span style={{ marginLeft: 16 }}>Cargando datos del titular...</span>
            </div>
        );
    }

    if (!titular || !titular.nombre || !titular.apellidoPat) {
        return <span style={{ display: 'block', textAlign: 'center', marginTop: 40 }}>Redirigiendo...</span>;
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
        <div style={{ paddingTop: 20 }}>
            <div style={{ width: '100%', marginBottom: 24 }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 24 }}>
              <div style={{ marginLeft: 48 }}>
                <ConsaludCore.Typography
                    variant="h5"
                    component="h2"
                    weight="bold"
                    style={{ textAlign: 'center', fontWeight: 150, color: '#000', width: '100px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}
                    className="titleComponent"
                >
                    Requisitos
                </ConsaludCore.Typography>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', minHeight: '70vh', width: '100%' }}>
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
                                    <img src={RequisitosIcon} width={24} height={24} alt="Ícono requisitos" style={{ display: 'inline', verticalAlign: 'middle' }} />
                                    <ConsaludCore.Typography variant="body" weight="bold" style={{ color: '#04A59B' }}>
                                        Requisitos
                                    </ConsaludCore.Typography>
                                </div>
                                <ConsaludCore.Typography variant="bodySmall" style={{ color: '#656565', marginBottom: 18 }}>
                                    Antes de comenzar, verifica que la persona heredera tenga lo siguiente:
                                </ConsaludCore.Typography>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <img src={CheckIcon} width={20} height={20} alt="Check" style={{ display: 'inline', verticalAlign: 'middle' }} />
                                        <ConsaludCore.Typography variant="body" weight="bold">
                                            Cédula de identidad vigente.
                                        </ConsaludCore.Typography>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <img src={CheckIcon} width={20} height={20} alt="Check" style={{ display: 'inline', verticalAlign: 'middle' }} />
                                        <ConsaludCore.Typography variant="body" weight="bold">
                                            Posesión efectiva
                                        </ConsaludCore.Typography>
                                        <ConsaludCore.Typography variant="body" style={{ marginLeft: 4 }}>
                                            que acredite su condición de heredero.
                                        </ConsaludCore.Typography>
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <img src={CheckIcon} width={20} height={20} alt="Check" style={{ display: 'inline', verticalAlign: 'middle' }} />
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
                                <button
                                    className={`proceso-button animate-fade-in-up buttonRut--valid${loading ? ' button--pulse' : ''}`}
                                    style={{ display: 'flex', padding: '10px 24px', justifyContent: 'center', alignItems: 'center', gap: 8, minWidth: 120, borderRadius: 24, height: 42, fontSize: 16, background: '#04A59B', color: '#fff', border: 'none', boxShadow: 'none', fontWeight: 600, transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}
                                    onClick={handleButtonClick}
                                    type="button"
                                    aria-label="Continuar"
                                    disabled={loading}
                                >
                                    <ConsaludCore.Typography
                                        variant="button"
                                        color="#fff"
                                        style={{ fontWeight: 600 }}
                                    >
                                        Continuar
                                    </ConsaludCore.Typography>
                                </button>
                            </div>
                        </div>
                    </ConsaludCore.Card>
                </div>
            </div>
        </div>
    );
}

export { RequisitosTitular };