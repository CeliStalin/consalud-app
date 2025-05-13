import { useNavigate } from "react-router-dom";


const RequisitosTitular = () => {
    const navigator = useNavigate();
    
    const handleButtonClick = () => {
        navigator('/mnherederos/ingresoher/DatosTitular');
    };
    return (
        <>
            <div className="textoTituloComponentes">
                <span className="titleComponent">
                    Requisitos
                </span>
            </div>

            <div className="generalContainer">
            <div className="requitosTitularBox">
                 <div className="requisitosTitularContainerInfo">
                    <div className="iconoGenerico">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M17 17V19C17.0001 19.5303 16.7896 20.0389 16.4148 20.414C16.0399 20.7891 15.5314 20.9999 15.0011 21H6C5.46971 21.0001 4.96108 20.7896 4.58601 20.4148C4.21094 20.0399 4.00014 19.5314 4 19.0011V8C3.99985 7.46971 4.21037 6.96108 4.58523 6.58601C4.9601 6.21094 5.46861 6.00014 5.9989 6H8" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M20 7.5H17C16.1716 7.5 15.5 6.82843 15.5 6V3" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M8 15V5C8 3.89543 8.89543 3 10 3H16.0605C16.5909 3 17.0996 3.21071 17.4747 3.58579L19.4142 5.52532C19.7893 5.90039 20 6.4091 20 6.93954V15C20 16.1046 19.1046 17 18 17H10C8.89543 17 8 16.1046 8 15Z" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12.4 11.3L13.6011 12.5L15.6 10.5" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>  
                        <p className="textoTitulo">
                            <strong>Requisitos</strong>
                        </p>
                    </div>
                    <p className="textoImportante">
                        Antes de comenzar, verifica que la persona heredera tenga lo siguiente:
                    </p>

                   
                        <div className="iconCheck">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                                <path d="M18.9307 12.1174C18.2383 16.3567 14.6449 19.5149 10.3517 19.6572C6.05854 19.7996 2.26383 16.8865 1.29206 12.7023C0.320293 8.5181 2.44271 4.23072 6.35921 2.46641C10.2757 0.702105 14.8931 1.9533 17.3831 5.45358L10.073 12.7346L6.98576 9.64533" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>  
                            <p className="textoTitulo">
                                <strong>Cédula de identidad vigente.</strong>
                            </p>
                        </div>    
                        <div className="iconCheck">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                                <path d="M18.9307 12.1174C18.2383 16.3567 14.6449 19.5149 10.3517 19.6572C6.05854 19.7996 2.26383 16.8865 1.29206 12.7023C0.320293 8.5181 2.44271 4.23072 6.35921 2.46641C10.2757 0.702105 14.8931 1.9533 17.3831 5.45358L10.073 12.7346L6.98576 9.64533" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>  
                            <p className="textoTitulo">
                                <strong>Posesión efectiva</strong> que acredite su condición de heredero.
                            </p>
                        </div>
                        <div className="iconCheck">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                                <path d="M18.9307 12.1174C18.2383 16.3567 14.6449 19.5149 10.3517 19.6572C6.05854 19.7996 2.26383 16.8865 1.29206 12.7023C0.320293 8.5181 2.44271 4.23072 6.35921 2.46641C10.2757 0.702105 14.8931 1.9533 17.3831 5.45358L10.073 12.7346L6.98576 9.64533" stroke="#00CBBF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>  
                            <p className="textoTitulo">
                                <strong>Poder notarial válido</strong> para actuar en representación del titular.
                            </p>
                        </div>
                </div>                    
                <button 
                           className="buttonRequisitos"
                            onClick={handleButtonClick}
                        > 
                            Entendido
                        </button>
            </div>
            </div>
        </>
    );

}

export { RequisitosTitular };