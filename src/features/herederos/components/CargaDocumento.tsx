import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';
import '../components/styles/globalStyle.css'
import { Stepper } from "../components/Stepper";
import { UseAlert } from "../hooks/Alert";

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
  const cedulaInputRef = useRef<HTMLInputElement | null>(null);
  const poderInputRef = useRef<HTMLInputElement | null>(null);
  const posesionInputRef = useRef<HTMLInputElement | null>(null);
  
  const navigate = useNavigate();

  const { ejemploCedula, ejemploPoder, ejemploPosesion } = UseAlert();

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
      
      if (!error) {
        console.log(`Archivo ${type} seleccionado:`, file.name);
      }
    }
  }, [validateFile]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que todos los archivos estén cargados
    if (!cedulaFile.file || !poderFile.file || !posesionFile.file) {
      console.error('Faltan documentos por cargar');
      return;
    }
    
    if (!checked) {
      console.error('Debe aceptar la declaración');
      return;
    }
    
    setLoading(true);
    
    try {
      // Aquí iría la lógica de envío de archivos
      navigate('/mnherederos/ingresoher/success');
    } catch (error) {
      console.error('Error al enviar documentos:', error);
      setLoading(false);
    }
  }, [cedulaFile.file, poderFile.file, posesionFile.file, checked, navigate]);

  const renderFileUpload = useCallback((
    type: 'cedula' | 'poder' | 'posesion',
    ref: React.RefObject<HTMLInputElement | null>,
    fileState: FileState,
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ) => (
    <div className="divCargaDocumento" onClick={() => handleDivClick(type)} style={{ cursor: 'pointer' }}>
      <input 
        type="file" 
        accept='.jpg,.png,.pdf' 
        ref={ref} 
        onChange={onFileChange} 
        style={{ display:'none' }} 
        aria-label={`Cargar documento ${type}`}
      />
      
      <div className="tituloCargaDocumento">
        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
          <rect x="1.5" y="1" width="18" height="18" rx="5.55556" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.5 14H7.5" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.49902 8L10.5 6L12.501 8" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M10.5 11V6" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {ConsaludCore.Typography ? (
          <ConsaludCore.Typography 
            variant="body" 
            component="span" 
            weight={ConsaludCore.FONT_WEIGHTS?.medium}
            style={{ 
              // fontWeight: ConsaludCore.FONT_WEIGHTS?.medium || 500, // Keep in style if 'weight' prop is not enough or for fallback
              fontSize: ConsaludCore.FONT_SIZES?.md || '16px',
              color: ConsaludCore.theme?.textColors?.primary || "#505050"
            }}
          > 
            {fileState.file ? fileState.file.name : 'Cargar Archivos'}
          </ConsaludCore.Typography>
        ) : (
          <span style={{ 
            fontWeight: 500,
            fontSize: '16px',
            color: "#505050"
          }}>
            {fileState.file ? fileState.file.name : 'Cargar Archivos'}
          </span>
        )}
      </div>
      
      <div className="textoCargaDocumento">
        {fileState.error ? (
          <p style={{ 
            color: ConsaludCore.theme?.colors?.danger || "#FF5252", 
            fontSize: '12px',
            margin: 0
          }}>
            {fileState.error}
          </p>
        ) : (
          <>
            {ConsaludCore.Typography ? (
              <ConsaludCore.Typography 
                variant="caption" 
                component="p" 
                style={{ 
                  fontSize: ConsaludCore.FONT_SIZES?.xs || '12px',
                  color: ConsaludCore.theme?.colors?.gray?.medium || "#656565",
                  margin: 0
                }}
              >
                <ConsaludCore.Typography 
                  variant="caption" 
                  component="strong" 
                  weight={ConsaludCore.FONT_WEIGHTS?.bold}
                  style={{ 
                    // fontWeight: ConsaludCore.FONT_WEIGHTS?.bold || 700 // Keep in style if 'weight' prop is not enough or for fallback
                  }}
                >
                  Puedes adjuntar imágenes o documentos
                </ConsaludCore.Typography> en formato
              </ConsaludCore.Typography>
            ) : (
              <p style={{ 
                fontSize: '12px',
                color: "#656565",
                margin: 0
              }}>
                <strong>Puedes adjuntar imágenes o documentos</strong> en formato
              </p>
            )}
            {ConsaludCore.Typography ? (
              <ConsaludCore.Typography 
                variant="caption" 
                component="p" 
                style={{ 
                  fontSize: ConsaludCore.FONT_SIZES?.xs || '12px',
                  color: ConsaludCore.theme?.colors?.gray?.medium || "#656565",
                  margin: 0
                }}
              >
                JPG, PNG o PDF con un peso máximo de 6MB.
              </ConsaludCore.Typography>
            ) : (
              <p style={{ 
                fontSize: '12px',
                color: "#656565",
                margin: 0
              }}>
                JPG, PNG o PDF con un peso máximo de 6MB.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  ), [handleDivClick]);

  return(
    <>
      <div className="textoTituloComponentes">
        {ConsaludCore.Typography ? (
          <ConsaludCore.Typography 
            variant="h5" 
            component="span" 
            weight={ConsaludCore.FONT_WEIGHTS?.bold}
            style={{ 
              // fontWeight: ConsaludCore.FONT_WEIGHTS?.bold || 700, // Keep in style if 'weight' prop is not enough or for fallback
              color: ConsaludCore.theme?.textColors?.primary || "#505050"
            }}
          >
            Carga Documentos
          </ConsaludCore.Typography>
        ) : (
          <span style={{ fontWeight: 700, color: ConsaludCore.theme?.textColors?.primary || "#505050" }}>Carga Documentos</span>
        )}
      </div>
      <div className="generalContainer">
        <Stepper step={3} />
        <form onSubmit={handleSubmit}>    
          <div className="containerInfoHeredero">
            <div className="iconoGenerico">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 20V14" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M14 16L12 14L10 16" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16 20H19C19.5305 20.0001 20.0393 19.7895 20.4144 19.4144C20.7895 19.0393 21.0001 18.5305 21 18V8.94C21 7.83545 20.1045 6.94005 19 6.94H12.529C12.1978 6.93999 11.8881 6.77596 11.702 6.502L10.297 4.437C10.1109 4.16368 9.80166 4.00008 9.471 4H5C4.46952 3.99985 3.96073 4.21052 3.58563 4.58563C3.21052 4.96073 2.99985 5.46952 3 6V18C2.99985 18.5305 3.21052 19.0393 3.58563 19.4144C3.96073 19.7895 4.46952 20.0001 5 20H8" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            
                            {ConsaludCore.Typography ? (
                                <ConsaludCore.Typography 
                                  variant="body" 
                                  component="p" 
                                  weight={ConsaludCore.FONT_WEIGHTS?.medium}
                                  style={{ 
                                    // fontWeight: ConsaludCore.FONT_WEIGHTS?.medium || 500, // Keep in style if 'weight' prop is not enough or for fallback
                                    color: ConsaludCore.theme?.textColors?.primary || "#505050"
                                  }}
                                >
                                    Carga de documentos
                                </ConsaludCore.Typography>
                            ) : (
                                <p style={{ fontWeight: 500, color: ConsaludCore.theme?.textColors?.primary || "#505050" }}>Carga de documentos</p>
                            )}
                        </div>
                        
                        <div className='labelCargaDocumentoCargaDocumento'>
                            <div className="divTextoObligatorio">
                                {ConsaludCore.Typography ? (
                                  <ConsaludCore.Typography 
                                    component="span" 
                                    weight={ConsaludCore.FONT_WEIGHTS?.bold}
                                    style={{ 
                                      // fontWeight: ConsaludCore.FONT_WEIGHTS?.bold || 700, // Keep in style if 'weight' prop is not enough or for fallback
                                      fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                                      color: ConsaludCore.theme?.textColors?.primary || "#505050"
                                    }}
                                    className='divTextoObligatorioCargaDocumento'
                                  >
                                    Cédula de identidad 
                                  </ConsaludCore.Typography>
                                ) : (
                                  <span style={{ fontWeight: 700, fontSize: '14px', color: ConsaludCore.theme?.textColors?.primary || "#505050" }}>Cédula de identidad </span>
                                )}
                                {ConsaludCore.Typography ? (
                                  <ConsaludCore.Typography 
                                    component="span" 
                                    weight={ConsaludCore.FONT_WEIGHTS?.bold}
                                    style={{ 
                                      // fontWeight: ConsaludCore.FONT_WEIGHTS?.bold || 700, // Keep in style if 'weight' prop is not enough or for fallback
                                      fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                                      color: ConsaludCore.theme?.colors?.danger || "#FF5252"
                                    }}
                                    className='divTextoObligatorioRojoCargaDocumento'
                                  >
                                    Obligatorio
                                  </ConsaludCore.Typography>
                                ) : (
                                  <span style={{color: ConsaludCore.theme?.colors?.danger || "#FF5252", fontWeight: 700, fontSize: '14px'}}>Obligatorio</span>
                                )}
                            </div>
                            <div className='divObligatorioCargaDocumento'>
                                <div className='textoEjemploIconCargaDocumento'>
                                    <div 
                                      onClick={() => handleFlow("cedula")}
                                      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                                      className='textoEjemploCargaDocumento'
                                    >
                                      {ConsaludCore.Typography ? (
                                          <ConsaludCore.Typography 
                                              component="span" 
                                              weight={ConsaludCore.FONT_WEIGHTS?.bold}
                                              style={{ 
                                                // fontWeight: ConsaludCore.FONT_WEIGHTS?.bold || 700, // Keep in style if 'weight' prop is not enough or for fallback
                                                fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                                                color: ConsaludCore.theme?.colors?.primary || "#04A59B"
                                              }}
                                          >
                                              Ejemplo
                                          </ConsaludCore.Typography>
                                      ) : (
                                          <span 
                                            style={{ 
                                              color: ConsaludCore.theme?.colors?.primary || "#04A59B",
                                              fontWeight: 700,
                                              fontSize: '14px'
                                            }}
                                          >
                                            Ejemplo
                                          </span>
                                      )}
                                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                                          <circle cx="12.4998" cy="11.9998" r="9.00375" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M10.1846 9.68384C10.4216 8.66228 11.352 7.95398 12.3998 7.99747C13.5725 7.93252 14.5778 8.82611 14.6508 9.9983C14.6508 11.5028 12.4999 11.9991 12.4999 12.9996" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M12.6253 15.7502C12.6253 15.8193 12.5693 15.8753 12.5002 15.8753C12.4311 15.8753 12.3752 15.8193 12.3752 15.7502C12.3752 15.6811 12.4311 15.6252 12.5002 15.6252" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M12.5002 15.6252C12.5692 15.6252 12.6252 15.6812 12.6252 15.7502" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    </div>
                                </div>
                            </div>

                        </div> 
                        {ConsaludCore.Typography ? (
                          <ConsaludCore.Typography 
                            component="p" 
                            style={{ 
                              fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                              color: ConsaludCore.theme?.colors?.gray?.medium || "#656565"
                            }}
                            className="labelCargaDocumento"
                          >
                            Copia legible del documento oficial por ambas caras, que acredita la identidad de la persona heredera.
                          </ConsaludCore.Typography>
                        ) : (
                          <p className="labelCargaDocumento" style={{ fontSize: '14px', color: "#656565" }}>
                            Copia legible del documento oficial por ambas caras, que acredita la identidad de la persona heredera.
                          </p>
                        )}

                        {renderFileUpload('cedula', cedulaInputRef, cedulaFile, (e) => handleFileChange(e, 'cedula'))}

                        <div className='labelCargaDocumentoCargaDocumento'>
                            <div className="divTextoObligatorio">
                                {ConsaludCore.Typography ? (
                                  <ConsaludCore.Typography 
                                    component="span" 
                                    weight={ConsaludCore.FONT_WEIGHTS?.bold}
                                    style={{ 
                                      // fontWeight: ConsaludCore.FONT_WEIGHTS?.bold || 700, // Keep in style if 'weight' prop is not enough or for fallback
                                      fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                                      color: ConsaludCore.theme?.textColors?.primary || "#505050"
                                    }}
                                    className='divTextoObligatorioCargaDocumento'
                                  >
                                    Poder notarial
                                  </ConsaludCore.Typography>
                                ) : (
                                  <span style={{ fontWeight: 700, fontSize: '14px', color: ConsaludCore.theme?.textColors?.primary || "#505050" }}>Poder notarial</span>
                                )}
                                {ConsaludCore.Typography ? (
                                  <ConsaludCore.Typography 
                                    component="span" 
                                    weight={ConsaludCore.FONT_WEIGHTS?.bold}
                                    style={{ 
                                      // fontWeight: ConsaludCore.FONT_WEIGHTS?.bold || 700, // Keep in style if 'weight' prop is not enough or for fallback
                                      fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                                      color: ConsaludCore.theme?.colors?.danger || "#FF5252"
                                    }}
                                    className='divTextoObligatorioRojoCargaDocumento'
                                  >
                                    Obligatorio
                                  </ConsaludCore.Typography>
                                ) : (
                                  <span style={{color: ConsaludCore.theme?.colors?.danger || "#FF5252", fontWeight: 700, fontSize: '14px'}}>Obligatorio</span>
                                )}
                            </div>
                            <div className='divObligatorioCargaDocumento'>
                                <div className='textoEjemploIconCargaDocumento'>
                                    <div 
                                      onClick={() => handleFlow("notarial")}
                                      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                                      className='textoEjemploCargaDocumento'
                                    >
                                      {ConsaludCore.Typography ? (
                                          <ConsaludCore.Typography 
                                              component="span" 
                                              weight={ConsaludCore.FONT_WEIGHTS?.bold}
                                              style={{ 
                                                // fontWeight: ConsaludCore.FONT_WEIGHTS?.bold || 700, // Keep in style if 'weight' prop is not enough or for fallback
                                                fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                                                color: ConsaludCore.theme?.colors?.primary || "#04A59B"
                                              }}
                                          >
                                              Ejemplo
                                          </ConsaludCore.Typography>
                                      ) : (
                                          <span 
                                            style={{ 
                                              color: ConsaludCore.theme?.colors?.primary || "#04A59B",
                                              fontWeight: 700,
                                              fontSize: '14px'
                                            }}
                                          >
                                            Ejemplo
                                          </span>
                                      )}
                                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                                          <circle cx="12.4998" cy="11.9998" r="9.00375" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M10.1846 9.68384C10.4216 8.66228 11.352 7.95398 12.3998 7.99747C13.5725 7.93252 14.5778 8.82611 14.6508 9.9983C14.6508 11.5028 12.4999 11.9991 12.4999 12.9996" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M12.6253 15.7502C12.6253 15.8193 12.5693 15.8753 12.5002 15.8753C12.4311 15.8753 12.3752 15.8193 12.3752 15.7502C12.3752 15.6811 12.4311 15.6252 12.5002 15.6252" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M12.5002 15.6252C12.5692 15.6252 12.6252 15.6812 12.6252 15.7502" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    </div>
                                </div>
                            </div>
                        </div> 
                        {ConsaludCore.Typography ? (
                          <ConsaludCore.Typography 
                            component="p" 
                            style={{ 
                              fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                              color: ConsaludCore.theme?.colors?.gray?.medium || "#656565"
                            }}
                            className="labelCargaDocumento"
                          >
                            Documento legal que autoriza a la persona heredera para actuar en representación de terceros.
                          </ConsaludCore.Typography>
                        ) : (
                          <p className="labelCargaDocumento" style={{ fontSize: '14px', color: "#656565" }}>
                            Documento legal que autoriza a la persona heredera para actuar en representación de terceros.
                          </p>
                        )}
            
            {renderFileUpload('poder', poderInputRef, poderFile, (e) => handleFileChange(e, 'poder'))}

            <div className='labelCargaDocumentoCargaDocumento'>
                            <div className="divTextoObligatorio">
                                {ConsaludCore.Typography ? (
                                  <ConsaludCore.Typography 
                                    component="span" 
                                    weight={ConsaludCore.FONT_WEIGHTS?.bold}
                                    style={{ 
                                      // fontWeight: ConsaludCore.FONT_WEIGHTS?.bold || 700, // Keep in style if 'weight' prop is not enough or for fallback
                                      fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                                      color: ConsaludCore.theme?.textColors?.primary || "#505050"
                                    }}
                                    className='divTextoObligatorioCargaDocumento'
                                  >
                                    Posesión efectiva
                                  </ConsaludCore.Typography>
                                ) : (
                                  <span style={{ fontWeight: 700, fontSize: '14px', color: ConsaludCore.theme?.textColors?.primary || "#505050" }}>Posesión efectiva</span>
                                )}
                                {ConsaludCore.Typography ? (
                                  <ConsaludCore.Typography 
                                    component="span" 
                                    weight={ConsaludCore.FONT_WEIGHTS?.bold}
                                    style={{ 
                                      // fontWeight: ConsaludCore.FONT_WEIGHTS?.bold || 700, // Keep in style if 'weight' prop is not enough or for fallback
                                      fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                                      color: ConsaludCore.theme?.colors?.danger || "#FF5252"
                                    }}
                                    className='divTextoObligatorioRojoCargaDocumento'
                                  >
                                    Obligatorio
                                  </ConsaludCore.Typography>
                                ) : (
                                  <span style={{color: ConsaludCore.theme?.colors?.danger || "#FF5252", fontWeight: 700, fontSize: '14px'}}>Obligatorio</span>
                                )}
                            </div>
                            <div className='divObligatorioCargaDocumento'>
                                <div className='textoEjemploIconCargaDocumento'>
                                    <div 
                                      onClick={() => handleFlow("posesion")}
                                      style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                                      className='textoEjemploCargaDocumento'
                                    >
                                      {ConsaludCore.Typography ? (
                                          <ConsaludCore.Typography 
                                              component="span" 
                                              weight={ConsaludCore.FONT_WEIGHTS?.bold}
                                              style={{ 
                                                // fontWeight: ConsaludCore.FONT_WEIGHTS?.bold || 700, // Keep in style if 'weight' prop is not enough or for fallback
                                                fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                                                color: ConsaludCore.theme?.colors?.primary || "#04A59B"
                                              }}
                                          >
                                              Ejemplo
                                          </ConsaludCore.Typography>
                                      ) : (
                                          <span 
                                            style={{ 
                                              color: ConsaludCore.theme?.colors?.primary || "#04A59B",
                                              fontWeight: 700,
                                              fontSize: '14px'
                                            }}
                                          >
                                            Ejemplo
                                          </span>
                                      )}
                                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                                          <circle cx="12.4998" cy="11.9998" r="9.00375" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M10.1846 9.68384C10.4216 8.66228 11.352 7.95398 12.3998 7.99747C13.5725 7.93252 14.5778 8.82611 14.6508 9.9983C14.6508 11.5028 12.4999 11.9991 12.4999 12.9996" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M12.6253 15.7502C12.6253 15.8193 12.5693 15.8753 12.5002 15.8753C12.4311 15.8753 12.3752 15.8193 12.3752 15.7502C12.3752 15.6811 12.4311 15.6252 12.5002 15.6252" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          <path d="M12.5002 15.6252C12.5692 15.6252 12.6252 15.6812 12.6252 15.7502" stroke="#04A59B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    </div>
                                </div>
                            </div>
                        </div> 
                        {ConsaludCore.Typography ? (
                          <ConsaludCore.Typography 
                            component="p" 
                            style={{ 
                              fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                              color: ConsaludCore.theme?.colors?.gray?.medium || "#656565"
                            }}
                            className="labelCargaDocumento"
                          >
                            Documento legal que otorga a la persona heredera el derecho de acceder y administrar los bienes y derechos del titular fallecido
                          </ConsaludCore.Typography>
                        ) : (
                          <p className="labelCargaDocumento" style={{ fontSize: '14px', color: "#656565" }}>
                            Documento legal que otorga a la persona heredera el derecho de acceder y administrar los bienes y derechos del titular fallecido
                          </p>
                        )}
            
            {renderFileUpload('posesion', posesionInputRef, posesionFile, (e) => handleFileChange(e, 'posesion'))}
            
            <div className="divDeclaroCargaDocumento">
              <div className="checkbox-wrapper">
                <input 
                  type="checkbox" 
                  id="confirmacion" 
                  className="custom-checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                />
                <label htmlFor="confirmacion">
                  {ConsaludCore.Typography ? (
                    <ConsaludCore.Typography 
                      component="span" 
                      style={{ 
                        fontSize: ConsaludCore.FONT_SIZES?.sm || '14px',
                        color: ConsaludCore.theme?.textColors?.primary || "#333"
                      }}
                    >
                      Declaro que revisé los documentos cargados, los cuales son verídicos y cumplen con los requisitos solicitados.
                    </ConsaludCore.Typography>
                  ) : (
                    <span style={{ fontSize: '14px', color: ConsaludCore.theme?.textColors?.primary || "#333" }}>
                      Declaro que revisé los documentos cargados, los cuales son verídicos y cumplen con los requisitos solicitados.
                    </span>
                  )}
                </label>
              </div>
            </div>
            
            <div className="continue-button">
              <button
                type="submit"
                className="button is-primary is-rounded"
                disabled={!checked || !cedulaFile.file || !poderFile.file || !posesionFile.file || loading}
              >
                {ConsaludCore.Typography ? (
                  <ConsaludCore.Typography 
                    variant="button" 
                    style={{ color: ConsaludCore.theme?.colors?.white || "#FFFFFF" }}
                  >
                    {loading ? 'Enviando...' : 'Continuar'}
                  </ConsaludCore.Typography>
                ) : (
                  loading ? 'Enviando...' : "Continuar"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>            
    </>
  );
};

export {
  CargaDocumento
};