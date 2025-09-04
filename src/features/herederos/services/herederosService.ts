import { formatearRut } from '../../../utils/rutValidation';
import { Documento, DocumentosResponse } from '../interfaces/Documento';
import { Calle, Ciudad, Comuna, Genero, NumeroCalle, Region, TipoDocumento, TipoParentesco } from '../interfaces/Pargen';
import { SolicitantePostRequest, SolicitanteResponse, SolicitudPostRequest } from '../interfaces/Solicitante';
import { Titular } from '../interfaces/Titular';
import { RETRY_CONFIGS, withRetry } from '../utils/retryUtils';
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
   * Obtiene la lista de tipos de parentesco
   */
  async getTiposParentesco(): Promise<TipoParentesco[]> {
    const url = `${this.config.baseUrl}/api/Pargen/TipoParentesco`;
    return apiGet<TipoParentesco[]>(url, this.config, 'obtener tipos de parentesco');
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

    // Validar que la URL base esté configurada
    if (!this.config.baseUrl) {
      throw new Error('URL base de la API no configurada');
    }

    // Agregar el userName a los datos si no está presente
    const dataToSend = {
      ...solicitanteData,
      Usuario: userName || solicitanteData.Usuario
    };

    console.log('🚀 Iniciando creación de solicitante con reintentos automáticos');
    console.log('📡 URL:', url);
    console.log('📋 Datos:', dataToSend);

    return withRetry(async () => {
      console.log('📤 Enviando petición a /api/Solicitante');

      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(this.config, {
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(dataToSend)
      });

      console.log('📥 Respuesta de /api/Solicitante:', {
        status: response.status,
        statusText: response.statusText
      });

      // Si la respuesta es 201, la creación fue exitosa
      if (response.status === 201) {
        const responseData = await response.json().catch(() => ({}));
        console.log('✅ Solicitante creado exitosamente');
        return {
          success: true,
          status: 201,
          data: responseData
        };
      }

      // Si la respuesta no es exitosa, obtener más detalles del error
      let errorDetails = '';
      try {
        const errorResponse = await response.json();
        errorDetails = JSON.stringify(errorResponse);
      } catch {
        errorDetails = response.statusText || 'Sin detalles del error';
      }

      // Crear error con status para que withRetry pueda evaluarlo
      const error = new Error(`${response.status}_${response.statusText}: ${errorDetails}`);
      (error as any).status = response.status;
      throw error;

    }, RETRY_CONFIGS.CRITICAL, 'Creación de Solicitante');
  }

  /**
   * Crea una nueva solicitud
   * @param solicitudData - Datos de la solicitud a crear
   * @param userName - Nombre de usuario para auditoría
   */
  async createSolicitud(solicitudData: SolicitudPostRequest, userName: string = ""): Promise<any> {
    const url = `${this.config.baseUrl}/api/Solicitud`;

    // Validar que la URL base esté configurada
    if (!this.config.baseUrl) {
      throw new Error('URL base de la API no configurada');
    }

    // Agregar el userName a los datos si no está presente
    const dataToSend = {
      ...solicitudData,
      usuarioCreacion: userName || solicitudData.usuarioCreacion
    };

    console.log('🚀 Iniciando creación de solicitud con reintentos automáticos');
    console.log('📡 URL:', url);
    console.log('📋 Datos:', dataToSend);

    return withRetry(async () => {
      console.log('📤 Enviando petición a /api/Solicitud');

      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(this.config, {
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(dataToSend)
      });

      console.log('📥 Respuesta de /api/Solicitud:', {
        status: response.status,
        statusText: response.statusText
      });

      // Si la respuesta es 201, la creación fue exitosa
      if (response.status === 201) {
        const responseData = await response.json().catch(() => ({}));
        console.log('✅ Solicitud creada exitosamente');
        return {
          success: true,
          status: 201,
          data: responseData
        };
      }

      // Si la respuesta no es exitosa, obtener más detalles del error
      let errorDetails = '';
      try {
        const errorResponse = await response.json();
        errorDetails = JSON.stringify(errorResponse);
      } catch {
        errorDetails = response.statusText || 'Sin detalles del error';
      }

      // Crear error con status para que withRetry pueda evaluarlo
      const error = new Error(`${response.status}_${response.statusText}: ${errorDetails}`);
      (error as any).status = response.status;
      throw error;

    }, RETRY_CONFIGS.CRITICAL, 'Creación de Solicitud');
  }

  // ===== MÉTODOS DE DOCUMENTOS =====

  /**
   * Envía múltiples documentos a la API
   * @param idSolicitud - ID de la solicitud creada
   * @param usuarioCreacion - Usuario que crea los documentos
   * @param rutTitularFallecido - RUT del titular fallecido
   * @param documentos - Array de documentos a enviar (ya obtenidos del storage)
   */
  async enviarDocumentos(
    idSolicitud: number,
    usuarioCreacion: string,
    rutTitularFallecido: number,
    documentos: Documento[]
  ): Promise<DocumentosResponse> {
    const url = `${this.config.baseUrl}/api/Documentos`;
    console.log('🔍 HerederosService.enviarDocumentos iniciado');
    console.log('📡 URL de la API:', url);
    console.log('📋 Parámetros recibidos:', { idSolicitud, usuarioCreacion, rutTitularFallecido, totalDocumentos: documentos.length });

    // Validar que hay documentos para enviar
    if (!documentos || documentos.length === 0) {
      console.error('❌ No se encontraron documentos para enviar');
      throw new Error('No se encontraron documentos para enviar');
    }

    console.log('🚀 Iniciando envío de documentos con reintentos automáticos');
    console.log('📡 URL:', url);
    console.log('📋 Parámetros:', { idSolicitud, usuarioCreacion, rutTitularFallecido, totalDocumentos: documentos.length });

    return withRetry(async () => {
      console.log('📤 Enviando petición a /api/Documentos');

      // Crear FormData para enviar archivos
      const formData = new FormData();

      // Agregar campos principales
      formData.append('idSolicitud', idSolicitud.toString());
      formData.append('usuarioCreacion', usuarioCreacion);
      formData.append('rutTitularFallecido', rutTitularFallecido.toString());

      // Procesar cada documento de forma asíncrona
      const promises = documentos.map(async (documento, index) => {
        if (!documento.url) {
          throw new Error(`Documento con tipoId ${documento.tipoId} no tiene URL`);
        }

        try {
          // Convertir la URL del blob a File
          const response = await fetch(documento.url);
          if (!response.ok) {
            throw new Error(`Error al obtener archivo: ${response.statusText}`);
          }

          const blob = await response.blob();
          const file = new File([blob], documento.nombre, { type: 'application/pdf' });

          // Agregar campos del documento al FormData
          formData.append(`documentos[${index}].idTipoDocumento`, documento.tipoId.toString());
          formData.append(`documentos[${index}].Documento`, file);

          console.log(`Documento ${index} procesado:`, {
            tipoId: documento.tipoId,
            nombre: documento.nombre,
            tamaño: file.size
          });

        } catch (error) {
          console.error(`Error al procesar documento ${index}:`, error);
          throw error;
        }
      });

      // Esperar a que todos los documentos se procesen
      await Promise.all(promises);

      console.log('Todos los documentos procesados, enviando a la API...');

      // Realizar la petición POST
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // No incluir Content-Type para FormData, el navegador lo establece automáticamente
          ...buildHeaders(this.config),
        },
        body: formData
      });

      console.log('📥 Respuesta de /api/Documentos:', {
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }

      const result = await response.json();

      console.log('✅ Documentos enviados exitosamente:', {
        idSolicitud,
        totalDocumentos: documentos.length,
        response: result
      });

      return {
        success: true,
        status: response.status,
        data: result
      };

    }, RETRY_CONFIGS.DOCUMENTS, 'Envío de Documentos');
  }

  /**
   * Obtiene los documentos almacenados en session storage para un RUT específico
   * @param rutTitular - RUT del titular
   */
  obtenerDocumentosAlmacenados(rutTitular: number): Documento[] {
    try {
      const storageKey = `documentos_${rutTitular.toString().replace(/[^0-9kK]/g, '')}`;
      const stored = sessionStorage.getItem(storageKey);

      if (stored) {
        return JSON.parse(stored);
      }

      return [];
    } catch (error) {
      console.error('Error al obtener documentos del storage:', error);
      return [];
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
export const fetchTiposParentesco = () => herederosService.getTiposParentesco();
export const validarCorreoElectronico = (rut: number, email: string, userName: string = "") =>
  herederosService.validarCorreoElectronico(rut, email, userName);
export const validarTelefono = (rut: number, telefono: string, userName: string = "") =>
  herederosService.validarTelefono(rut, telefono, userName);

export const createSolicitante = (solicitanteData: SolicitantePostRequest, userName: string = "") =>
  herederosService.createSolicitante(solicitanteData, userName);

export const createSolicitud = (solicitudData: SolicitudPostRequest, userName: string = "") =>
  herederosService.createSolicitud(solicitudData, userName);

// Exportar funciones de documentos
export const enviarDocumentos = (
  idSolicitud: number,
  usuarioCreacion: string,
  rutTitularFallecido: number,
  documentos: Documento[]
) => herederosService.enviarDocumentos(idSolicitud, usuarioCreacion, rutTitularFallecido, documentos);

export const obtenerDocumentosAlmacenados = (rutTitular: number) =>
  herederosService.obtenerDocumentosAlmacenados(rutTitular);
