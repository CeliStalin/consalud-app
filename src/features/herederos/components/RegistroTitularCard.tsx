import React, { useState, useCallback } from "react";
import { useRutChileno } from "@/features/herederos/hooks/useRutChileno";
import { useHeredero } from "@/features/herederos/contexts/HerederoContext";
import * as ConsaludCore from '@consalud/core';
import FormIngresoHeredero from './FormIngresoHeredero';
import RutErrorMessage from './RutErrorMessage';

interface RegistroTitularCardProps {
  buscarHeredero: (rut: string) => Promise<void>;
  error: string | null;
}

export const RegistroTitularCard: React.FC<RegistroTitularCardProps> = ({ 
  buscarHeredero, 
  error 
}) => {
  const { rut, isValid: isValidRut, handleRutChange, setRut } = useRutChileno();
  const { heredero } = useHeredero();
  const [showError, setShowError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);

  // Si ya hay un heredero cargado, mostrar directamente el formulario y establecer el RUT
  React.useEffect(() => {
    if (heredero) {
      setShowForm(true);
      // Establecer el RUT del heredero en el input
      if (heredero.rut) {
        setRut(heredero.rut);
      }
    }
  }, [heredero, setRut]);

  const handleNavigator = useCallback(async (): Promise<void> => {
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    if (!isValidRut) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setLoading(true);
    try {
      await buscarHeredero(rutLimpio);
      // Si la búsqueda es exitosa, mostrar el formulario
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  }, [rut, isValidRut, buscarHeredero]);

  const handleBlur = useCallback((): void => {
    setShowError(rut.length > 0 && !isValidRut);
  }, [rut, isValidRut]);

  const handleFocus = useCallback((): void => {
    setShowError(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    handleRutChange(e);
  }, [handleRutChange]);

  return (
    <div style={{ width: '100%' }}>
      {/* Card de búsqueda */}
      <ConsaludCore.Card
        title={undefined}
        subtitle={undefined}
        variant="elevated"
        padding="large"
        className={`ingreso-card ${heredero ? '' : 'animate-fade-in-up'}`}
        style={{ marginBottom: showForm ? 24 : 0 }}
      >
        <form
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', marginTop: 8 }}
          onSubmit={e => { e.preventDefault(); handleNavigator(); }}
          autoComplete="off"
          aria-labelledby="rut-heredero-label"
        >
          <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ marginBottom: 32, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M16.3346 21.0043H4.66379C3.7424 21.0043 2.99609 20.258 2.99609 19.3366V7.66574C2.99609 6.74436 3.7424 5.99805 4.66379 5.99805H16.3356C17.256 5.99805 18.0023 6.74436 18.0023 7.66574V19.3376C18.0023 20.258 17.256 21.0043 16.3346 21.0043Z" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12.2682 10.1643C13.2446 11.1407 13.2446 12.7244 12.2682 13.7018C11.2918 14.6782 9.70813 14.6782 8.73073 13.7018C7.75332 12.7254 7.75432 11.1417 8.73073 10.1643C9.70713 9.18691 11.2908 9.18791 12.2682 10.1643" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15.0008 18.4362C14.8698 18.107 14.6667 17.8109 14.4066 17.5698V17.5698C13.9674 17.1616 13.3922 16.9355 12.7919 16.9355C11.7915 16.9355 9.20641 16.9355 8.20599 16.9355C7.60574 16.9355 7.0315 17.1626 6.59132 17.5698V17.5698C6.33121 17.8109 6.12812 18.107 5.99707 18.4362" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.99707 5.99734V4.66379C5.99707 3.7424 6.74338 2.99609 7.66476 2.99609H19.3366C20.257 2.99609 21.0033 3.7424 21.0033 4.66379V16.3356C21.0033 17.256 20.257 18.0023 19.3356 18.0023H18.0021" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <ConsaludCore.Typography
                  variant="subtitle1"
                  style={{ fontWeight: 700, color: '#505050', fontSize: 18, width: '100%', textAlign: 'left' }}
                >
                  Registrar persona heredera
                </ConsaludCore.Typography>
              </div>
              <ConsaludCore.Typography
                variant="body2"
                style={{ color: '#656565', fontSize: 15, textAlign: 'left' }}
              >
                Ingresa los datos de la persona heredera para la devolución.
              </ConsaludCore.Typography>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8, width: '100%' }}>
              <ConsaludCore.Typography
                variant="body2"
                style={{ color: '#505050', fontSize: 14, fontWeight: 600, textAlign: 'left' }}
              >
                RUT persona heredera
              </ConsaludCore.Typography>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <input
                  id="RutHeredero"
                  type="text"
                  inputMode="text"
                  pattern="[0-9kK.-]*"
                  value={rut}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  placeholder="Ingresar"
                  className="inputRut"
                  disabled={loading || !!heredero}
                  aria-invalid={showError}
                  aria-describedby={showError ? 'rut-error' : undefined}
                  style={{ 
                    width: 378, 
                    height: 42, 
                    flexShrink: 0, 
                    border: showError ? '1.5px solid #E11D48' : '1.5px solid #e0e0e0', 
                    borderRadius: 24, 
                    fontSize: 16, 
                    paddingLeft: 18, 
                    background: '#f8f9fa', 
                    boxShadow: '0 2px 8px rgba(4, 165, 155, 0.07)', 
                    outline: 'none', 
                    transition: 'border 0.2s' 
                  }}
                />
                
                <button
                  className={`proceso-button ${heredero ? '' : 'animate-fade-in-up'} ${isValidRut ? 'buttonRut--valid' : 'buttonRut--invalid'}${loading ? ' button--pulse' : ''}`}
                  disabled={!isValidRut || loading || !!heredero}
                  onClick={handleNavigator}
                  type="submit"
                  style={{ 
                    display: 'flex', 
                    padding: '10px 24px', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: 8, 
                    minWidth: 120, 
                    borderRadius: 24, 
                    height: 42, 
                    fontSize: 16, 
                    background: isValidRut ? '#04A59B' : '#E0F7F6', 
                    color: '#fff', 
                    border: 'none', 
                    boxShadow: 'none', 
                    fontWeight: 600, 
                    transition: 'background 0.2s', 
                    opacity: loading ? 0.7 : 1 
                  }}
                  aria-label="Buscar heredero"
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
            </div>
            
            {showError && <RutErrorMessage id="rut-error" />}
            
            {error && (
              <div style={{ color: '#E11D48', fontSize: 12, marginTop: 4, textAlign: 'left' }}>
                {error}
              </div>
            )}
          </div>
        </form>
      </ConsaludCore.Card>

      {/* Formulario que aparece debajo cuando la búsqueda es exitosa */}
      {showForm && heredero && (
        <div style={{ marginTop: 24 }}>
          <FormIngresoHeredero showHeader={false} />
        </div>
      )}
    </div>
  );
}; 