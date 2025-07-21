import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import * as ConsaludCore from '@consalud/core'; 
import { useTitular } from "../contexts/TitularContext";
import RequisitosIcon from '@/assets/requisitos.svg';
import CheckIcon from '@/assets/check-requisitos.svg';

const RequisitosTitular = () => {
    const navigator = useNavigate();
    const { titular, loading, buscarTitular } = useTitular();
    const [rehidratando, setRehidratando] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const renderCount = useRef(0);
    renderCount.current++;

    // Rehidratar desde sessionStorage si el contexto está vacío
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

    // Elimino todos los bloques de debug visual y logs de consola
    // Elimino el try/catch del render
    // Dejo solo el render limpio y profesional
    return (
        <div className="route-container layout-stable" style={{ paddingTop: 20 }}>
            {/* Fallback visual si faltan campos */}
            {(!titular?.nombre || !titular?.apellidoPat) && (
                <div style={{ color: 'red', marginBottom: 16 }}>
                    <b>Advertencia:</b> Faltan datos del titular (nombre o apellidoPat). Verifica el mapeo de datos.
                </div>
            )}
            <div style={{ width: '100%', marginBottom: 24 }}>
                {/* Breadcrumb */}
                <div style={{ marginBottom: 8 }}>
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
            {/* Título fuera de la Card */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div>
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '70vh', width: '100%' }}>
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
                                    onClick={() => navigator('/mnherederos/ingresoher/DatosTitular')}
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