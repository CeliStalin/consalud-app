import { useState, useEffect, useRef, useCallback } from "react";
import * as ConsaludCore from '@consalud/core'; 
import { useRutChileno } from "../hooks/useRutChileno";
import { useHerederoNavigation } from "../hooks/useHerederoNavigation";
import '../components/styles/ingresoTitular.css';
import '../../../pages/styles/IngresoHerederosPage.css';
import { useTitular } from "../contexts/TitularContext";
import UserProfileIcon from '@/assets/user-profile.svg';
import RutErrorMessage from './RutErrorMessage';

/**
 * Componente robusto para el ingreso de RUT del titular.
 * Muestra feedback visual para todos los estados y previene estados inconsistentes.
 */
const IngresoTitular: React.FC = () => {
    // HOOKS SIEMPRE AL INICIO
    const { goToRequisitosTitular } = useHerederoNavigation();
    const { rut, isValid: isValidRut, handleRutChange, resetRut } = useRutChileno();
    const [showError, setShowError] = useState(false);
    const { buscarTitular, error, loading, titular, limpiarTitular } = useTitular();
    const [showStepperError, setShowStepperError] = useState(false);
    const [busquedaIniciada, setBusquedaIniciada] = useState(false);
    const [rutBuscado, setRutBuscado] = useState<string | null>(null);

    // Resetear navegación y errores al cambiar el RUT
    useEffect(() => {
        setBusquedaIniciada(false);
        setShowError(false);
        setShowStepperError(false);
        setRutBuscado(null);
    }, [rut]);

    // Lógica de validación y envío
    const handleBlur = useCallback(() => {
        setShowError(rut.length > 0 && !isValidRut);
    }, [rut, isValidRut]);

    const handleFocus = useCallback(() => {
        setShowError(false);
    }, []);

    // Solo botón Buscar navega si el titular está listo
    const handleFlow = useCallback(async () => {
        setShowStepperError(false);
        if (!isValidRut) {
            setShowError(true);
            return;
        }
        if (rut.length === 0) {
            setShowError(true);
            return;
        }
        setShowError(false);
        setShowStepperError(false);
        setBusquedaIniciada(true);
        setRutBuscado(rut);
        try {
            const titularResult = await buscarTitular(rut);
            // Bloquear avance si la persona está vigente (no fallecida)
            if (titularResult && titularResult.indFallecido === 'N') {
                return;
            }
            // Bloquear avance si la persona está fallecida pero no tiene devolución
            if (titularResult && titularResult.indFallecido === 'S' && !titularResult.poseeFondos) {
                return;
            }
        } catch (e) {
            setShowStepperError(true);
            return;
        }
        // Navega solo si el contexto se setea correctamente y la persona está fallecida y tiene devolución
        setTimeout(() => {
            const stored = sessionStorage.getItem('titularContext');
            const titularContext = stored ? JSON.parse(stored) : null;
            const titularOk = titularContext && titularContext.rut && titularContext.rut.replace(/\./g, '').toLowerCase() === rut.replace(/\./g, '').toLowerCase();
            if (titularOk && titularContext.indFallecido === 'S' && titularContext.poseeFondos) {
                goToRequisitosTitular();
            } else {
                console.log('NO NAVEGA: titular en contexto/sessionStorage no coincide o no cumple condiciones');
            }
        }, 0);
    }, [isValidRut, rut, buscarTitular, goToRequisitosTitular]);

    // Feedback visual para error de validación de RUT

    // Feedback visual para error inesperado (modal)
    const renderStepperError = () => (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
            }}
        >
            <ConsaludCore.Card variant="elevated" padding="large">
                <div style={{ minWidth: 320, textAlign: 'center', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
                    <ConsaludCore.Typography variant="h6" color="#E11D48">
                        Ocurrió un error inesperado al consultar el BFF.<br />
                        Intenta nuevamente más tarde.
                    </ConsaludCore.Typography>
                    <button
                        style={{ marginTop: 24, padding: '8px 24px', borderRadius: 8, background: '#04A59B', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                        onClick={() => setShowStepperError(false)}
                    >
                        Cerrar
                    </button>
                </div>
            </ConsaludCore.Card>
        </div>
    );

    // Estados para animación avanzada del modal
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Abrir modal cuando error 404
    useEffect(() => {
        if (error === 'No hay solicitantes en maestro de contactibilidad') {
            setIsOpen(true);
            setTimeout(() => setIsVisible(true), 10); // delay para animación
        } else {
            if (isOpen) {
                setIsVisible(false);
                setTimeout(() => setIsOpen(false), 350); // igual a duración animación CSS
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [error]);

    // Handler para cerrar modal
    const handleCloseModal = () => {
        setIsVisible(false);
        setTimeout(() => setIsOpen(false), 350);
    };

    // Nuevo modal: persona no fallecida
    const [isOpenVigente, setIsOpenVigente] = useState(false);
    const [isVisibleVigente, setIsVisibleVigente] = useState(false);

    // Detectar si el titular está vigente (IndFallecido === 'N')
    useEffect(() => {
        if (titular && titular.indFallecido === 'N') {
            setIsOpenVigente(true);
            setTimeout(() => setIsVisibleVigente(true), 10);
        } else {
            if (isOpenVigente) {
                setIsVisibleVigente(false);
                setTimeout(() => setIsOpenVigente(false), 350);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [titular]);

    const handleCloseVigenteModal = () => {
        setIsVisibleVigente(false);
        setTimeout(() => setIsOpenVigente(false), 350);
        limpiarTitular(); // Limpiar contexto para evitar loops
    };

    // Nuevo modal: fallecido sin devolución
    const [isOpenSinDevolucion, setIsOpenSinDevolucion] = useState(false);
    const [isVisibleSinDevolucion, setIsVisibleSinDevolucion] = useState(false);

    useEffect(() => {
        if (titular && titular.indFallecido === 'S' && !titular.poseeFondos) {
            setIsOpenSinDevolucion(true);
            setTimeout(() => setIsVisibleSinDevolucion(true), 10);
        } else {
            if (isOpenSinDevolucion) {
                setIsVisibleSinDevolucion(false);
                setTimeout(() => setIsOpenSinDevolucion(false), 350);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [titular]);

    const handleCloseSinDevolucionModal = () => {
        setIsVisibleSinDevolucion(false);
        setTimeout(() => setIsOpenSinDevolucion(false), 350);
        limpiarTitular();
    };

    // --- RETURNS CONDICIONALES DESPUÉS DE LOS HOOKS ---
    // Render principal (formulario) + overlay modal si corresponde
    return (
        <>
            {/* Modal de persona vigente (no fallecida) */}
            {isOpenVigente && (
                <div className="modal-overlay fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.08)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
                    <div className={`swal2-modal ${isVisibleVigente ? 'modal-zoom-in' : 'modal-zoom-out'}`} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: 400, maxWidth: '90%', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', position: 'relative', transition: 'transform 0.35s, opacity 0.35s' }}>
                        <button className="swal-close-button" style={{ position: 'absolute', top: 15, right: 15, background: '#f0f0f0', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 24, color: '#666', cursor: 'pointer' }} onClick={handleCloseVigenteModal} aria-label="Cerrar modal">×</button>
                        <div className="titulo-alerta" style={{ color: '#222', fontWeight: 700, fontSize: 22, marginBottom: 16, textAlign: 'center' }}>No es posible continuar con este RUT</div>
                        <div className="sub-titulo-alerta" style={{ color: '#555', fontSize: 16, marginBottom: 32, textAlign: 'center' }}>
                            La persona sigue vigente en Consalud y no aparece como fallecida.
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button className="boton-alerta" style={{ background: '#04A59B', color: '#fff', fontSize: 16, padding: '12px 45px', borderRadius: 50, fontWeight: 500, border: 'none', minWidth: 160, cursor: 'pointer' }} onClick={handleCloseVigenteModal}>
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal de RUT no encontrado */}
            {isOpen && (
                <div className="modal-overlay fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.08)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
                    <div className={`swal2-modal ${isVisible ? 'modal-zoom-in' : 'modal-zoom-out'}`} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: 400, maxWidth: '90%', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', position: 'relative', transition: 'transform 0.35s, opacity 0.35s' }}>
                        <button className="swal-close-button" style={{ position: 'absolute', top: 15, right: 15, background: '#f0f0f0', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 24, color: '#666', cursor: 'pointer' }} onClick={handleCloseModal} aria-label="Cerrar modal">×</button>
                        <div className="titulo-alerta" style={{ color: '#222', fontWeight: 700, fontSize: 22, marginBottom: 16, textAlign: 'center' }}>RUT no encontrado en Consalud</div>
                        <div className="sub-titulo-alerta" style={{ color: '#555', fontSize: 16, marginBottom: 32, textAlign: 'center' }}>
                            El RUT ingresado no esta asociado a ningún afiliado o exafiliado de Consalud.
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button className="boton-alerta" style={{ background: '#04A59B', color: '#fff', fontSize: 16, padding: '12px 45px', borderRadius: 50, fontWeight: 500, border: 'none', minWidth: 160, cursor: 'pointer' }} onClick={handleCloseModal}>
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Modal fallecido sin devolución */}
            {isOpenSinDevolucion && (
                <div className="modal-overlay fade-in" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.08)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.3s' }}>
                    <div className={`swal2-modal ${isVisibleSinDevolucion ? 'modal-zoom-in' : 'modal-zoom-out'}`} style={{ background: '#fff', borderRadius: 20, padding: '2rem', width: 400, maxWidth: '90%', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', position: 'relative', transition: 'transform 0.35s, opacity 0.35s' }}>
                        <button className="swal-close-button" style={{ position: 'absolute', top: 15, right: 15, background: '#f0f0f0', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 24, color: '#666', cursor: 'pointer' }} onClick={handleCloseSinDevolucionModal} aria-label="Cerrar modal">×</button>
                        <div className="titulo-alerta" style={{ color: '#222', fontWeight: 700, fontSize: 22, marginBottom: 16, textAlign: 'center' }}>EL RUT ingresado no tiene devolución</div>
                        <div className="sub-titulo-alerta" style={{ color: '#555', fontSize: 16, marginBottom: 32, textAlign: 'center' }}>
                            {/* Puedes agregar un subtítulo si lo deseas */}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button className="boton-alerta" style={{ background: '#04A59B', color: '#fff', fontSize: 16, padding: '12px 45px', borderRadius: 50, fontWeight: 500, border: 'none', minWidth: 160, cursor: 'pointer' }} onClick={handleCloseSinDevolucionModal}>
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="route-container layout-stable" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {showStepperError && renderStepperError()}
                <ConsaludCore.Typography variant="h5" style={{ fontWeight: 700, color: '#222', marginBottom: 24, textAlign: 'center' }}>
                    Rut del titular
                </ConsaludCore.Typography>
                <ConsaludCore.Card
                    title={undefined}
                    subtitle={undefined}
                    variant="elevated"
                    padding="large"
                    className="ingreso-card animate-fade-in-up"
                >
                    <form
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: 8 }}
                        onSubmit={e => { e.preventDefault(); handleFlow(); }}
                        autoComplete="off"
                        aria-labelledby="rut-titular-label"
                    >
                        <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
                            <div style={{ marginBottom: 32 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <img
                                      src={UserProfileIcon}
                                      width={22}
                                      height={22}
                                      alt="Ícono usuario titular"
                                      style={{ display: 'inline', verticalAlign: 'middle' }}
                                    />
                                    <ConsaludCore.Typography
                                        variant="subtitle1"
                                        style={{ fontWeight: 700, color: '#505050', fontSize: 18 ,width: '100%'}}
                                    >
                                        Rut del titular 
                                    </ConsaludCore.Typography>
                                </div>
                                <ConsaludCore.Typography
                                    variant="body2"
                                    style={{ color: '#656565', fontSize: 15 }}
                                >
                                    Ingresa el RUT del titular que corresponda a una persona afiliada con devolución.
                                </ConsaludCore.Typography>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                                <input
                                    id="RutTitular"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9kK]*"
                                    value={rut}
                                    onChange={handleRutChange}
                                    onBlur={handleBlur}
                                    onFocus={handleFocus}
                                    placeholder="Ingresar"
                                    className="inputRut"
                                    aria-invalid={showError}
                                    aria-describedby={showError ? 'rut-error' : undefined}
                                    style={{ width: 378, height: 42, flexShrink: 0, border: showError ? '1.5px solid #E11D48' : '1.5px solid #e0e0e0', borderRadius: 24, fontSize: 16, paddingLeft: 18, background: '#f8f9fa', boxShadow: '0 2px 8px rgba(4, 165, 155, 0.07)', outline: 'none', transition: 'border 0.2s' }}
                                    disabled={loading}
                                />
                                <button
                                    className={`proceso-button animate-fade-in-up ${isValidRut ? 'buttonRut--valid' : 'buttonRut--invalid'}${loading ? ' button--pulse' : ''}`}
                                    disabled={!isValidRut || loading}
                                    onClick={handleFlow}
                                    type="submit"
                                    style={{ display: 'flex', padding: '10px 24px', justifyContent: 'center', alignItems: 'center', gap: 8, minWidth: 120, borderRadius: 24, height: 42, fontSize: 16, background: isValidRut ? '#04A59B' : '#E0F7F6', color: '#fff', border: 'none', boxShadow: 'none', fontWeight: 600, transition: 'background 0.2s', opacity: loading ? 0.7 : 1 }}
                                    aria-label="Buscar titular"
                                >
                                    {loading ? (
                                      <span style={{ display: 'flex', alignItems: 'center', background: 'transparent', minWidth: 120, justifyContent: 'center' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', background: 'transparent', marginRight: 8 }}>
                                          <ConsaludCore.LoadingSpinner size="medium" style={{ color: '#fff' }} />
                                        </span>
                                        <ConsaludCore.Typography
                                          variant="button"
                                          color="#fff"
                                          style={{ fontWeight: 600 }}
                                        >
                                          Buscar
                                        </ConsaludCore.Typography>
                                      </span>
                                    ) : (
                                      <>
                                        <ConsaludCore.Typography
                                          variant="button"
                                          color={isValidRut ? '#fff' : '#bdbdbd'}
                                          style={{ fontWeight: 600 }}
                                        >
                                          Buscar
                                        </ConsaludCore.Typography>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8 }}>
                                          <circle cx="11" cy="11" r="8" stroke={isValidRut ? 'white' : '#bdbdbd'} strokeWidth="2" />
                                          <path d="M21 21L16.65 16.65" stroke={isValidRut ? 'white' : '#bdbdbd'} strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                      </>
                                    )}
                                </button>
                            </div>
                            {showError && <RutErrorMessage id="rut-error" />}
                        </div>
                    </form>
                </ConsaludCore.Card>
            </div>
        </>
    );
};

export { IngresoTitular };