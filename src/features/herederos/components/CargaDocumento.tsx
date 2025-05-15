import React, { useState, useRef } from 'react';
import '../components/styles/globalStyle.css'
import { Stepper } from "../components/Stepper";
import { useNavigate } from 'react-router-dom';

const CargaDocumento: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigator = useNavigate();
  const handleDivClick = () => {
        fileInputRef.current?.click();
  };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        console.log("Archivo seleccionado:", file.name);
        }
    };  
    const handlenavigate = () => {
        navigator('/mnherederos/ingresoher/success');
    }

    return(
        <>
            <div className="textoTituloComponentes">
                <span className="titleComponent">
                    Carga Documentos
                </span>
            </div>
            <div className="generalContainer">
                <Stepper step={3} />
                <div className="containerInfoHeredero">
                    <div className="iconoGenerico">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M12 20V14" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M14 16L12 14L10 16" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M16 20H19C19.5305 20.0001 20.0393 19.7895 20.4144 19.4144C20.7895 19.0393 21.0001 18.5305 21 18V8.94C21 7.83545 20.1045 6.94005 19 6.94H12.529C12.1978 6.93999 11.8881 6.77596 11.702 6.502L10.297 4.437C10.1109 4.16368 9.80166 4.00008 9.471 4H5C4.46952 3.99985 3.96073 4.21052 3.58563 4.58563C3.21052 4.96073 2.99985 5.46952 3 6V18C2.99985 18.5305 3.21052 19.0393 3.58563 19.4144C3.96073 19.7895 4.46952 20.0001 5 20H8" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        
                        <p className="textoRegistro">
                        Carga de documentos
                        </p>
                    </div>
                    
                    <div className='labelCargaDocumentoCargaDocumento'>
                        <div className="divTextoObligatorio">
                            <span className='divTextoObligatorioCargaDocumento'>Cédula de identidad </span> <span className='divTextoObligatorioRojoCargaDocumento'>Obligatorio</span>
                            
                        </div>
                        <div className='divObligatorioCargaDocumento'>
                            <div className='textoEjemploIconCargaDocumento'>
                                <span className='textoEjemploCargaDocumento'>Ejemplo</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                                    <circle cx="12.4998" cy="11.9998" r="9.00375" stroke="#04A59B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M10.1846 9.68384C10.4216 8.66228 11.352 7.95398 12.3998 7.99747C13.5725 7.93252 14.5778 8.82611 14.6508 9.9983C14.6508 11.5028 12.4999 11.9991 12.4999 12.9996" stroke="#04A59B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12.6253 15.7502C12.6253 15.8193 12.5693 15.8753 12.5002 15.8753C12.4311 15.8753 12.3752 15.8193 12.3752 15.7502C12.3752 15.6811 12.4311 15.6252 12.5002 15.6252" stroke="#04A59B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12.5002 15.6252C12.5692 15.6252 12.6252 15.6812 12.6252 15.7502" stroke="#04A59B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div> 
                    <p className="labelCargaDocumento">Copia legible del documento oficial por ambas caras, que acredita la identidad de la persona heredera.</p> 

                    <div className="divCargaDocumento" onClick={handleDivClick} style={{ cursor: 'pointer' }}>
                        <input type="file" accept='.jpg,.png,.pdf' ref={fileInputRef} onChange={handleFileChange} style={{ display:'none' }} />

                        <div className="tituloCargaDocumento">
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                            <rect x="1.5" y="1" width="18" height="18" rx="5.55556" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M13.5 14H7.5" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8.49902 8L10.5 6L12.501 8" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10.5 11V6" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                            <span className="textToDataTitular"> 
                                Carga Archivos
                            </span>
                        </div>
                        <div className="textoCargaDocumento">
                            <p><strong>Puedes adjuntar imágenes o  documentos</strong> en formato</p>
                            <p>JPG, PNG o PDF con un peso máximo de 6MB.</p>
                        </div>
                    </div> 

                    <div className='labelCargaDocumentoCargaDocumento'>
                        <div className="divTextoObligatorio">
                            <span className='divTextoObligatorioCargaDocumento'>Poder notarial</span> <span className='divTextoObligatorioRojoCargaDocumento'>Obligatorio</span>
                            
                        </div>
                        <div className='divObligatorioCargaDocumento'>
                            <div className='textoEjemploIconCargaDocumento'>
                                <span className='textoEjemploCargaDocumento'>Ejemplo</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                                    <circle cx="12.4998" cy="11.9998" r="9.00375" stroke="#04A59B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M10.1846 9.68384C10.4216 8.66228 11.352 7.95398 12.3998 7.99747C13.5725 7.93252 14.5778 8.82611 14.6508 9.9983C14.6508 11.5028 12.4999 11.9991 12.4999 12.9996" stroke="#04A59B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12.6253 15.7502C12.6253 15.8193 12.5693 15.8753 12.5002 15.8753C12.4311 15.8753 12.3752 15.8193 12.3752 15.7502C12.3752 15.6811 12.4311 15.6252 12.5002 15.6252" stroke="#04A59B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12.5002 15.6252C12.5692 15.6252 12.6252 15.6812 12.6252 15.7502" stroke="#04A59B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div> 
                    <p className="labelCargaDocumento">Documento legal que autoriza a la persona heredera para actuar en representación de terceros.</p> 
                    <div className="divCargaDocumento" onClick={handleDivClick} style={{ cursor: 'pointer' }}>
                        <input type="file" accept='.jpg,.png,.pdf' ref={fileInputRef} onChange={handleFileChange} style={{ display:'none' }} />

                        <div className="tituloCargaDocumento">
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                            <rect x="1.5" y="1" width="18" height="18" rx="5.55556" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M13.5 14H7.5" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8.49902 8L10.5 6L12.501 8" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10.5 11V6" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                            <span className="textToDataTitular"> 
                                Carga Archivos
                            </span>
                        </div>
                        <div className="textoCargaDocumento">
                            <p><strong>Puedes adjuntar imágenes o  documentos</strong> en formato</p>
                            <p>JPG, PNG o PDF con un peso máximo de 6MB.</p>
                        </div>
                    </div> 

                    <div className='labelCargaDocumentoCargaDocumento'>
                        <div className="divTextoObligatorio">
                            <span className='divTextoObligatorioCargaDocumento'>Posesión efectiva</span> <span className='divTextoObligatorioRojoCargaDocumento'>Obligatorio</span>
                            
                        </div>
                        <div className='divObligatorioCargaDocumento'>
                            <div className='textoEjemploIconCargaDocumento'>
                                <span className='textoEjemploCargaDocumento'>Ejemplo</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                                    <circle cx="12.4998" cy="11.9998" r="9.00375" stroke="#04A59B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M10.1846 9.68384C10.4216 8.66228 11.352 7.95398 12.3998 7.99747C13.5725 7.93252 14.5778 8.82611 14.6508 9.9983C14.6508 11.5028 12.4999 11.9991 12.4999 12.9996" stroke="#04A59B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12.6253 15.7502C12.6253 15.8193 12.5693 15.8753 12.5002 15.8753C12.4311 15.8753 12.3752 15.8193 12.3752 15.7502C12.3752 15.6811 12.4311 15.6252 12.5002 15.6252" stroke="#04A59B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12.5002 15.6252C12.5692 15.6252 12.6252 15.6812 12.6252 15.7502" stroke="#04A59B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </div> 
                    <p className="labelCargaDocumento">Documento legal que otorga a la persona heredera el derecho de acceder y administrar los bienes y derechos del titular fallecido</p> 
                    <div className="divCargaDocumento" onClick={handleDivClick} style={{ cursor: 'pointer' }}>
                        <input type="file" accept='.jpg,.png,.pdf' ref={fileInputRef} onChange={handleFileChange} style={{ display:'none' }} />

                        <div className="tituloCargaDocumento">
                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                            <rect x="1.5" y="1" width="18" height="18" rx="5.55556" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M13.5 14H7.5" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8.49902 8L10.5 6L12.501 8" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M10.5 11V6" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                            <span className="textToDataTitular"> 
                                Carga Archivos
                            </span>
                        </div>
                        <div className="textoCargaDocumento">
                            <p><strong>Puedes adjuntar imágenes o  documentos</strong> en formato</p>
                            <p>JPG, PNG o PDF con un peso máximo de 6MB.</p>
                        </div>
                    </div> 
                    
                    <div className="divDeclaroCargaDocumento">
                        <input type="checkbox" id="confirm" />
                        <label htmlFor="confirm" className="text-sm">
                            Declaro que revisé los documentos cargados, los cuales son verídicos y cumplen con los requisitos solicitados.
                        </label>
                    </div>
                </div>
                <div className="continue-button">
                    <button type="submit" className="button is-primary is-rounded" onClick={handlenavigate}>Continuar</button>
                </div>
            </div>            
    </>
  );
};

export {
    CargaDocumento
};