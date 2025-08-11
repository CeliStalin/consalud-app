import Swal from "sweetalert2";
import'../components/styles/ingresoTitular.css'
import cedulaFront from '../components/styles/img/front_cedula.png';
import cedulaBack from '../components/styles/img/back_cedula.png';
import cartaPoder from '../components/styles/img/carta_poder.png';
import cartaPosesion from '../components/styles/img/posesion.png';

 export const UseAlert = () => {
    const mostrarAlerta = () => {
        Swal.fire({
          title: 'No es posible continuar con este RUT',
          text: 'La persona sigue vigente en Consalud y no aparece como fallecida.',
          confirmButtonColor: '#04A59B',
          showCloseButton: true,
          confirmButtonText: 'Entendido',
          customClass: {
            confirmButton: 'boton-alerta',
            title: 'titulo-alerta',
            htmlContainer: 'sub-titulo-alerta',
            closeButton: 'swal-close-button',
            popup: 'swal2-modal'
          }
        });
      };
    
      const mostrarAlerta2 = () => {
        Swal.fire({
          title: 'El RUT ingresado no tiene devolución',
          confirmButtonColor: '#04A59B',
          showCloseButton: true,
          confirmButtonText: 'Entendido',
          customClass:{
            confirmButton: 'boton-alerta',
            title: 'titulo-alerta',
            htmlContainer : 'sub-titulo-alerta'
          } 
        });
      };

      const mostrarAlerta3 = () => {
        Swal.fire({
          title: 'RUT no encontrado en Consalud',
          text: 'El RUT ingresado no esta asociado a ningún afiliado o exafiliado de Consalud.',
          confirmButtonColor: '#04A59B',
          showCloseButton: true,
          confirmButtonText: 'Entendido',
          allowOutsideClick: false,
          allowEscapeKey: false,
          customClass:{
            confirmButton: 'boton-alerta',
            title: 'titulo-alerta',
            htmlContainer : 'sub-titulo-alerta'
          } 
        }).then((result) => {
          // Asegurar que la alerta se cierre correctamente
          if (result.isConfirmed) {
            Swal.close();
          }
        });
      };

      const mostrarAlertaTitularHeredero = () => {
        Swal.fire({
          title: 'El titular y el heredero es el mismo',
          text: 'El RUT ingresado corresponde a<l titular. Por favor, ingrese el RUT de una persona heredera diferente.',
          confirmButtonColor: '#04A59B',
          showCloseButton: true,
          confirmButtonText: 'Entendido',
          customClass:{
            confirmButton: 'boton-alerta',
            title: 'titulo-alerta',
            htmlContainer : 'sub-titulo-alerta',
            closeButton: 'swal-close-button',
            popup: 'swal2-modal'
          }
        });
      };

      const ejemploCedula = () => {
        Swal.fire({
          title: 'Cédula de identidad',
          html: `
                <p><strong>Copia legible del documento oficial por ambas caras, que acredita la identidad de la persona heredera.</strong></p>
                <ul style="text-align: left;">
                  <li>Nombre completo y RUT</li>
                  <li>Fecha de nacimiento</li>
                  <li>Número documento</li>
                </ul>
                <div style="display: flex; gap: 20px; justify-content: center; margin-top: 20px;">
                  <img src="${cedulaFront}" alt="Anverso" width="200" />
                  <img src="${cedulaBack}" alt="Reverso" width="200" />
                </div>
              `,
              showClass: {
                popup: 'swal2-noanimation swal2-fade-in'
              },
              hideClass: {
                popup: 'swal2-noanimation swal2-fade-out'
              },
          confirmButtonColor: '#04A59B',
          showCloseButton: true,
          confirmButtonText: 'Entendido',
          customClass:{
             confirmButton: 'boton-alerta',
             title: 'titulo-alerta',
             htmlContainer : 'sub-titulo-alerta',
             popup: 'swal2-modal'
          } 
        });
      };

      const ejemploPoder = () => {
        Swal.fire({
          title: 'Poder notarial',
          html: `
                <p><strong>Documento legal que autoriza a la persona heredera para actuar en representación de terceros.</strong></p>
                <ul style="text-align: left;">
                  <li>Datos del poderdante y apoderado</li>
                  <li>Facultades otorgadas</li>
                  <li>Duración del poder</li>
                  <li>Firma ante notario</li>
                  <li>Fecha y lugar</li>
                </ul>
                <div style="display: flex; gap: 20px; justify-content: center; margin-top: 20px;">
                  <img src="${cartaPoder}" alt="Anverso" width="400" />
                </div>
              `,
           confirmButtonColor: '#04A59B',
           showCloseButton: true,
           confirmButtonText: 'Entendido',
           customClass:{
             confirmButton: 'boton-alerta',
             title: 'titulo-alerta',
             htmlContainer : 'sub-titulo-alerta'
          } 
        });
      };
      
      const ejemploPosesion = () => {
        Swal.fire({
          title: 'Posesión efectiva',
          html: `
                <p><strong>Documento legal que otorga a la persona heredera el derecho de acceder y administrar los bienes y derechos del titular (la persona fallecida).</strong></p>
                <ul style="text-align: left;">
                  <li>Datos del causante</li>
                  <li>Lista de herederos</li>
                  <li>Relación de bienes</li>
                  <li>Deudas y obligaciones (si las hay)</li>
                  <li>Declaración jurada de los herederos</li>
                  <li>Certificado de defunción</li>
                </ul>
                <div style="display: flex; gap: 20px; justify-content: center; margin-top: 20px;">
                  <img src="${cartaPosesion}" alt="Anverso" width="400" />
                </div>
              `,
           confirmButtonColor: '#04A59B',
           showCloseButton: true,
           confirmButtonText: 'Entendido',
           customClass:{
             confirmButton: 'boton-alerta',
             title: 'titulo-alerta',
             htmlContainer : 'sub-titulo-alerta'
          } 
        });
      };
      return{
        mostrarAlerta,
        mostrarAlerta2,
        mostrarAlerta3,
        mostrarAlertaTitularHeredero,
        ejemploCedula,
        ejemploPoder,
        ejemploPosesion
      }
}