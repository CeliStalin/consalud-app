import { Titular } from '../interfaces/Titular';
import { SolicitanteResponse } from '../interfaces/Solicitante';
import { apiGet, getHerederosApiConfig } from './apiUtils';

/**
 * Servicio para gestión de herederos
 * Maneja titulares, solicitantes y operaciones relacionadas con herederos
 */
export class HerederosService {
  private config = getHerederosApiConfig();

  /**
   * Obtiene información de un titular por RUT
   * @param rut - RUT del titular (solo números)
   * @param userName - Nombre de usuario para auditoría
   */
  async getTitularByRut(rut: number, userName: string = ""): Promise<Titular> {
    const url = `${this.config.baseUrl}/api/Titular/ByRut?IdentificadorUnico=${rut}&userName=${encodeURIComponent(userName)}`;
    
    try {
      const data = await apiGet<any>(url, this.config, 'obtener titular por RUT');

      // Mapear la respuesta del BFF al modelo Titular
      const titular: Titular = {
        id: data.IdPersona,
        rut: `${data.RutPersona}-${data.RutDigito}`,
        nombre: data.NomPersona,
        apellidoPat: data.ApePaterno,
        apellidoMat: data.ApeMaterno,
        fechaDefuncion: data.FecFallecido,
        poseeFondos: data.PoseeFondos,
        poseeSolicitud: data.PoseeSolicitudes,
        indFallecido: data.IndFallecido,
      };

      return titular;
    } catch (error: any) {
      // Manejo específico para errores de titular
      if (error.message?.includes('404')) {
        throw new Error('No hay solicitantes en maestro de contactibilidad');
      }
      throw error;
    }
  }

  /**
   * Obtiene la mejor información de contactibilidad de un solicitante
   * @param rut - RUT del solicitante (solo números)
   * @param userName - Nombre de usuario para auditoría
   */
  async getSolicitanteMejorContactibilidad(rut: number, userName: string = ""): Promise<SolicitanteResponse> {
    const url = `${this.config.baseUrl}/api/Solicitante/mejorContactibilidad?IdentificadorUnico=${rut}&userName=${encodeURIComponent(userName)}`;
    return apiGet<SolicitanteResponse>(url, this.config, 'obtener mejor contactibilidad del solicitante');
  }
}

// Exportar instancia única
export const herederosService = new HerederosService();

// Exportar funciones individuales para compatibilidad
export const fetchTitularByRut = (rut: number, userName: string = "") => 
  herederosService.getTitularByRut(rut, userName);

export const fetchSolicitanteMejorContactibilidad = (rut: number, userName: string = "") => 
  herederosService.getSolicitanteMejorContactibilidad(rut, userName); 