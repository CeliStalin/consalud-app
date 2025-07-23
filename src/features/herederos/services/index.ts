// Utilidades de API
export * from './apiUtils';

// Servicios por dominio
export * from './herederosService';
export * from './pargenService';

// Re-exportar interfaces para facilitar importaciones
export type { Genero, Ciudad, Comuna } from './pargenService';
export type { Titular } from '../interfaces/Titular';
export type { SolicitanteResponse } from '../interfaces/Solicitante'; 