import React, { useRef, useCallback } from 'react';
import * as ConsaludCore from '@consalud/core';

interface FileState {
  file: File | null;
  error: string | null;
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
    const maxSize = 6 * 1024 * 1024; // 6MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    if (file.size > maxSize) {
      return 'El archivo debe ser menor a 6MB';
    }
    
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos JPG, PNG o PDF';
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
        {showHelp && onHelpClick && (
          <div 
            onClick={onHelpClick}
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
        )}
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
      <div 
        className="document-upload-area" 
        onClick={handleDivClick}
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
          ref={inputRef}
          onChange={handleFileChange} 
          style={{ display:'none' }} 
          aria-label={`Cargar documento ${title}`}
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
    </div>
  );
};

export { DocumentUploadArea }; 