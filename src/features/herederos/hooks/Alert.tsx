import Swal from "sweetalert2";
import'../components/styles/ingresoTitular.css'
 export const UseAlert = () => {
    const mostrarAlerta = () => {
        Swal.fire({
          title: 'No es posible continuar con este RUT',
          text: 'La persona sigue vigente en Consalud y no aparece como fallecida.',
          // No se usa icono para que se vea como en la imagen
          // icon: 'info',
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
          customClass:{
            confirmButton: 'boton-alerta',
            title: 'titulo-alerta',
            htmlContainer : 'sub-titulo-alerta'
          } 
        });
      };

      const mostrarAlerta4 = () => {
        Swal.fire({
          title: 'Ya existe una persona heredera registrada',
          text: 'Para modificar esta información, continúa con el proceso.',
          confirmButtonColor: '#04A59B',
          showCloseButton: true,
          showCancelButton: true,
          confirmButtonText: 'Modificar',
          cancelButtonText: 'Cancelar',
          reverseButtons: true, 
          customClass:{
            confirmButton: 'boton-alerta',
            title: 'titulo-alerta',
            htmlContainer : 'sub-titulo-alerta',
            cancelButton: 'boton-cancelar'
          } 
        });
      };
      return{
        mostrarAlerta,
        mostrarAlerta2,
        mostrarAlerta3,
        mostrarAlerta4
      }
}