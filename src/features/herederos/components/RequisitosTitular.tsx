import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import * as ConsaludCore from '@consalud/core'; 
import { useTitular } from "../contexts/TitularContext";
import RequisitosIcon from '@/assets/requisitos.svg';
import CheckIcon from '@/assets/check-requisitos.svg';

const RequisitosTitular: React.FC = () => {
    const navigator = useNavigate();
    const { titular, loading, buscarTitular } = useTitular();
    const [rehidratando, setRehidratando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const renderCount = useRef(0);
    renderCount.current++;

    useEffect(() => {
        if (!loading && (!titular || !titular.nombre || !titular.apellidoPat)) {
            const rutSession = sessionStorage.getItem('rutTitular');
            if (rutSession) {
                setRehidratando(true);
                buscarTitular(rutSession)
                    .then(() => setRehidratando(false))
                    .catch(() => {
                        setError('No se pudo recuperar los datos del titular.');
                        setRehidratando(false);
                    });
            } else {
                setError('No se encontró información del titular.');
            }
        }
    }, [titular, loading, buscarTitular]);

    return (
        <div className="route-container layout-stable">
            {/* Fallback visual si faltan campos */}
            {(!titular?.nombre || !titular?.apellidoPat) && (
                <div className="has-text-danger mb-4">
                    <b>Advertencia:</b> Faltan datos del titular (nombre o apellidoPat). Verifica el mapeo de datos.
                </div>
            )}

            {/* Header Section */}
            <div className="mb-5" style={{ width: '100%' }}>
                <div className="ml-6">
                    {/* Breadcrumb */}
                    <div className="mb-2">
                        <ConsaludCore.Breadcrumb 
                            items={[{ label: 'Administración devolución herederos' }]} 
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

            {/* Título fuera de la Card */}
            <div className="is-flex is-justify-content-center mb-5">
                <ConsaludCore.Typography
                    variant="h5"
                    component="h2"
                    weight={600}
                    className="titleComponent"
                    style={{ textAlign: 'center', fontWeight: 600, color: '#000', fontSize: '30px' }}
                >
                    Requisitos
                </ConsaludCore.Typography>
            </div>

            {/* Card centrado con Bulma */}
            <div className="is-flex is-justify-content-center is-align-items-flex-start" style={{ minHeight: '70vh', width: '100%' }}>
                <ConsaludCore.Card
                    variant="elevated"
                    padding={undefined}
                    className="card-elevated ingreso-card animate-fade-in-up p-6"
                    style={{ maxWidth: 653, width: '100%' }}
                >
                    <div className="is-flex is-flex-direction-column is-align-items-center" style={{ width: '100%' }}>
                        {/* Icono y subtítulo */}
                        <div style={{ width: '100%' }}>
                            <div className="is-flex is-align-items-center mb-2" style={{ gap: 8 }}>
                                <img src={RequisitosIcon} width={24} height={24} alt="Ícono requisitos" style={{ display: 'inline', verticalAlign: 'middle' }} />
                                <ConsaludCore.Typography variant="body" style={{ color: '#222', fontWeight: 400 }}>
                                    Requisitos
                                </ConsaludCore.Typography>
                            </div>
                            <ConsaludCore.Typography variant="bodySmall" style={{ color: '#505050', marginBottom: 18, fontWeight: 400 }}>
                                Antes de comenzar, verifica que la persona heredera tenga lo siguiente:
                            </ConsaludCore.Typography>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%' }}>
                                <li className="is-flex is-align-items-center mb-3" style={{ gap: 12 }}>
                                    <img src={CheckIcon} width={20} height={20} alt="Check" style={{ display: 'inline', verticalAlign: 'middle' }} />
                                    <ConsaludCore.Typography variant="body" weight="bold" style={{ fontWeight: 700, color: '#222' }}>
                                        Cédula de identidad vigente.
                                    </ConsaludCore.Typography>
                                </li>
                                <li className="is-flex is-align-items-center mb-3" style={{ gap: 12 }}>
                                    <img src={CheckIcon} width={20} height={20} alt="Check" style={{ display: 'inline', verticalAlign: 'middle' }} />
                                    <ConsaludCore.Typography variant="body" weight="bold" style={{ fontWeight: 700, color: '#222' }}>
                                        Posesión efectiva
                                    </ConsaludCore.Typography>
                                    <ConsaludCore.Typography variant="body" style={{ marginLeft: 4, color: '#222', fontWeight: 400 }}>
                                        que acredite su condición de heredero.
                                    </ConsaludCore.Typography>
                                </li>
                                <li className="is-flex is-align-items-center" style={{ gap: 12 }}>
                                    <img src={CheckIcon} width={20} height={20} alt="Check" style={{ display: 'inline', verticalAlign: 'middle' }} />
                                    <ConsaludCore.Typography variant="body" weight="bold" style={{ fontWeight: 700, color: '#222' }}>
                                        Poder notarial válido
                                    </ConsaludCore.Typography>
                                    <ConsaludCore.Typography variant="body" style={{ marginLeft: 4, color: '#222', fontWeight: 400 }}>
                                        para actuar en representación del titular.
                                    </ConsaludCore.Typography>
                                </li>
                            </ul>
                        </div>
                        <div className="is-flex is-justify-content-center mt-6" style={{ width: '100%' }}>
                            <button
                                className={`button proceso-button animate-fade-in-up buttonRut--valid${loading ? ' button--pulse' : ''}`}
                                style={{ minWidth: 120, borderRadius: 24, height: 42, fontSize: 16, background: '#04A59B', color: '#fff', border: 'none', boxShadow: 'none', fontWeight: 600, transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}
                                onClick={() => navigator('/mnherederos/ingresoher/DatosTitular')}
                                type="button"
                                aria-label="Entendido"
                                disabled={loading}
                            >
                                <ConsaludCore.Typography
                                    variant="button"
                                    color="#fff"
                                    style={{ fontWeight: 600 }}
                                >
                                    Entendido
                                </ConsaludCore.Typography>
                            </button>
                        </div>
                    </div>
                </ConsaludCore.Card>
            </div>
        </div>
    );
}

export { RequisitosTitular };