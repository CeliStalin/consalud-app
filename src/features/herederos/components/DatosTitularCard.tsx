import React, { useCallback } from 'react';
import styles from './DatosTitularCard.module.css';

interface DatosTitularCardProps {
  nombre: string;
  apellidoPat: string;
  apellidoMat: string;
  fechaDefuncion: string;
  onContinuar: () => void;
  loading?: boolean;
}

export const DatosTitularCard: React.FC<DatosTitularCardProps> = ({
  nombre,
  apellidoPat,
  apellidoMat,
  fechaDefuncion,
  onContinuar,
  loading = false,
}) => {
  // Función para formatear la fecha a dd/mm/yyyy
  const formatFecha = useCallback((fecha: string): string => {
    if (!fecha) return '';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }, []);

  const handleContinuarClick = useCallback((): void => {
    if (!loading) {
      onContinuar();
    }
  }, [onContinuar, loading]);

  const nombreCompleto = `${nombre} ${apellidoPat} ${apellidoMat}`.trim();

  return (
    <div className={`${styles.cardContainer} card-elevated ingreso-card animate-fade-in-up`}>
      <div className={styles.header}>
        <span className={styles.icono}>
          {/* Icono SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
            <path d="M17.5 17V19C17.5001 19.5303 17.2896 20.0389 16.9148 20.414C16.5399 20.7891 16.0314 20.9999 15.5011 21H6.5C5.96971 21.0001 5.46108 20.7896 5.08601 20.4148C4.71094 20.0399 4.50014 19.5314 4.5 19.0011V8C4.49985 7.46971 4.71037 6.96108 5.08523 6.58601C5.4601 6.21094 5.96861 6.00014 6.4989 6H8.5" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.5 7.5H17.5C16.6716 7.5 16 6.82843 16 6V3" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path fillRule="evenodd" clipRule="evenodd" d="M8.5 15V5C8.5 3.89543 9.39543 3 10.5 3H16.5605C17.0909 3 17.5996 3.21071 17.9747 3.58579L19.9142 5.52532C20.2893 5.90039 20.5 6.4091 20.5 6.93954V15C20.5 16.1046 19.6046 17 18.5 17H10.5C9.39543 17 8.5 16.1046 8.5 15Z" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.9004 11.3L14.1015 12.5L16.1004 10.5" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className={styles.titulo}>Datos del titular</span>
      </div>
      <div className={styles.subtitulo}>Confirma que los datos del titular sean correctos.</div>
      <div className={styles.datosBox}>
        <span className={styles.nombreTitular}><b>{nombreCompleto}</b></span>
        <span className={styles.fechaDefuncion}>Fecha de defunción: {formatFecha(fechaDefuncion)}</span>
      </div>
      <div className={styles.btnContainer}>
        <button
          className={styles.btnContinuar}
          onClick={handleContinuarClick}
          type="button"
          aria-label="Continuar"
          disabled={loading}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}; 