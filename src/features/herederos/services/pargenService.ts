import { apiGet, getHerederosApiConfig } from './apiUtils';

// Interfaces para parámetros generales
export interface Genero {
  Codigo: string;
  Descripcion: string;
}

export interface Ciudad {
  idCiudad: number;
  idRegion: number;
  idProvincia: number;
  nombreCiudad: string;
  EstadoPar: string;
  EstadoReg: string;
}

export interface Comuna {
  idComuna: number;
  CodComuna: number;
  idCiudad: number;
  idRegion: number;
  idProvicia: number;
  NombreComuna: string;
}

/**
 * Servicio para parámetros generales (Pargen)
 * Maneja géneros, ciudades, comunas y otros parámetros del sistema
 */
export class PargenService {
  private config = getHerederosApiConfig();

  /**
   * Obtiene la lista de géneros
   */
  async getGeneros(): Promise<Genero[]> {
    const url = `${this.config.baseUrl}/api/Pargen/Generos`;
    return apiGet<Genero[]>(url, this.config, 'obtener géneros');
  }

  /**
   * Obtiene la lista de ciudades
   */
  async getCiudades(): Promise<Ciudad[]> {
    const url = `${this.config.baseUrl}/api/Pargen/CiudadesIsapre`;
    return apiGet<Ciudad[]>(url, this.config, 'obtener ciudades');
  }

  /**
   * Obtiene la lista de comunas para una ciudad específica
   * @param idCiudad - ID de la ciudad
   */
  async getComunasPorCiudad(idCiudad: number): Promise<Comuna[]> {
    const url = `${this.config.baseUrl}/api/Pargen/ComunasIsaprePorCiudad?IdCiudad=${idCiudad}`;
    return apiGet<Comuna[]>(url, this.config, 'obtener comunas por ciudad');
  }
}

// Exportar instancia única
export const pargenService = new PargenService();

// Exportar funciones individuales para compatibilidad
export const fetchGeneros = () => pargenService.getGeneros();
export const fetchCiudades = () => pargenService.getCiudades();
export const fetchComunasPorCiudad = (idCiudad: number) => pargenService.getComunasPorCiudad(idCiudad); 