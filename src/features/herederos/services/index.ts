// Utilidades de API
export * from './apiUtils';

// Servicio principal de herederos (incluye parámetros generales)
export * from './herederosService';

// Re-exportar interfaces para facilitar importaciones
export type { Genero, Ciudad, Comuna, Calle, Region, TipoDocumento } from '../interfaces/Pargen';
export type { Titular } from '../interfaces/Titular';
export type { SolicitanteResponse } from '../interfaces/Solicitante'; 