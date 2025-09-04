import { useHeredero } from "@/features/herederos/contexts/HerederoContext";
import { useTitular } from "@/features/herederos/contexts/TitularContext";
import { UseAlert } from "@/features/herederos/hooks/Alert";
import { useRutChileno } from "@/features/herederos/hooks/useRutChileno";
import { useStorageCleanup } from "@/features/herederos/hooks/useStorageCleanup";
import * as ConsaludCore from '@consalud/core';
import React, { useCallback, useEffect, useState } from "react";
import { validarRutsDiferentes } from '../../../utils/rutValidation';
import FormIngresoHeredero from './FormIngresoHeredero';
import RutErrorMessage from './RutErrorMessage';

interface RegistroTitularCardProps {
  buscarHeredero: (rut: string) => Promise<void>;
  error: string | null;
}

/**
 * Componente para el registro de titular con funcionalidad mejorada:
 * - El input de RUT permanece habilitado después de cargar el formulario
 * - Al cambiar el RUT, se limpian automáticamente los datos del formulario y documentos
 * - Se actualiza el session storage para mantener la consistencia de datos
 */
export const RegistroTitularCard: React.FC<RegistroTitularCardProps> = ({
  buscarHeredero,
  error
}) => {
  const { rut, isValid: isValidRut, handleRutChange, setRut } = useRutChileno();
  const { heredero, limpiarHeredero } = useHeredero();
  const { titular } = useTitular();
  const { mostrarAlertaTitularHeredero } = UseAlert();
  const { cleanupFormHerederoData, cleanupDocumentsByRut } = useStorageCleanup();

  // Estados simplificados
  const [showError, setShowError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [lastSearchedRut, setLastSearchedRut] = useState<string>('');

  // Limpiar datos de otros RUTs cuando cambie el heredero
  useEffect(() => {
    if (heredero?.rut) {
      cleanupFormHerederoData(heredero.rut);
    }
  }, [heredero?.rut, cleanupFormHerederoData]);

  // Efecto simplificado para manejar el estado del formulario
  useEffect(() => {
    const hasHeredero = heredero !== null && heredero !== undefined;
    setShowForm(hasHeredero);

    // Si hay heredero, establecer el RUT en el input
    if (hasHeredero && heredero.rut && rut !== heredero.rut) {
      setRut(heredero.rut);
      setLastSearchedRut(heredero.rut);
    }
  }, [heredero, setRut, rut]);

  // Efecto para mantener el formulario visible cuando se vuelve desde otra página
  useEffect(() => {
    // Verificar si hay datos en session storage para el RUT actual
    if (heredero?.rut) {
      const storageKey = `formHerederoData_${heredero.rut.replace(/[^0-9kK]/g, '')}`;
      const storedData = sessionStorage.getItem(storageKey);

      if (storedData) {
        setShowForm(true);
        setLastSearchedRut(heredero.rut);
      }
    }
  }, [heredero?.rut]);

  // Efecto para limpiar el formulario cuando no hay heredero
  useEffect(() => {
    if (!heredero) {
      setShowForm(false);
      setShowError(false);
      setLoading(false);
    }
  }, [heredero]);

  // Función para limpiar datos cuando cambie el RUT
  const limpiarDatosPorCambioRut = useCallback((nuevoRut: string) => {
    const rutLimpio = nuevoRut.replace(/[^0-9kK]/g, '');
    const lastRutLimpio = lastSearchedRut.replace(/[^0-9kK]/g, '');

    // Si el RUT cambió y es diferente al último buscado, limpiar datos
    if (lastSearchedRut && rutLimpio !== lastRutLimpio) {
      // Limpiar heredero actual
      if (limpiarHeredero) {
        limpiarHeredero();
      }

      // Limpiar formulario y documentos del RUT anterior
      if (lastRutLimpio) {
        cleanupFormHerederoData(lastRutLimpio);
        cleanupDocumentsByRut(lastRutLimpio);
      }

      // Limpiar formulario y documentos del nuevo RUT si es diferente
      if (rutLimpio && rutLimpio !== lastRutLimpio) {
        cleanupFormHerederoData(rutLimpio);
        cleanupDocumentsByRut(rutLimpio);
      }

      setShowForm(false);
      setShowError(false);
      setLoading(false);
    }
  }, [lastSearchedRut, limpiarHeredero, cleanupFormHerederoData, cleanupDocumentsByRut]);

  // Función simplificada para limpiar el estado
  const limpiarEstado = useCallback(() => {
    setRut('');
    setShowError(false);
    setShowForm(false);
    setLoading(false);
    setLastSearchedRut('');
    if (limpiarHeredero) {
      limpiarHeredero();
    }
  }, [setRut, limpiarHeredero]);

  // Función para comparar RUTs
  const compararRuts = useCallback((rut1: string, rut2: string): boolean => {
    return validarRutsDiferentes(rut1, rut2);
  }, []);

  // Función principal para buscar heredero
  const handleBuscarHeredero = useCallback(async (): Promise<void> => {
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');

    if (!rutLimpio) {
      return;
    }

    if (!isValidRut) {
      setShowError(true);
      return;
    }

    // Validar que el RUT del heredero no sea igual al del titular
    if (titular && titular.rut && !compararRuts(rutLimpio, titular.rut)) {
      mostrarAlertaTitularHeredero();
      limpiarEstado();
      return;
    }

    setShowError(false);
    setLoading(true);

    try {
      // Limpiar datos del RUT anterior antes de buscar el nuevo
      if (lastSearchedRut && lastSearchedRut !== rutLimpio) {
        const lastRutLimpio = lastSearchedRut.replace(/[^0-9kK]/g, '');
        cleanupFormHerederoData(lastRutLimpio);
        cleanupDocumentsByRut(lastRutLimpio);
      }

      await buscarHeredero(rutLimpio);
      setLastSearchedRut(rutLimpio);
    } catch (error: any) {
      console.error('Error en búsqueda:', error);

      // Manejar error 412 (Precondition Failed) - heredero no encontrado
      if (error.message && error.message.includes('412')) {
        // El provider ya maneja el 412 y crea un heredero vacío con campos habilitados
        // No necesitamos hacer nada adicional aquí
        setLastSearchedRut(rutLimpio);
      }
    } finally {
      setLoading(false);
    }
  }, [rut, isValidRut, buscarHeredero, titular, compararRuts, mostrarAlertaTitularHeredero, limpiarEstado, lastSearchedRut, cleanupFormHerederoData, cleanupDocumentsByRut]);

  // Manejadores de eventos del input
  const handleBlur = useCallback((): void => {
    setShowError(rut.length > 0 && !isValidRut);
  }, [rut, isValidRut]);

  const handleFocus = useCallback((): void => {
    setShowError(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const nuevoRut = e.target.value;
    handleRutChange(e);

    // Verificar si el RUT cambió significativamente
    limpiarDatosPorCambioRut(nuevoRut);
  }, [handleRutChange, limpiarDatosPorCambioRut]);

  const handleSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault();
    if (!loading) {
      handleBuscarHeredero();
    }
  }, [handleBuscarHeredero, loading]);

  return (
    <div style={{ width: '100%' }}>
      {/* Card de búsqueda */}
      <ConsaludCore.Card
        title={undefined}
        subtitle={undefined}
        variant="elevated"
        padding="large"
        className="card-elevated ingreso-card animate-fade-in-up"
        style={{ marginBottom: showForm ? 24 : 0 }}
      >
        <form
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', marginTop: 8 }}
          onSubmit={handleSubmit}
          autoComplete="off"
          aria-labelledby="rut-heredero-label"
        >
          <div style={{ width: '100%' }}>
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
                  pattern="[0-9kK\.\-]*"
                  value={rut}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  onFocus={handleFocus}
                  placeholder="Ingresar"
                  className="inputRut"
                  disabled={loading}
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
                  className={`button is-primary is-rounded proceso-button animate-fade-in-up${isValidRut ? ' buttonRut--valid' : ' buttonRut--invalid'}`}
                  disabled={!isValidRut || loading}
                  onClick={handleBuscarHeredero}
                  type="submit"
                  aria-label="Buscar heredero"
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

      {/* Formulario que aparece debajo cuando hay heredero */}
      {showForm && (
        <div style={{ marginTop: 24 }}>
          <FormIngresoHeredero showHeader={false} />
        </div>
      )}
    </div>
  );
};
