/**
 * Configuración centralizada de alertas SweetAlert2
 * Consolida todos los mensajes y estilos de alertas del módulo de herederos
 */

import Swal, { SweetAlertOptions } from 'sweetalert2';
import cedulaBack from '../components/styles/img/back_cedula.png';
import cartaPoder from '../components/styles/img/carta_poder.png';
import cedulaFront from '../components/styles/img/front_cedula.png';
import cartaPosesion from '../components/styles/img/posesion.png';

/**
 * Mensajes de alerta centralizados
 */
export const ALERT_MESSAGES = {
  RUT_NO_FALLECIDO: {
    title: 'No es posible continuar con este RUT',
    text: 'El RUT asociado no corresponde a una persona fallecida.',
  },
  RUT_SIN_DEVOLUCION: {
    title: 'El RUT ingresado no tiene devolución',
    text: '',
  },
  RUT_NO_ENCONTRADO: {
    title: 'RUT no encontrado en Consalud',
    text: 'El RUT ingresado no esta asociado a ningún afiliado o exafiliado de Consalud.',
  },
  TITULAR_HEREDERO_IGUAL: {
    title: 'El titular y el heredero es el mismo',
    text: 'El RUT ingresado corresponde al titular. Por favor, ingrese el RUT de una persona heredera diferente.',
  },
  HEREDERO_YA_REGISTRADO: {
    title: 'Ya existe una persona heredera registrada',
    text: '',
  },
} as const;

/**
 * Configuración de documentos con sus descripciones e imágenes
 */
export const DOCUMENT_INFO = {
  CEDULA: {
    title: 'Cédula de identidad',
    description: 'Copia legible del documento oficial por ambas caras, que acredita la identidad de la persona heredera.',
    requirements: [
      'Nombre completo y RUT',
      'Fecha de nacimiento',
      'Número documento',
    ],
    images: [
      { src: cedulaFront, alt: 'Anverso', width: 200 },
      { src: cedulaBack, alt: 'Reverso', width: 200 },
    ],
  },
  PODER: {
    title: 'Poder notarial',
    description: 'Documento legal que autoriza a la persona heredera para actuar en representación de terceros.',
    requirements: [
      'Datos del poderdante y apoderado',
      'Facultades otorgadas',
      'Duración del poder',
      'Firma ante notario',
      'Fecha y lugar',
    ],
    images: [
      { src: cartaPoder, alt: 'Poder', width: 400 },
    ],
  },
  POSESION: {
    title: 'Posesión efectiva',
    description: 'Documento legal que otorga a la persona heredera el derecho de acceder y administrar los bienes y derechos del titular (la persona fallecida).',
    requirements: [
      'Datos del causante',
      'Lista de herederos',
      'Relación de bienes',
      'Deudas y obligaciones (si las hay)',
      'Declaración jurada de los herederos',
      'Certificado de defunción',
    ],
    images: [
      { src: cartaPosesion, alt: 'Posesión', width: 400 },
    ],
  },
} as const;

/**
 * Estilos personalizados para las alertas
 */
const BASE_CUSTOM_CLASSES = {
  confirmButton: 'boton-alerta',
  title: 'titulo-alerta',
  htmlContainer: 'sub-titulo-alerta',
  closeButton: 'swal-close-button',
  popup: 'swal2-modal',
} as const;

/**
 * Configuración base para todas las alertas
 */
const getBaseConfig = (): SweetAlertOptions => ({
  confirmButtonColor: '#04A59B',
  showCloseButton: true,
  confirmButtonText: 'Entendido',
  customClass: BASE_CUSTOM_CLASSES,
});

/**
 * Factory para crear alertas simples
 */
const showSimpleAlert = (config: { title: string; text?: string }): Promise<any> => {
  return Swal.fire({
    ...getBaseConfig(),
    title: config.title,
    text: config.text,
  });
};

/**
 * Factory para crear alertas de documentos con imágenes
 */
