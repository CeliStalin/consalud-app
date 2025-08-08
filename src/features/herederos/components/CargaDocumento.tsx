import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';
import { UseAlert } from "../hooks/Alert";
import { useStepper } from "./Stepper";
import './styles/globalStyle.css';

interface FileState {
  file: File | null;
  error: string | null;
}

const CargaDocumento: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  
  // Estados separados para cada tipo de documento
  const [cedulaFile, setCedulaFile] = useState<FileState>({ file: null, error: null });
  const [poderFile, setPoderFile] = useState<FileState>({ file: null, error: null });
  const [posesionFile, setPosesionFile] = useState<FileState>({ file: null, error: null });
  
  // Refs separados para cada input
  const cedulaInputRef = useRef<HTMLInputElement>(null);
  const poderInputRef = useRef<HTMLInputElement>(null);
  const posesionInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();

  const { ejemploCedula, ejemploPoder, ejemploPosesion } = UseAlert();
  const { step, setStep } = useStepper();

  useEffect(() => {
    setStep(3);
    return () => {};
  }, [setStep]);

  const handleBack = () => {
    navigate(-1);
  };

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

  const handleFlow = useCallback(async (param: string) => {
    try {
      switch (param) {
        case "cedula":
          ejemploCedula();
          break;
        case "notarial":
          ejemploPoder();
          break;
        case "posesion":
          ejemploPosesion();
          break;
        default:
          console.warn(`Parámetro no reconocido: ${param}`);
      }
    } catch (err) {
      console.error('Error en handleFlow:', err);
    }
  }, [ejemploCedula, ejemploPoder, ejemploPosesion]);

  const handleDivClick = useCallback((type: 'cedula' | 'poder' | 'posesion') => {
    switch (type) {
      case 'cedula':
        cedulaInputRef.current?.click();
        break;
      case 'poder':
        poderInputRef.current?.click();
        break;
      case 'posesion':
        posesionInputRef.current?.click();
        break;
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'cedula' | 'poder' | 'posesion') => {
    const file = e.target.files?.[0];
    
    if (file) {
      const error = validateFile(file);
      const fileState: FileState = { file: error ? null : file, error };
      
      switch (type) {
        case 'cedula':
          setCedulaFile(fileState);
          break;
        case 'poder':
          setPoderFile(fileState);
          break;
        case 'posesion':
          setPosesionFile(fileState);
          break;
      }
    }
  }, [validateFile]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cedulaFile.file || !poderFile.file || !posesionFile.file || !checked) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Aquí iría la lógica de envío de archivos
      console.log('Archivos a enviar:', {
        cedula: cedulaFile.file,
        poder: poderFile.file,
        posesion: posesionFile.file
      });
      
      // Simular envío
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navegar a la siguiente página
      navigate('/mnherederos/ingresoher/cuenta');
    } catch (error) {
      console.error('Error al enviar archivos:', error);
    } finally {
      setLoading(false);
    }
  }, [cedulaFile.file, poderFile.file, posesionFile.file, checked, navigate]);

  const renderFileUpload = useCallback((
    type: 'cedula' | 'poder' | 'posesion',
    ref: React.RefObject<HTMLInputElement | null>,
    fileState: FileState,
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ) => (
    <div 
      className="document-upload-area" 
      onClick={() => handleDivClick(type)}
      style={{ 
        cursor: 'pointer',
        border: '2px dashed #E0E0E0',
        borderRadius: '12px',
        padding: '32px 24px',
        backgroundColor: '#FAFAFA',
        transition: 'all 0.3s ease',
        marginTop: '16px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#00CBBF';
        e.currentTarget.style.backgroundColor = '#F0FDFC';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E0E0E0';
        e.currentTarget.style.backgroundColor = '#FAFAFA';
      }}
    >
      <input
        type="file"
        accept='.jpg,.png,.pdf' 
        ref={ref}
        onChange={onFileChange} 
        style={{ display:'none' }} 
        aria-label={`Cargar documento ${type}`}
      />
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '16px',
        textAlign: 'center'
      }}>
        {/* File name or upload text with icon */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px'
        }}>
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3.5" y="3.94336" width="18" height="18" rx="5.55556" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15.5 16.9434H9.5" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10.498 10.9434L12.499 8.94336L14.5 10.9434" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12.5 13.9434V8.94336" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {ConsaludCore.Typography ? (
            <ConsaludCore.Typography 
              variant="body" 
              component="p" 
              weight="medium"
              style={{ 
                fontSize: '1rem',
                color: fileState.file ? '#00CBBF' : '#505050',
                margin: 0
              }}
            >
              {fileState.file ? fileState.file.name : 'Cargar archivos'}
            </ConsaludCore.Typography>
          ) : (
            <p style={{ 
              fontWeight: 500,
              fontSize: '16px',
              color: fileState.file ? '#00CBBF' : '#505050',
              margin: 0
            }}>
              {fileState.file ? fileState.file.name : 'Cargar archivos'}
            </p>
          )}
        </div>
        
        {/* Instructions or error */}
        <div>
          {fileState.error ? (
            <p style={{ 
              color: '#FF5252', 
              fontSize: '12px',
              margin: 0
            }}>
              {fileState.error}
            </p>
          ) : (
            <p style={{ 
              fontSize: '12px',
              color: '#656565',
              margin: 0,
              lineHeight: '1.4'
            }}>
              Puedes adjuntar imágenes o documentos en formato JPG, PNG o PDF con un peso máximo de 6MB.
            </p>
          )}
        </div>
      </div>
    </div>
  ), [handleDivClick]);

  const renderDocumentSection = useCallback((
    title: string,
    description: string,
    type: 'cedula' | 'poder' | 'posesion',
    ref: React.RefObject<HTMLInputElement | null>,
    fileState: FileState,
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ) => (
    <div style={{ marginBottom: '32px' }}>
      {/* Header with title and help icon */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ConsaludCore.Typography 
            variant="body" 
            component="h3" 
            weight="bold"
            style={{ 
              fontSize: '1rem',
              color: '#505050',
              margin: 0
            }}
          >
            {title}
          </ConsaludCore.Typography>
          <span style={{ 
            color: '#FF5252', 
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            Obligatorio
          </span>
        </div>
        
        {/* Help icon */}
        <div 
          onClick={() => handleFlow(type === 'cedula' ? 'cedula' : type === 'poder' ? 'notarial' : 'posesion')}
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F0FDFC';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ConsaludCore.Typography 
            variant="caption" 
            component="span" 
            weight="bold"
            style={{ 
              fontSize: '12px',
              color: '#00CBBF'
            }}
          >
            Ejemplo
          </ConsaludCore.Typography>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9.09 9C9.3251 8.33147 9.78915 7.76811 10.4 7.40921C11.0108 7.0503 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52252 14.2151 8.06398C14.6713 8.60543 14.9211 9.30197 14.92 10.02C14.92 12 11.92 13 11.92 13" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 17H12.01" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      
      {/* Description */}
      <ConsaludCore.Typography 
        variant="caption" 
        component="p" 
        style={{ 
          fontSize: '12px',
          color: '#656565',
          marginBottom: '16px',
          lineHeight: '1.4'
        }}
      >
        {description}
      </ConsaludCore.Typography>
      
      {/* Upload area */}
      {renderFileUpload(type, ref, fileState, onFileChange)}
    </div>
  ), [handleFlow, renderFileUpload]);

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
        
        {/* Document sections */}
        {renderDocumentSection(
          'Cédula de identidad',
          'Copia legible del documento oficial por ambas caras, que acredita la identidad de la persona heredera.',
          'cedula',
          cedulaInputRef,
          cedulaFile,
          (e) => handleFileChange(e, 'cedula')
        )}
        
        {renderDocumentSection(
          'Poder notarial',
          'Documento legal que autoriza a la persona heredera para actuar en representación de terceros.',
          'poder',
          poderInputRef,
          poderFile,
          (e) => handleFileChange(e, 'poder')
        )}
        
        {renderDocumentSection(
          'Posesión efectiva',
          'Documento legal que otorga a la persona heredera el derecho de acceder y administrar los bienes y derechos del titular fallecido.',
          'posesion',
          posesionInputRef,
          posesionFile,
          (e) => handleFileChange(e, 'posesion')
        )}
        
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
            disabled={!checked || !cedulaFile.file || !poderFile.file || !posesionFile.file || loading}
            style={{
              backgroundColor: (!checked || !cedulaFile.file || !poderFile.file || !posesionFile.file || loading) ? '#E0E0E0' : '#00CBBF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 32px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (!checked || !cedulaFile.file || !poderFile.file || !posesionFile.file || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '140px'
            }}
            onMouseEnter={(e) => {
              if (!(!checked || !cedulaFile.file || !poderFile.file || !posesionFile.file || loading)) {
                e.currentTarget.style.backgroundColor = '#00A59B';
              }
            }}
            onMouseLeave={(e) => {
              if (!(!checked || !cedulaFile.file || !poderFile.file || !posesionFile.file || loading)) {
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
