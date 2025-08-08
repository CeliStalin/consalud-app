import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';
import { UseAlert } from "../hooks/Alert";
import { useStepper } from "./Stepper";
import { useTiposDocumento } from "../hooks/useTiposDocumento";
import { DocumentUploadArea } from "./DocumentUploadArea";
import { TipoDocumento } from "../interfaces/Pargen";
import './styles/globalStyle.css';

interface FileState {
  file: File | null;
  error: string | null;
}

interface DocumentFileState {
  [key: number]: FileState;
}

const CargaDocumento: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [documentFiles, setDocumentFiles] = useState<DocumentFileState>({});
  
  const navigate = useNavigate();
  const { tiposDocumento, loading: loadingTipos, error: errorTipos } = useTiposDocumento();
  const { ejemploCedula, ejemploPoder, ejemploPosesion } = UseAlert();
  const { setStep } = useStepper();

  useEffect(() => {
    setStep(3);
    return () => {};
  }, [setStep]);

  const validateFile = useCallback((file: File): string | null => {
    const maxSize = 6 * 1024 * 1024; // 6MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'] ;
    
    if (file.size > maxSize) {
      return 'El archivo debe ser menor a 6MB';
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos JPG, PNG o PDF';
    }
    
    return null;
  }, []);

  const handleFlow = useCallback(async (tipoDocumento: TipoDocumento) => {
    try {
      switch (tipoDocumento.valValor) {
        case 1: // Cédula de Identidad
          ejemploCedula();
          break;
        case 2: // Poder Notarial
          ejemploPoder();
          break;
        case 3: // Posesión Efectiva
          ejemploPosesion();
          break;
        default:
          console.warn(`Tipo de documento no reconocido: ${tipoDocumento.valValor}`);
      }
    } catch (err) {
      console.error('Error en handleFlow:', err);
    }
  }, [ejemploCedula, ejemploPoder, ejemploPosesion]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, tipoId: number) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const error = validateFile(file);
      const fileState: FileState = { file: error ? null : file, error };
      
      setDocumentFiles(prev => ({
        ...prev,
        [tipoId]: fileState
      }));
    }
  }, [validateFile]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar que todos los documentos requeridos estén cargados
    const allDocumentsLoaded = tiposDocumento.every(tipo => 
      documentFiles[tipo.valValor]?.file
    );
    
    if (!allDocumentsLoaded || !checked) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Aquí iría la lógica de envío de archivos
      console.log('Archivos a enviar:', documentFiles);
      
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navegar a la siguiente página
      navigate('/mnherederos/ingresoher/cuenta');
    } catch (error) {
      console.error('Error al enviar archivos:', error);
    } finally {
      setLoading(false);
    }
  }, [documentFiles, checked, navigate, tiposDocumento]);

  const getDescriptionForTipo = useCallback((tipo: TipoDocumento): string => {
    switch (tipo.valValor) {
      case 1: // Cédula de Identidad
        return 'Copia legible del documento oficial por ambas caras, que acredita la identidad de la persona heredera.';
      case 2: // Poder Notarial
        return 'Documento legal que autoriza a la persona heredera para actuar en representación de terceros.';
      case 3: // Posesión Efectiva
        return 'Documento legal que otorga a la persona heredera el derecho de acceder y administrar los bienes y derechos del titular fallecido.';
      default:
        return 'Documento requerido para el proceso de herencia.';
    }
  }, []);

  // Mostrar loading mientras se cargan los tipos de documento
  if (loadingTipos) {
    return (
      <div style={{ 
        padding: '60px 90px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        position: 'relative'
      }}>
        <div className="columns is-centered is-vcentered" style={{ minHeight: '60vh' }}>
          <div className="column is-narrow has-text-centered">
            <ConsaludCore.LoadingSpinner size="large" />
            <span className="ml-3">Cargando tipos de documentos...</span>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pudieron cargar los tipos de documento
  if (errorTipos) {
    return (
      <div style={{ 
        padding: '60px 90px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        position: 'relative'
      }}>
        <div className="columns is-centered is-vcentered" style={{ minHeight: '60vh' }}>
          <div className="column is-narrow has-text-centered">
            <ConsaludCore.Typography 
              variant="body" 
              component="p" 
              style={{ color: '#FF5252' }}
            >
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
                marginTop: '16px'
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
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{ 
        padding: '60px 90px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        position: 'relative'
      }}>
        {/* Title */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#E8F8F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 20V14" stroke="#00CBBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 16L12 14L10 16" stroke="#00CBBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 20H19C19.5305 20.0001 20.0393 19.7895 20.4144 19.4144C20.7895 19.0393 21.0001 18.5305 21 18V8.94C21 7.83545 20.1045 6.94005 19 6.94H12.529C12.1978 6.93999 11.8881 6.77596 11.702 6.502L10.297 4.437C10.1109 4.16368 9.80166 4.00008 9.471 4H5C4.46952 3.99985 3.96073 4.21052 3.58563 4.58563C3.21052 4.96073 2.99985 5.46952 3 6V18C2.99985 18.5305 3.21052 19.0393 3.58563 19.4144C3.96073 19.7895 4.46952 20.0001 5 20H8" stroke="#00CBBF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <ConsaludCore.Typography 
            variant="h6" 
            component="h2" 
            weight="bold"
            style={{ 
              fontSize: '1.25rem',
              color: '#505050',
              margin: 0
            }}
          >
            Carga de documentos
          </ConsaludCore.Typography>
        </div>
        
        {/* Document sections - Renderizados dinámicamente */}
        {tiposDocumento.map((tipo) => (
          <DocumentUploadArea
            key={tipo.valValor}
            fileState={documentFiles[tipo.valValor] || { file: null, error: null }}
            onFileChange={(e) => handleFileChange(e, tipo.valValor)}
            onDivClick={() => {}} // El componente interno maneja el click
            title={tipo.descripcion}
            description={getDescriptionForTipo(tipo)}
            onHelpClick={() => handleFlow(tipo)}
            showHelp={true}
          />
        ))}
        
        {/* Declaration checkbox */}
        <div style={{ 
          marginTop: '32px',
          marginBottom: '32px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px'
          }}>
            <input 
              type="checkbox" 
              id="confirmacion" 
              checked={checked}
              onChange={(e) => setChecked(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                marginTop: '2px',
                accentColor: '#00CBBF'
              }}
            />
            <label htmlFor="confirmacion" style={{ cursor: 'pointer' }}>
              <ConsaludCore.Typography 
                variant="body" 
                component="span" 
                style={{ 
                  fontSize: '14px',
                  color: '#505050',
                  lineHeight: '1.4'
                }}
              >
                Declaro que revisé los documentos cargados, los cuales son verídicos y cumplen con los requisitos solicitados.
              </ConsaludCore.Typography>
            </label>
          </div>
        </div>
        
        {/* Continue button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center'
        }}>
          <button
            type="submit"
            disabled={!checked || !tiposDocumento.every(tipo => documentFiles[tipo.valValor]?.file) || loading}
            style={{
              backgroundColor: (!checked || !tiposDocumento.every(tipo => documentFiles[tipo.valValor]?.file) || loading) ? '#E0E0E0' : '#00CBBF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (!checked || !tiposDocumento.every(tipo => documentFiles[tipo.valValor]?.file) || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px'
            }}
            onMouseEnter={(e) => {
              if (!(!checked || !tiposDocumento.every(tipo => documentFiles[tipo.valValor]?.file) || loading)) {
                e.currentTarget.style.backgroundColor = '#00A59B';
              }
            }}
            onMouseLeave={(e) => {
              if (!(!checked || !tiposDocumento.every(tipo => documentFiles[tipo.valValor]?.file) || loading)) {
                e.currentTarget.style.backgroundColor = '#00CBBF';
              }
            }}
          >
            {loading ? 'Enviando...' : 'Continuar'}
          </button>
        </div>
      </div>
    </form>
  );
};

export { CargaDocumento };