const showDocumentAlert = (docType: keyof typeof DOCUMENT_INFO): Promise<any> => {
  const doc = DOCUMENT_INFO[docType];

  const requirementsList = doc.requirements
    .map(req => `<li>${req}</li>`)
    .join('');

  const imagesHtml = doc.images
    .map(img => `<img src="${img.src}" alt="${img.alt}" width="${img.width}" />`)
    .join('');

  const html = `
    <p><strong>${doc.description}</strong></p>
    <ul style="text-align: left;">
      ${requirementsList}
    </ul>
    <div style="display: flex; gap: 20px; justify-content: center; margin-top: 20px;">
      ${imagesHtml}
    </div>
  `;

  return Swal.fire({
    ...getBaseConfig(),
    title: doc.title,
    html,
    showClass: {
      popup: 'swal2-noanimation swal2-fade-in',
    },
    hideClass: {
      popup: 'swal2-noanimation swal2-fade-out',
    },
  });
};

/**
 * API pública de alertas - Exportar funciones individuales
 */

/**
 * Alerta cuando el RUT no corresponde a una persona fallecida
 */
export const mostrarAlertaNoFallecido = (): Promise<any> => {
  return showSimpleAlert(ALERT_MESSAGES.RUT_NO_FALLECIDO);
};

/**
 * Alerta cuando el RUT no tiene devolución
 */
export const mostrarAlertaSinDevolucion = (): Promise<any> => {
  return showSimpleAlert(ALERT_MESSAGES.RUT_SIN_DEVOLUCION);
};

/**
 * Alerta cuando el RUT no se encuentra en Consalud
 * @param onClose - Callback a ejecutar al cerrar
 */
export const mostrarAlertaRutNoEncontrado = (onClose?: () => void): Promise<any> => {
  return Swal.fire({
    ...getBaseConfig(),
    title: ALERT_MESSAGES.RUT_NO_ENCONTRADO.title,
    text: ALERT_MESSAGES.RUT_NO_ENCONTRADO.text,
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.close();
      if (onClose) {
        onClose();
      }
    }
  });
};

/**
 * Alerta cuando el RUT del titular y heredero son iguales
 */
export const mostrarAlertaTitularHerederoIgual = (): Promise<any> => {
  return showSimpleAlert(ALERT_MESSAGES.TITULAR_HEREDERO_IGUAL);
};

/**
 * Alerta cuando ya existe un heredero registrado
 */
export const mostrarAlertaHerederoRegistrado = (): Promise<any> => {
  return showSimpleAlert(ALERT_MESSAGES.HEREDERO_YA_REGISTRADO);
};

/**
 * Muestra ejemplo de cédula de identidad
 */
export const mostrarEjemploCedula = (): Promise<any> => {
  return showDocumentAlert('CEDULA');
};

/**
 * Muestra ejemplo de poder notarial
 */
export const mostrarEjemploPoder = (): Promise<any> => {
  return showDocumentAlert('PODER');
};

/**
 * Muestra ejemplo de posesión efectiva
 */
export const mostrarEjemploPosesion = (): Promise<any> => {
  return showDocumentAlert('POSESION');
};

/**
 * Hook wrapper para mantener compatibilidad con código existente
 * @deprecated Usar las funciones exportadas directamente
 */
export const UseAlert = () => {
  return {
    mostrarAlerta: mostrarAlertaNoFallecido,
    mostrarAlerta2: mostrarAlertaSinDevolucion,
    mostrarAlerta3: mostrarAlertaRutNoEncontrado,
    mostrarAlertaTitularHeredero: mostrarAlertaTitularHerederoIgual,
    mostrarAlertaHerederoRegistrado: mostrarAlertaHerederoRegistrado,
    ejemploCedula: mostrarEjemploCedula,
    ejemploPoder: mostrarEjemploPoder,
    ejemploPosesion: mostrarEjemploPosesion,
  };
};
