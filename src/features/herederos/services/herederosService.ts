import { formatearRut } from '../../../utils/rutValidation';
import { Calle, Ciudad, Comuna, Genero, NumeroCalle, Region, TipoDocumento } from '../interfaces/Pargen';
import { SolicitantePostRequest, SolicitanteResponse } from '../interfaces/Solicitante';
import { Titular } from '../interfaces/Titular';
import { apiGet, buildHeaders, getHerederosApiConfig } from './apiUtils';

/**
 * Servicio para gestión de herederos
 * Maneja titulares, solicitantes y parámetros generales del sistema
 */
export class HerederosService {
  private config = getHerederosApiConfig();

  // ===== MÉTODOS DE HEREDEROS =====

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
        rut: formatearRut(`${data.RutPersona}${data.RutDigito}`),
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
      if (error.message === '404') {
        throw new Error('404_NOT_FOUND');
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

    try {
      return await apiGet<SolicitanteResponse>(url, this.config, 'obtener mejor contactibilidad del solicitante');
    } catch (error: any) {
      // Manejo específico para status 412
      if (error.message && error.message.includes('412')) {
        throw new Error('412'); // Propagar el status 412 como error específico
      }
      throw error;
    }
  }

  // ===== MÉTODOS DE PARÁMETROS GENERALES =====

  /**
   * Obtiene la lista de géneros
   */
  async getGeneros(): Promise<Genero[]> {
    const url = `${this.config.baseUrl}/api/Pargen/Generos`;
    return apiGet<Genero[]>(url, this.config, 'obtener géneros');
  }

  /**
   * Obtiene la lista de regiones
   */
  async getRegiones(): Promise<Region[]> {
    const url = `${this.config.baseUrl}/api/Pargen/RegionesIsapre`;
    return apiGet<Region[]>(url, this.config, 'obtener regiones');
  }

