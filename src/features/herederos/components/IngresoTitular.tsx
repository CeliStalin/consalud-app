import { useNavigate } from "react-router-dom";
import {  useState } from "react";
import * as ConsaludCore from '@consalud/core'; 
import { useRutChileno } from "../hooks/useRutChileno";
import { UseAlert } from "../hooks/Alert";
import '../components/styles/ingresoTitular.css';
import '../components/styles/globalStyle.css'
import { useTitular } from "../contexts/TitularContext";


const IngresoTitular = () => {
    const navigator = useNavigate();
    const { rut, isValid: isValidRut, handleRutChange } = useRutChileno();
    const [showError, setShowError] = useState(false);
    const [touched, setTouched] = useState(false);
    const { titular, buscarTitular, error } = useTitular();
    
    const handleNavigator = async() => {
        const rutLimpio = rut.replace(/[^0-9kK]/g, '');
        if (!isValidRut) {
            return;
        }
        
        try {
            
            if (error) {
                return;
            }
            console.log("heredero: " + titular) // Este console.log parece ser de debugging de la lógica de negocio, lo mantendré por si acaso.
        navigator('/mnherederos/ingresoher/formingreso');
    } catch (err) {
        console.error(err);
    }
    }

    const handleBlur = () => {
        setTouched(true);
        setShowError(rut.length > 0 && !isValidRut);
    };

    const handleFocus = () => {
        setShowError(false);
    };
    const { mostrarAlerta,
        mostrarAlerta2,
        mostrarAlerta3,
        mostrarAlerta4} = UseAlert();

   const handleFlow = async () => {
    if (!isValidRut) {
        mostrarAlerta;
        return;
    }
    
    try {
        console.log(rut)
        await buscarTitular(rut);
        
        if (error) {
            mostrarAlerta();
            return;
        }
        if(titular === null){
            mostrarAlerta();
            return;
        }
        if(!titular?.poseeFondos){
            mostrarAlerta2();
            return;
        }
        if(titular?.poseeSolicitud){
            mostrarAlerta3();
        }
    navigator('/mnherederos/ingresoher/RequisitosTitular');
} catch (err) {
    mostrarAlerta;
}
   }

    return (
        <>
            <div className="textoTituloComponentes">
                {ConsaludCore.Typography ? (
                    <ConsaludCore.Typography variant="h5" component="span" fontWeight={ConsaludCore.FONT_WEIGHTS?.BOLD} color={ConsaludCore.theme?.textColors?.primary || "#505050"}>
                        Registrar persona titular
                    </ConsaludCore.Typography>
                ) : (
                    <span>Registrar persona titular</span> // Fallback simple si Typography aún no está disponible
                )}
            </div>


            <div className="generalContainer">
                <div className="containerIcono">
                    <div className="iconoGenerico">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M17 21V19C17 17.8954 16.1046 17 15 17H9C7.89543 17 7 17.8954 7 19V21" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 13C14.2091 13 16 11.2091 16 9C16 6.79086 14.2091 5 12 5C9.79086 5 8 6.79086 8 9C8 11.2091 9.79086 13 12 13Z" stroke="#00CBBF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {ConsaludCore.Typography ? (
                            <ConsaludCore.Typography variant="body" component="p" fontWeight={ConsaludCore.FONT_WEIGHTS?.MEDIUM} color={ConsaludCore.theme?.textColors?.primary || "#505050"}>
                                RUT del titular
                            </ConsaludCore.Typography>
                        ) : (
                            <p>RUT del titular</p>
                        )}
                    </div>
                    {ConsaludCore.Typography ? (
                        <ConsaludCore.Typography variant="caption" component="p" color={ConsaludCore.theme?.textColors?.secondary || "#656565"} className="textoImportante">
                            Ingresa el RUT del titular que corresponda a una persona afiliada con devolución.
                        </ConsaludCore.Typography>
                    ) : (
                        <p className="textoImportante">Ingresa el RUT del titular que corresponda a una persona afiliada con devolución.</p>
                    )}
                    {ConsaludCore.Typography ? (
                        <ConsaludCore.Typography variant="caption" component="span" fontWeight={ConsaludCore.FONT_WEIGHTS?.MEDIUM} color={ConsaludCore.theme?.textColors?.gray?.medium || "#808080"} className="rutText">
                            RUT persona heredera
                        </ConsaludCore.Typography>
                    ) : (
                        <span className="rutText">RUT persona heredera</span>
                    )}
                    <div className="divRut">
                        <input
                            id="RutTitular"
                            type="text"
                            inputMode="text"
                            pattern="[0-9kK.-]*"
                            value={rut}
                            onChange={handleRutChange}
                            onBlur={handleBlur}
                            onFocus={handleFocus}
                            placeholder="Ingresar"
                           className="inputRut"
                        />
                        <button 
                             className={`buttonRut ${isValidRut ? 'buttonRut--valid' : 'buttonRut--invalid'}`}  
                            disabled={!isValidRut} 
                            onClick={handleFlow}
                        > 
                            {ConsaludCore.Typography ? (
                                <ConsaludCore.Typography variant="button" color={isValidRut ? (ConsaludCore.theme?.textColors?.white || "#FFFFFF") : (ConsaludCore.theme?.textColors?.white || "#FFF")}>
                                    Buscar
                                </ConsaludCore.Typography>
                            ) : (
                                "Buscar"
                            )}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                                <path d="M11 19.5C15.4183 19.5 19 15.9183 19 11.5C19 7.08172 15.4183 3.5 11 3.5C6.58172 3.5 3 7.08172 3 11.5C3 15.9183 6.58172 19.5 11 19.5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M21 21.5L16.65 17.15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
           

                    {showError && (
                        ConsaludCore.Typography ? (
                            <ConsaludCore.Typography variant="caption" color={ConsaludCore.theme?.textColors?.danger || "#E11D48"} className="errorRut">
                                RUT inválido. Ingrese un RUT válido (Ej: 12345678-9)
                            </ConsaludCore.Typography>
                        ) : (
                            <span className="errorRut" style={{color: ConsaludCore.theme?.textColors?.danger || "#E11D48"}}>RUT inválido. Ingrese un RUT válido (Ej: 12345678-9)</span>
                        )
                    )}
                </div>
                
            </div>
        </>
    );
};


export { IngresoTitular };