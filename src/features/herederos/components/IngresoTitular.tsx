import UserProfileIcon from '@/assets/user-profile.svg';
import * as ConsaludCore from '@consalud/core';
import { useCallback, useEffect, useState } from "react";
import '../../../pages/styles/IngresoHerederosPage.css';
import '../components/styles/ingresoTitular.css';
import { useHeredero } from "../contexts/HerederoContext";
import { useTitular } from "../contexts/TitularContext";
import { UseAlert } from "../hooks/Alert";
import { useHerederoNavigation } from "../hooks/useHerederoNavigation";
import { useRutChileno } from "../hooks/useRutChileno";
import { useStorageCleanup } from "../hooks/useStorageCleanup";
import RutErrorMessage from './RutErrorMessage';

/**
 * Componente para el ingreso de RUT del titular.
 * Muestra feedback visual para todos los estados y previene estados inconsistentes.
 */
const IngresoTitular: React.FC = () => {
    // HOOKS SIEMPRE AL INICIO
    const { goToRequisitosTitular } = useHerederoNavigation();
    const { rut, isValid: isValidRut, handleRutChange } = useRutChileno();
    const [showError, setShowError] = useState(false);
    const { buscarTitular, error, loading, limpiarTitular } = useTitular();
    const { limpiarHeredero } = useHeredero();
    const { cleanupAllHerederoData } = useStorageCleanup();
    const [showStepperError, setShowStepperError] = useState(false);
    const [hasShown404Alert, setHasShown404Alert] = useState(false);

    // Hook de alertas - se ejecuta solo una vez
    const alertFunctions = UseAlert();

    // Limpiar datos anteriores al iniciar un flujo nuevo
    useEffect(() => {
        cleanupAllHerederoData();
        limpiarHeredero();
    }, [limpiarHeredero, cleanupAllHerederoData]);

    // Memoizar las funciones de alerta para evitar recreaciones
    const mostrarAlerta = useCallback(() => {
        alertFunctions.mostrarAlerta();
    }, [alertFunctions]);

    const mostrarAlerta2 = useCallback(() => {
        alertFunctions.mostrarAlerta2();
    }, [alertFunctions]);

    const mostrarAlerta3 = useCallback((onClose?: () => void) => {
        alertFunctions.mostrarAlerta3(onClose);
    }, [alertFunctions]);

    const mostrarAlertaHerederoRegistrado = useCallback(() => {
        alertFunctions.mostrarAlertaHerederoRegistrado();
    }, [alertFunctions]);

    // Resetear navegación y errores al cambiar el RUT
    useEffect(() => {
        setShowError(false);
        setShowStepperError(false);
        setHasShown404Alert(false);
        // Limpiar error del contexto cuando cambie el RUT
        if (error) {
            limpiarTitular();
        }
    }, [rut, error, limpiarTitular]);

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
        try {
            const titularResult = await buscarTitular(rut);
            // Bloquear avance si la persona está vigente (no fallecida)
            if (titularResult && titularResult.indFallecido === 'N') {
                mostrarAlerta();
                return;
            }
            // Bloquear avance si la persona está fallecida pero no tiene devolución
            if (titularResult && titularResult.indFallecido === 'S' && !titularResult.poseeFondos) {
                mostrarAlerta2();
                return;
            }
            // Validar si el titular posee fondos y solicitudes (nueva validación)
            if (titularResult && titularResult.poseeFondos && titularResult.poseeSolicitud) {
                mostrarAlertaHerederoRegistrado();
                return;
            }
        } catch (e) {
            // Si hay un error específico de "no encontrado", mostrar la alerta correspondiente
            if (error === '404_NOT_FOUND') {
                return;
            } else {
                setShowStepperError(true);
            }
            return;
        }
        // Navega solo si el contexto se setea correctamente y la persona está fallecida y tiene devolución
        setTimeout(() => {
            const stored = sessionStorage.getItem('titularContext');
            const titularContext = stored ? JSON.parse(stored) : null;
            const titularOk = titularContext && titularContext.rut && titularContext.rut.replace(/\./g, '').toLowerCase() === rut.replace(/\./g, '').toLowerCase();
            if (titularOk && titularContext.indFallecido === 'S' && titularContext.poseeFondos) {
                goToRequisitosTitular();
            }
        }, 0);
    }, [isValidRut, rut, buscarTitular, goToRequisitosTitular, mostrarAlerta, mostrarAlerta2, mostrarAlerta3, mostrarAlertaHerederoRegistrado, error]);

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

    // useEffect para manejar errores específicos del contexto
    useEffect(() => {
        if (error === '404_NOT_FOUND' && !hasShown404Alert) {
            setHasShown404Alert(true);
            mostrarAlerta3(() => {
                // Limpiar el error cuando el usuario cierre la alerta
                limpiarTitular();
                setHasShown404Alert(false);
            });
        }
    }, [error, limpiarTitular, hasShown404Alert]);

    // --- RETURNS CONDICIONALES DESPUÉS DE LOS HOOKS ---
    // Render principal (formulario) + overlay modal si corresponde
    return (
        <>
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
                                    className={`button is-primary is-rounded proceso-button animate-fade-in-up${loading ? ' is-loading-custom' : ''}${isValidRut ? ' buttonRut--valid' : ' buttonRut--invalid'}`}
                                    disabled={!isValidRut || loading}
                                    onClick={handleFlow}
                                    type="submit"
                                    aria-label="Buscar titular"
                                    aria-busy={loading}
                                    style={{
                                        minWidth: 120,
                                        height: 42,
                                        fontWeight: 600,
                                        opacity: loading ? 0.7 : 1,
                                        transition: 'opacity 0.2s',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: 8,
                                        border: 'none',
                                        boxShadow: 'none',
                                        fontSize: 16,
                                        background: isValidRut ? '#04A59B' : '#E0F7F6',
                                        color: '#fff',
                                    }}
                                >
                                    {loading ? (
                                        <span className="loader is-loading-custom" style={{ width: 22, height: 22, display: 'inline-block' }}>
                                            <span className="loader-inner" />
                                        </span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            Buscar
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8 }}>
                                                <circle cx="11" cy="11" r="8" stroke={isValidRut ? 'white' : '#bdbdbd'} strokeWidth="2" />
                                                <path d="M21 21L16.65 16.65" stroke={isValidRut ? 'white' : '#bdbdbd'} strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                        </span>
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

