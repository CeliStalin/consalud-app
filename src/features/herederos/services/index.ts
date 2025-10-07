// Utilidades de API
export * from './apiUtils';

// Servicio principal de herederos (incluye parámetros generales)
export * from './herederosService';

// Servicio de almacenamiento de archivos
export * from './fileStorageService';

// Servicio de transformación de datos del formulario
export * from './formDataTransformer';

// Servicio de transacciones de mandatos
export * from './mandatosTransactionService';

// Re-exportar interfaces para facilitar importaciones
export type {
  DocumentFileState,
  Documento,
  FileState,
  FileStorageConfig,
} from '../interfaces/Documento';
export type {
  Calle,
  Ciudad,
  Comuna,
  Genero,
  NumeroCalle,
  Region,
  TipoDocumento,
  TipoParentesco,
} from '../interfaces/Pargen';
export type { SolicitanteResponse } from '../interfaces/Solicitante';
export type { Titular } from '../interfaces/Titular';
