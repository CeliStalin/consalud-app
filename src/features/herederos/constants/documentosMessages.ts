/**
 * Constantes para mensajes de la API de documentos
 */

export const DOCUMENTOS_MESSAGES = {
  SUCCESS: {
    DOCUMENTS_SENT: 'Los documentos han sido enviados a la API correctamente.',
    SOLICITUD_CREATED: 'Solicitud creada exitosamente.',
    SOLICITANTE_CREATED: 'Solicitante creado exitosamente.',
  },
  ERROR: {
    NO_DOCUMENTS: 'No hay documentos para enviar.',
    DOCUMENTS_SEND_FAILED: 'Error al enviar documentos a la API.',
    SOLICITUD_CREATION_FAILED: 'Error al crear la solicitud.',
    SOLICITANTE_CREATION_FAILED: 'Error al crear el solicitante.',
    NO_STORAGE_DATA: 'No se encontraron documentos en el session storage.',
    INVALID_DOCUMENT: 'Documento inválido o sin URL.',
    NETWORK_ERROR: 'Error de conexión con la API.',
    UNKNOWN_ERROR: 'Error desconocido.',
  },
  INFO: {
    SENDING_DOCUMENTS: 'Enviando documentos...',
    PROCESSING_DOCUMENTS: 'Procesando documentos...',
    CLOSING_MODAL: 'Cerrando modal en unos segundos...',
  },
} as const;

export const API_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