  /**
   * Obtiene la lista de ciudades
   * @param idRegion - ID de la región (opcional)
   */
  async getCiudades(idRegion?: number): Promise<Ciudad[]> {
    const url = idRegion
      ? `${this.config.baseUrl}/api/Pargen/CiudadesIsapre?idRegion=${idRegion}`
      : `${this.config.baseUrl}/api/Pargen/CiudadesIsapre`;
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

  /**
   * Obtiene la lista de calles para una comuna específica
   * @param idComuna - ID de la comuna
   */
  async getCallesPorComuna(idComuna: number): Promise<Calle[]> {
    const url = `${this.config.baseUrl}/api/Pargen/CallesXygo?idComuna=${idComuna}`;
    return apiGet<Calle[]>(url, this.config, 'obtener calles por comuna');
  }

  /**
   * Obtiene la lista de números para una calle específica en una comuna
   * @param nombreCalle - Nombre de la calle
   * @param idComuna - ID de la comuna
   */
  async getNumerosCalle(nombreCalle: string, idComuna: number): Promise<NumeroCalle[]> {
    const url = `${this.config.baseUrl}/api/Pargen/numeroCalle?nombreCalle=${encodeURIComponent(nombreCalle)}&idComuna=${idComuna}`;
    return apiGet<NumeroCalle[]>(url, this.config, 'obtener números de calle');
  }

  /**
   * Obtiene la lista de tipos de documentos
   */
  async getTiposDocumento(): Promise<TipoDocumento[]> {
    const url = `${this.config.baseUrl}/api/Pargen/TipoDocumento`;
    return apiGet<TipoDocumento[]>(url, this.config, 'obtener tipos de documento');
  }

  /**
   * Valida el correo electrónico de un heredero
   * @param rut - RUT del heredero (solo números, sin puntos ni DV)
   * @param email - Correo electrónico a validar
   * @param userName - Nombre de usuario para auditoría
   */
  async validarCorreoElectronico(rut: number, email: string, userName: string = ""): Promise<boolean> {
    const url = `${this.config.baseUrl}/api/ValidacionContactibilidad/email?rut=${rut}&mail=${encodeURIComponent(email)}&userName=${encodeURIComponent(userName)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(this.config)
      });

      // Si la respuesta es 200, la validación es exitosa
      if (response.status === 200) {
        return true;
      }

      // Si la respuesta es 422, la validación falló
      if (response.status === 422) {
        console.error('Validación de correo electrónico falló (422):', response.statusText);
        return false;
      }

      // Para cualquier otro código de respuesta, lanzar error
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    } catch (error: any) {
      // Si hay error de red u otro tipo, también considerar como fallo de validación
      console.error('Error en validación de correo electrónico:', error);
      return false;
    }
  }

  /**
   * Valida el teléfono de un heredero
   * @param rut - RUT del heredero (solo números, sin puntos ni DV)
   * @param telefono - Teléfono a validar
   * @param userName - Nombre de usuario para auditoría
   */
  async validarTelefono(rut: number, telefono: string, userName: string = ""): Promise<boolean> {
    const url = `${this.config.baseUrl}/api/ValidacionContactibilidad/telefono?rut=${rut}&telefono=${encodeURIComponent(telefono)}&userName=${encodeURIComponent(userName)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: buildHeaders(this.config)
      });

      // Si la respuesta es 200, la validación es exitosa
      if (response.status === 200) {
        return true;
      }

      // Si la respuesta es 422, la validación falló
      if (response.status === 422) {
        console.error('Validación de teléfono falló (422):', response.statusText);
        return false;
      }

      // Para cualquier otro código de respuesta, lanzar error
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    } catch (error: any) {
      // Si hay error de red u otro tipo, también considerar como fallo de validación
      console.error('Error en validación de teléfono:', error);
      return false;
    }
  }

  /**
   * Crea un nuevo solicitante
   * @param solicitanteData - Datos del solicitante a crear
   * @param userName - Nombre de usuario para auditoría
   */
  async createSolicitante(solicitanteData: SolicitantePostRequest, userName: string = ""): Promise<any> {
    const url = `${this.config.baseUrl}/api/Solicitante`;

    try {
      // Agregar el userName a los datos si no está presente
      const dataToSend = {
        ...solicitanteData,
        Usuario: userName || solicitanteData.Usuario
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(this.config, {
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(dataToSend)
      });

      // Si la respuesta es 201, la creación fue exitosa
      if (response.status === 201) {
        return { success: true, status: 201 };
      }

      // Si la respuesta no es exitosa, lanzar error
      if (!response.ok) {
        throw new Error(`${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      // Manejo específico para errores de creación
      if (error.message && error.message.includes('201')) {
        return { success: true, status: 201 };
      }
      throw error;
    }
  }
}

// Exportar instancia única
export const herederosService = new HerederosService();

// Exportar funciones individuales para compatibilidad
export const fetchTitularByRut = (rut: number, userName: string = "") =>
  herederosService.getTitularByRut(rut, userName);

export const fetchSolicitanteMejorContactibilidad = (rut: number, userName: string = "") =>
  herederosService.getSolicitanteMejorContactibilidad(rut, userName);

export const fetchGeneros = () => herederosService.getGeneros();
export const fetchRegiones = () => herederosService.getRegiones();
export const fetchCiudades = (idRegion?: number) => herederosService.getCiudades(idRegion);
export const fetchComunasPorCiudad = (idCiudad: number) => herederosService.getComunasPorCiudad(idCiudad);
export const fetchCallesPorComuna = (idComuna: number) => herederosService.getCallesPorComuna(idComuna);
export const fetchNumerosCalle = (nombreCalle: string, idComuna: number) => herederosService.getNumerosCalle(nombreCalle, idComuna);
export const fetchTiposDocumento = () => herederosService.getTiposDocumento();
export const validarCorreoElectronico = (rut: number, email: string, userName: string = "") =>
  herederosService.validarCorreoElectronico(rut, email, userName);
export const validarTelefono = (rut: number, telefono: string, userName: string = "") =>
  herederosService.validarTelefono(rut, telefono, userName);

export const createSolicitante = (solicitanteData: SolicitantePostRequest, userName: string = "") =>
  herederosService.createSolicitante(solicitanteData, userName);
