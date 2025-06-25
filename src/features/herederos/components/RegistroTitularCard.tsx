import React, { useState } from "react";
import { useRutChileno } from "@/features/herederos/hooks/useRutChileno";
import * as ConsaludCore from '@consalud/core';

interface RegistroTitularCardProps {
  buscarHeredero: (rut: string) => Promise<void>;
  error: string | null;
}

export const RegistroTitularCard: React.FC<RegistroTitularCardProps> = ({ buscarHeredero, error }) => {
  const { rut, isValid: isValidRut, handleRutChange } = useRutChileno();
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNavigator = async () => {
    const rutLimpio = rut.replace(/[^0-9kK]/g, '');
    if (!isValidRut) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setLoading(true);
    try {
      await buscarHeredero(rutLimpio);
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = () => {
    setShowError(rut.length > 0 && !isValidRut);
  };

  const handleFocus = () => {
    setShowError(false);
  };

  return (
    <ConsaludCore.Card
      variant="elevated"
      className="card-elevated ingreso-card animate-fade-in-up"
      style={{ maxWidth: 700, width: '100%', margin: '0 auto' }}
    >
      <div className="containerInfoHeredero">
        <div className="iconoGenerico">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M16.3346 21.0043H4.66379C3.7424 21.0043 2.99609 20.258 2.99609 19.3366V7.66574C2.99609 6.74436 3.7424 5.99805 4.66379 5.99805H16.3356C17.256 5.99805 18.0023 6.74436 18.0023 7.66574V19.3376C18.0023 20.258 17.256 21.0043 16.3346 21.0043Z" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.2682 10.1643C13.2446 11.1407 13.2446 12.7244 12.2682 13.7018C11.2918 14.6782 9.70813 14.6782 8.73073 13.7018C7.75332 12.7254 7.75432 11.1417 8.73073 10.1643C9.70713 9.18691 11.2908 9.18791 12.2682 10.1643" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.0008 18.4362C14.8698 18.107 14.6667 17.8109 14.4066 17.5698V17.5698C13.9674 17.1616 13.3922 16.9355 12.7919 16.9355C11.7915 16.9355 9.20641 16.9355 8.20599 16.9355C7.60574 16.9355 7.0315 17.1626 6.59132 17.5698V17.5698C6.33121 17.8109 6.12812 18.107 5.99707 18.4362" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5.99707 5.99734V4.66379C5.99707 3.7424 6.74338 2.99609 7.66476 2.99609H19.3366C20.257 2.99609 21.0033 3.7424 21.0033 4.66379V16.3356C21.0033 17.256 20.257 18.0023 19.3356 18.0023H18.0021" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className="textoRegistro">
            Registrar persona heredera
          </p>
        </div>
        <p className="textoImportante">
          Ingresa los datos de la persona heredera para la devolución.
        </p>
        <span className="rutText">
          RUT persona heredera
        </span>
        <div className="divRut">
          <input
            id="RutHeredero"
            type="text"
            inputMode="text"
            pattern="[0-9kK.-]*"
            value={rut}
            onChange={handleRutChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="12.345.678-9"
            className="inputRut"
            disabled={loading}
          />
          <button
            className={`buttonRut ${isValidRut ? 'buttonRut--valid' : 'buttonRut--invalid'}`}
            disabled={!isValidRut || loading}
            onClick={handleNavigator}
            type="button"
          >
            Buscar
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
              <path d="M15.7138 7.3382C18.1647 9.78913 18.1647 13.7629 15.7138 16.2138C13.2629 18.6647 9.28913 18.6647 6.8382 16.2138C4.38727 13.7629 4.38727 9.78913 6.8382 7.3382C9.28913 4.88727 13.2629 4.88727 15.7138 7.3382" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 19.5009L15.71 16.2109" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        {showError && (
          <span className="errorRut">
            RUT inválido. Ingrese un RUT válido (Ej: 12345678-9)
          </span>
        )}
        {error && !showError && (
          <span className="errorRut">
            {error}
          </span>
        )}
      </div>
    </ConsaludCore.Card>
  );
}; 