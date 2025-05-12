import { useNavigate } from "react-router-dom";
import { Stepper } from "../components/Stepper";
import '../components/styles/globalStyle.css'


const DatosTitular = () =>{
    const navigator =  useNavigate();
    const handleClick = () => {
        navigator('/mnherederos/ingresoher/RegistroTitular');
    }
    return(
    <>
        <div  className="datosTitularContainer">
            <span className="titleComponent"><b>Datos del titular</b></span>
        </div>
        <div className="generalContainer">
        <Stepper step={1}/>

        <div className="containerTitular">
            <div className="guiaStilos">
                <div className="genericoTitular">
                    <div className="iconContainer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                            <path d="M17.5 17V19C17.5001 19.5303 17.2896 20.0389 16.9148 20.414C16.5399 20.7891 16.0314 20.9999 15.5011 21H6.5C5.96971 21.0001 5.46108 20.7896 5.08601 20.4148C4.71094 20.0399 4.50014 19.5314 4.5 19.0011V8C4.49985 7.46971 4.71037 6.96108 5.08523 6.58601C5.4601 6.21094 5.96861 6.00014 6.4989 6H8.5" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M20.5 7.5H17.5C16.6716 7.5 16 6.82843 16 6V3" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M8.5 15V5C8.5 3.89543 9.39543 3 10.5 3H16.5605C17.0909 3 17.5996 3.21071 17.9747 3.58579L19.9142 5.52532C20.2893 5.90039 20.5 6.4091 20.5 6.93954V15C20.5 16.1046 19.6046 17 18.5 17H10.5C9.39543 17 8.5 16.1046 8.5 15Z" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12.9004 11.3L14.1015 12.5L16.1004 10.5" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <span className="textToDataTitular"> 
                            Datos del titular
                        </span>
                    </div>
                    <span className="subTituloRitular">
                        Confirma que los datos del titular sean correctos.
                    </span>
              
                </div>
                    <div className="containerDatosTitular">

                        <div className="datosTitular">
                            <span >
                                <b>Carlos Manuel Torres Medina</b>
                            </span>
                            <br />
                            <span>Fecha de defunción: 12/03/2024</span>
                        </div>
                    </div>
            </div>
            <button 
                className="buttonTitular"
                onClick={handleClick}>
                <p className="colortextButton">
                    Continuar
                </p>
            </button>
        </div>
        </div>  
       </>
    )
}

export{
    DatosTitular
}