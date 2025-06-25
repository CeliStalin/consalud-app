import { useState, useEffect, useRef } from "react";
import * as ConsaludCore from '@consalud/core'; 
import { useRutChileno } from "../hooks/useRutChileno";
import { useHerederoNavigation } from "../hooks/useHerederoNavigation";
import '../components/styles/ingresoTitular.css';
import '../../../pages/styles/IngresoHerederosPage.css';
import { useTitular } from "../contexts/TitularContext";
import UserProfileIcon from '@/assets/user-profile.svg';

const IngresoTitular = () => {
    const { goToRequisitosTitular } = useHerederoNavigation();
    const { rut, isValid: isValidRut, handleRutChange } = useRutChileno();
    const [showError, setShowError] = useState(false);
    const { buscarTitular, error, loading, titular } = useTitular();
    const [showStepperError, setShowStepperError] = useState(false);
    const hasNavigated = useRef(false);
    const [busquedaIniciada, setBusquedaIniciada] = useState(false);

    const handleBlur = () => {
        setShowError(rut.length > 0 && !isValidRut);
    };

    const handleFocus = () => {
        setShowError(false);
    };
    
    const handleFlow = async () => {
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
        await buscarTitular(rut);
        // NO navegar aquí, esperar a que el contexto esté listo
    };

    // Resetear busquedaIniciada si cambia el rut
    useEffect(() => {
        setBusquedaIniciada(false);
    }, [rut]);

    useEffect(() => {
        if (busquedaIniciada && titular && !loading && !hasNavigated.current) {
            hasNavigated.current = true;
            // Guardar el RUT en sessionStorage para persistencia temporal
            sessionStorage.setItem('rutTitular', rut);
            goToRequisitosTitular();
        }
    }, [busquedaIniciada, titular, loading, rut, goToRequisitosTitular]);

    return (
        <div className="route-container layout-stable" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <ConsaludCore.Typography variant="h5" style={{ fontWeight: 700, color: '#222', marginBottom: 24, textAlign: 'center' }}>
                Rut del titular
            </ConsaludCore.Typography>
            {showStepperError && (
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
                    <ConsaludCore.Card
                        variant="elevated"
                        padding="large"
                    >
                        <div style={{
                            minWidth: 320,
                            textAlign: 'center',
                            borderRadius: 16,
                            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                        }}>
                            <ConsaludCore.Typography variant="h6" color="#E11D48">
                                Ocurrió un error inesperado al consultar el BFF.<br />
                                Intenta nuevamente más tarde.
                            </ConsaludCore.Typography>
                            <button
                                style={{
                                    marginTop: 24,
                                    padding: '8px 24px',
                                    borderRadius: 8,
                                    background: '#04A59B',
                                    color: '#fff',
                                    border: 'none',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                                onClick={() => setShowStepperError(false)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </ConsaludCore.Card>
                </div>
            )}
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
                                  <>
                                    <span className="loader" style={{ marginRight: 8, width: 18, height: 18, border: '2px solid #fff', borderTop: '2px solid #04A59B', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                                    <ConsaludCore.Typography
                                        variant="button"
                                        color={isValidRut ? '#fff' : '#bdbdbd'}
                                        style={{ fontWeight: 600 }}
                                    >
                                        Buscando...
                                    </ConsaludCore.Typography>
                                  </>
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
                        {showError && (
                            <ConsaludCore.Typography
                                variant="caption"
                                color={ConsaludCore.theme?.textColors?.danger || "#E11D48"}
                                className="errorRut"
                                style={{ marginTop: 4, display: 'block', fontSize: 13 }}
                            >
                                RUT inválido. Ingrese un RUT válido (Ej: 12345678-9)
                            </ConsaludCore.Typography>
                        )}
                        {error && !showError && (
                          <ConsaludCore.Typography
                            variant="caption"
                            color={ConsaludCore.theme?.textColors?.danger || "#E11D48"}
                            className="errorRut"
                            style={{ marginTop: 4, display: 'block', fontSize: 13 }}
                          >
                            {error === 'BFF_ERROR_500' ? 'Error del servidor. Intente más tarde.' : error}
                          </ConsaludCore.Typography>
                        )}
                    </div>
                </form>
            </ConsaludCore.Card>
        </div>
    );
};

export { IngresoTitular };