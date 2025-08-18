// Utilidades de API
export * from './apiUtils';

// Servicio principal de herederos (incluye parámetros generales)
export * from './herederosService';

// Servicio de almacenamiento de archivos
export * from './fileStorageService';

// Re-exportar interfaces para facilitar importaciones
export type { Genero, Ciudad, Comuna, Calle, NumeroCalle, Region, TipoDocumento } from '../interfaces/Pargen';
export type { Titular } from '../interfaces/Titular';
export type { SolicitanteResponse } from '../interfaces/Solicitante';
export type { Documento, FileState, DocumentFileState, FileStorageConfig } from '../interfaces/Documento'; 