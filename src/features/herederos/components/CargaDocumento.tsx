import * as ConsaludCore from '@consalud/core';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHeredero } from '../contexts/HerederoContext';
import { useFileStorage } from '../hooks/useFileStorage';
import { useTiposDocumento } from '../hooks/useTiposDocumento';
import { TipoDocumento } from '../interfaces/Pargen';
import {
  mostrarEjemploCedula,
  mostrarEjemploPoder,
  mostrarEjemploPosesion,
} from '../utils/alertService';
import { DocumentUploadArea } from './DocumentUploadArea';
import { useStepper } from './Stepper';
import { StorageCleanup } from './StorageCleanup';
import './styles/globalStyle.css';

const CargaDocumento: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  const navigate = useNavigate();
  const { tiposDocumento, loading: loadingTipos, error: errorTipos } = useTiposDocumento();
  const { setStep } = useStepper();
  const { heredero } = useHeredero();

  // Usar el hook de almacenamiento de archivos
  const {
    documentFiles,
    loading: fileLoading,
    error: fileError,
    handleFileChange,
    loadFilesFromStorage,
  } = useFileStorage();

  useEffect(() => {
    setStep(3);
    return () => {};
  }, [setStep]);

  // Cargar archivos desde sessionStorage cuando se monta el componente
  useEffect(() => {
    if (heredero?.rut) {
      // Agregar un pequeño retraso para asegurar que el contexto esté completamente cargado
      const timer = setTimeout(() => {
        loadFilesFromStorage(heredero.rut);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [heredero?.rut, loadFilesFromStorage]);

  // Estado para controlar si se están cargando los archivos inicialmente
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Marcar como cargado inicialmente después de un tiempo
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadComplete(true);
    }, 500); // Dar tiempo para que se carguen los archivos

    return () => clearTimeout(timer);
  }, []);
  const handleFlow = useCallback(async (tipoDocumento: TipoDocumento) => {
    try {
      switch (tipoDocumento.valValor) {
        case 1: // Cédula de Identidad
          mostrarEjemploCedula();
          break;
        case 2: // Poder Notarial
          mostrarEjemploPoder();
          break;
        case 3: // Posesión Efectiva
          mostrarEjemploPosesion();
          break;
        default:
          console.warn(`Tipo de documento no reconocido: ${tipoDocumento.valValor}`);
      }
    } catch (err) {
      console.error('Error en handleFlow:', err);
    }
  }, []);

  const handleFileInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, tipoId: number) => {
      const file = e.target.files?.[0];

      if (file && heredero?.rut) {
        const tipo = tiposDocumento.find(t => t.valValor === tipoId)?.nombre || '';
        await handleFileChange(file, tipoId, tipo, heredero.rut);
      }
    },
    [handleFileChange, heredero?.rut, tiposDocumento]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Verificar que todos los documentos requeridos estén cargados
      const allDocumentsLoaded = tiposDocumento.every(
        tipo => documentFiles[tipo.valValor]?.file || documentFiles[tipo.valValor]?.documento
      );

      if (!allDocumentsLoaded || !checked) {
        return;
      }

      setLoading(true);

      try {
        // Aquí iría la lógica de envío de archivos

        // Simular envío
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Navegar a la página de mandatos
        navigate('/mnherederos/ingresoher/mandatos');
      } catch (error) {
        // Manejar error de envío
      } finally {
        setLoading(false);
      }
    },
    [documentFiles, checked, tiposDocumento]
  );

  // Mostrar loading mientras se cargan los tipos de documento o los archivos inicialmente
  if (loadingTipos || (!initialLoadComplete && heredero?.rut)) {
    return (
      <div
        style={{
          padding: '60px 90px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          position: 'relative',
        }}
      >
        <div className="columns is-centered is-vcentered" style={{ minHeight: '60vh' }}>
          <div className="column is-narrow has-text-centered">
            <ConsaludCore.LoadingSpinner size="large" />
            <span className="ml-3">
              {loadingTipos ? 'Cargando tipos de documentos...' : 'Cargando archivos guardados...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pudieron cargar los tipos de documento
  if (errorTipos) {
    return (
      <div
        style={{
          padding: '60px 90px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          position: 'relative',
        }}
      >
        <div className="columns is-centered is-vcentered" style={{ minHeight: '60vh' }}>
          <div className="column is-narrow has-text-centered">
            <ConsaludCore.Typography variant="body" component="p" style={{ color: '#FF5252' }}>
              {errorTipos}
            </ConsaludCore.Typography>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#00CBBF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '16px',
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Componente de limpieza automática */}
      {heredero?.rut && (
        <StorageCleanup
          rut={heredero.rut}
          onCleanup={() => {
            // Recargar archivos después de la limpieza
            loadFilesFromStorage(heredero.rut);
          }}
        />
      )}

      <form onSubmit={handleSubmit} className="carga-documentos-form" style={{ width: '100%' }}>
        <div
          className="carga-documentos-card"
          style={{
            padding: '2rem 3rem',
            backgroundColor: '#FFFFFF',
            borderRadius: '1.25rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'fit-content',
            maxHeight: 'fit-content',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          {/* Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '2rem',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: '#E8F8F7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg
                width="1.25rem"
                height="1.25rem"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 20V14"
                  stroke="#00CBBF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 16L12 14L10 16"
                  stroke="#00CBBF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 20H19C19.5305 20.0001 20.0393 19.7895 20.4144 19.4144C20.7895 19.0393 21.0001 18.5305 21 18V8.94C21 7.83545 20.1045 6.94005 19 6.94H12.529C12.1978 6.93999 11.8881 6.77596 11.702 6.502L10.297 4.437C10.1109 4.16368 9.80166 4.00008 9.471 4H5C4.46952 3.99985 3.96073 4.21052 3.58563 4.58563C3.21052 4.96073 2.99985 5.46952 3 6V18C2.99985 18.5305 3.21052 19.0393 3.58563 19.4144C3.96073 19.7895 4.46952 20.0001 5 20H8"
                  stroke="#00CBBF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <ConsaludCore.Typography
              variant="h6"
              component="h2"
              weight="bold"
              style={{
                fontSize: '1.25rem',
                color: '#505050',
                margin: 0,
                lineHeight: '1.4',
              }}
            >
              Carga de documentos
            </ConsaludCore.Typography>
          </div>

          {/* Error Display */}
          {fileError && (
            <div
              style={{
                backgroundColor: '#F8D7DA',
                border: '1px solid #F5C6CB',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                marginBottom: '1.5rem',
              }}
            >
              <ConsaludCore.Typography
                variant="body"
                component="p"
                style={{ color: '#721C24', fontSize: '0.875rem', margin: 0 }}
              >
                {fileError}
              </ConsaludCore.Typography>
            </div>
          )}

          {/* Document sections - Renderizados dinámicamente */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
            }}
          >
            {tiposDocumento.map(tipo => (
              <DocumentUploadArea
                key={tipo.valValor}
                fileState={documentFiles[tipo.valValor] || { file: null, error: null }}
                onFileChange={e => handleFileInputChange(e, tipo.valValor)}
                onDivClick={() => {}} // El componente interno maneja el click
                title={tipo.nombre}
                description={tipo.descripcion}
                onHelpClick={() => handleFlow(tipo)}
                showHelp={true}
              />
            ))}
          </div>

          {/* Declaration checkbox */}
          <div
            style={{
              marginTop: '2rem',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
              }}
            >
              <input
                type="checkbox"
                id="confirmacion"
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
                style={{
                  width: '1.125rem',
                  height: '1.125rem',
                  marginTop: '0.125rem',
                  accentColor: '#00CBBF',
                }}
              />
              <label htmlFor="confirmacion" style={{ cursor: 'pointer', flex: 1 }}>
                <ConsaludCore.Typography
                  variant="body"
                  component="span"
                  style={{
                    fontSize: '0.875rem',
                    color: '#505050',
                    lineHeight: '1.5',
                  }}
                >
                  Declaro que revisé los documentos cargados, los cuales son verídicos y cumplen con
                  los requisitos solicitados.
                </ConsaludCore.Typography>
              </label>
            </div>
          </div>

          {/* Continue button */}
          <div
            className="carga-documentos-button-container"
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '0px',
              marginBottom: '2rem',
              padding: '1rem 0',
            }}
          >
            <button
              type="submit"
              disabled={
                !checked ||
                !tiposDocumento.every(
                  tipo =>
                    documentFiles[tipo.valValor]?.file || documentFiles[tipo.valValor]?.documento
                ) ||
                loading ||
                fileLoading
              }
              style={{
                backgroundColor:
                  !checked ||
                  !tiposDocumento.every(
                    tipo =>
                      documentFiles[tipo.valValor]?.file || documentFiles[tipo.valValor]?.documento
                  ) ||
                  loading ||
                  fileLoading
                    ? '#E0E0E0'
                    : '#00CBBF',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor:
                  !checked ||
                  !tiposDocumento.every(
                    tipo =>
                      documentFiles[tipo.valValor]?.file || documentFiles[tipo.valValor]?.documento
                  ) ||
                  loading ||
                  fileLoading
                    ? 'not-allowed'
                    : 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '8.75rem',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              }}
              onMouseEnter={e => {
                if (
                  !(
                    !checked ||
                    !tiposDocumento.every(
                      tipo =>
                        documentFiles[tipo.valValor]?.file ||
                        documentFiles[tipo.valValor]?.documento
                    ) ||
                    loading ||
                    fileLoading
                  )
                ) {
                  e.currentTarget.style.backgroundColor = '#00A59B';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }
              }}
              onMouseLeave={e => {
                if (
                  !(
                    !checked ||
                    !tiposDocumento.every(
                      tipo =>
                        documentFiles[tipo.valValor]?.file ||
                        documentFiles[tipo.valValor]?.documento
                    ) ||
                    loading ||
                    fileLoading
                  )
                ) {
                  e.currentTarget.style.backgroundColor = '#00CBBF';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow =
                    '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
                }
              }}
            >
              {loading || fileLoading ? 'Procesando...' : 'Continuar'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
};

export { CargaDocumento };
