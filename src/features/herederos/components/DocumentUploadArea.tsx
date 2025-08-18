import React, { useRef, useCallback } from 'react';
import * as ConsaludCore from '@consalud/core';

interface FileState {
  file: File | null;
  error: string | null;
  documento?: {
    id: number;
    nombre: string;
    tamaño: number;
    tipo: string;
    tipoId: number;
    fechaCarga: string;
    hash?: string;
    comprimido?: boolean;
    url?: string;
    metadata?: {
      originalSize: number;
      compressedSize?: number;
      mimeType: string;
      lastModified: number;
    };
  };
}

interface DocumentUploadAreaProps {
  fileState: FileState;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDivClick: () => void;
  title: string;
  description: string;
  onHelpClick?: () => void;
  showHelp?: boolean;
}

const DocumentUploadArea: React.FC<DocumentUploadAreaProps> = ({
  fileState,
  onFileChange,
  onDivClick,
  title,
  description,
  onHelpClick,
  showHelp = true
}) => {

  const inputRef = useRef<HTMLInputElement>(null);

  const handleDivClick = useCallback(() => {
    onDivClick();
    inputRef.current?.click();
  }, [onDivClick]);

  const validateFile = useCallback((file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf'];
    
    if (file.size > maxSize) {
      return 'El archivo debe ser menor a 10MB';
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos PDF';
    }
    
    return null;
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      const error = validateFile(file);
      if (error) {
        // Si hay error, no llamar a onFileChange
        return;
      }
    }
    
    onFileChange(e);
  }, [validateFile, onFileChange]);

  return (
    <div style={{ marginBottom: '0px', flexShrink: 0 }}>
      {/* Header with title and help icon */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <ConsaludCore.Typography 
            variant="body" 
            component="h3" 
            style={{ 
              fontSize: '1rem',
              color: '#505050',
              margin: 0,
              lineHeight: '1.4',
              fontWeight: 'bold'
            }}
          >
            {title}
          </ConsaludCore.Typography>
          <span style={{ 
            color: '#FF5252', 
            fontSize: '0.75rem',
            fontWeight: 'bold',
            flexShrink: 0
          }}>
            Obligatorio
          </span>
        </div>
        
        {/* Help icon */}
        {showHelp && onHelpClick && (
          <div 
            onClick={onHelpClick}
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              transition: 'background-color 0.2s ease',
              flexShrink: 0
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
                fontSize: '0.75rem',
                color: '#00CBBF'
              }}
            >
              Ejemplo
            </ConsaludCore.Typography>
            <svg width="1rem" height="1rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="9" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.09 9C9.3251 8.33147 9.78915 7.76811 10.4 7.40921C11.0108 7.0503 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52252 14.2151 8.06398C14.6713 8.60543 14.9211 9.30197 14.92 10.02C14.92 12 11.92 13 11.92 13" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 17H12.01" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
      
      {/* Description */}
      <ConsaludCore.Typography 
        variant="caption" 
        component="p" 
        style={{ 
          fontSize: '0.75rem',
          color: '#656565',
          marginBottom: '1rem',
          lineHeight: '1.5'
        }}
      >
        {description}
      </ConsaludCore.Typography>
      
      {/* Upload area */}
      <div 
        className="document-upload-area" 
        onClick={handleDivClick}
        style={{ 
          cursor: 'pointer',
          border: `2px dashed ${(fileState.file || fileState.documento) ? '#00CBBF' : '#E0E0E0'}`,
          borderRadius: '0.75rem',
          padding: '2rem 1.5rem',
          backgroundColor: (fileState.file || fileState.documento) ? '#F0FDFC' : '#FAFAFA',
          transition: 'all 0.3s ease',
          marginTop: '1rem'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#00CBBF';
          e.currentTarget.style.backgroundColor = '#F0FDFC';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = (fileState.file || fileState.documento) ? '#00CBBF' : '#E0E0E0';
          e.currentTarget.style.backgroundColor = (fileState.file || fileState.documento) ? '#F0FDFC' : '#FAFAFA';
        }}
      >
        <input
          type="file"
          accept='.pdf' 
          ref={inputRef}
          onChange={handleFileChange} 
          style={{ display:'none' }} 
          aria-label={`Cargar documento ${title}`}
        />
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1rem',
          textAlign: 'center'
        }}>
          {/* File name or upload text with icon */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem'
          }}>
            {(fileState.file || fileState.documento) ? (
              // Check icon for loaded files
              <svg width="1.5625rem" height="1.5625rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#00CBBF" stroke="#00CBBF" strokeWidth="2"/>
                <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              // Upload icon for empty state
              <svg width="1.5625rem" height="1.5625rem" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3.5" y="3.94336" width="18" height="18" rx="5.55556" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.5 16.9434H9.5" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.498 10.9434L12.499 8.94336L14.5 10.9434" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12.5 13.9434V8.94336" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {ConsaludCore.Typography ? (
              <ConsaludCore.Typography 
                variant="body" 
                component="p" 
                style={{ 
                  fontSize: '1rem',
                  color: (fileState.file || fileState.documento) ? '#00CBBF' : '#505050',
                  margin: 0,
                  lineHeight: '1.4',
                  fontWeight: 'bold'
                }}
              >
                {(fileState.file || fileState.documento) ? 
                  (fileState.file?.name || fileState.documento?.nombre) : 
                  'Cargar archivos'
                }
              </ConsaludCore.Typography>
            ) : (
              <p style={{ 
                fontWeight: 'bold',
                fontSize: '1rem',
                color: (fileState.file || fileState.documento) ? '#00CBBF' : '#505050',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {(fileState.file || fileState.documento) ? 
                  (fileState.file?.name || fileState.documento?.nombre) : 
                  'Cargar archivos'
                }
              </p>
            )}
          </div>
          
          {/* Instructions, error, or file info */}
          <div>
            {fileState.error ? (
              <p style={{ 
                color: '#FF5252', 
                fontSize: '0.75rem',
                margin: 0,
                lineHeight: '1.4'
              }}>
                {fileState.error}
              </p>
            ) : (fileState.file || fileState.documento) ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ 
                  fontSize: '0.75rem',
                  color: '#00CBBF',
                  margin: '0 0 0.25rem 0',
                  lineHeight: '1.4',
                  fontWeight: '500'
                }}>
                  Archivo cargado correctamente
                </p>
                <p style={{ 
                  fontSize: '0.625rem',
                  color: '#656565',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  Tamaño: {((fileState.file?.size || fileState.documento?.tamaño || 0) / 1024).toFixed(1)} KB
                  {fileState.documento && (
                    <span> • Cargado: {new Date(fileState.documento.fechaCarga).toLocaleDateString('es-CL')}</span>
                  )}
                </p>
              </div>
            ) : (
              <p style={{ 
                fontSize: '0.75rem',
                color: '#505050',
                margin: 0,
                lineHeight: '1.5'
              }}>
                <span style={{ fontWeight: 'bold', color: '#333333' }}>Solo puedes adjuntar documentos</span> en formato PDF con un peso máximo de 10MB.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { DocumentUploadArea }; 