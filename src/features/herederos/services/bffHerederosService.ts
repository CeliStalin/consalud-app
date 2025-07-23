/**
 * @deprecated Este archivo ha sido refactorizado por dominio.
 * 
 * Nuevos servicios organizados:
 * - herederosService.ts - Gestión de herederos, titulares, solicitantes
 * - pargenService.ts - Parámetros generales (géneros, ciudades, comunas)
 * - apiUtils.ts - Utilidades centralizadas para API
 * 
 * Importa desde '../services' en lugar de este archivo.
 */

// Re-exportar para compatibilidad temporal
export * from './herederosService';
export * from './pargenService'; 