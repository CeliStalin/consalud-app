import { formatearRut } from '../../../utils/rutValidation';
import { Documento, DocumentosResponse } from '../interfaces/Documento';
import { Calle, Ciudad, Comuna, Genero, NumeroCalle, Region, TipoDocumento, TipoParentesco } from '../interfaces/Pargen';
import { SolicitantePostRequest, SolicitanteResponse, SolicitudPostRequest } from '../interfaces/Solicitante';
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

    try {
      // Validar que la URL base esté configurada
      if (!this.config.baseUrl) {
        throw new Error('URL base de la API no configurada');
      }

      // Agregar el userName a los datos si no está presente
      const dataToSend = {
        ...solicitanteData,
        Usuario: userName || solicitanteData.Usuario
      };

      console.log('Enviando petición a:', url);
      console.log('Headers:', buildHeaders(this.config, {
        'Content-Type': 'application/json'
      }));
      console.log('Datos enviados:', dataToSend);

      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(this.config, {
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(dataToSend)
      });

      console.log('Respuesta de la API:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      // Si la respuesta es 201, la creación fue exitosa
      if (response.status === 201) {
        const responseData = await response.json().catch(() => ({}));
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

      // Manejo específico para errores comunes
      if (response.status === 503) {
        throw new Error(`503_SERVICE_UNAVAILABLE: El servicio no está disponible temporalmente. Detalles: ${errorDetails}`);
      }

      if (response.status === 400) {
        throw new Error(`400_BAD_REQUEST: Datos inválidos enviados a la API. Detalles: ${errorDetails}`);
      }

      if (response.status === 500) {
        throw new Error(`500_INTERNAL_SERVER_ERROR: Error interno del servidor. Detalles: ${errorDetails}`);
      }

      // Para cualquier otro código de respuesta, lanzar error
      throw new Error(`${response.status}_${response.statusText}: ${errorDetails}`);
    } catch (error: any) {
      // Si es un error de red, proporcionar información más clara
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('NETWORK_ERROR: Error de conexión con la API. Verifique la URL y la conectividad de red.');
      }

      // Manejo específico para errores de creación exitosa
      if (error.message && error.message.includes('201')) {
        return { success: true, status: 201 };
      }

      throw error;
    }
  }

  /**
   * Crea una nueva solicitud
   * @param solicitudData - Datos de la solicitud a crear
   * @param userName - Nombre de usuario para auditoría
   */
  async createSolicitud(solicitudData: SolicitudPostRequest, userName: string = ""): Promise<any> {
    const url = `${this.config.baseUrl}/api/Solicitud`;

    try {
      // Validar que la URL base esté configurada
      if (!this.config.baseUrl) {
        throw new Error('URL base de la API no configurada');
      }

      // Agregar el userName a los datos si no está presente
      const dataToSend = {
        ...solicitudData,
        usuarioCreacion: userName || solicitudData.usuarioCreacion
      };

      console.log('Enviando petición de solicitud a:', url);
      console.log('Datos de solicitud enviados:', dataToSend);

      const response = await fetch(url, {
        method: 'POST',
        headers: buildHeaders(this.config, {
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify(dataToSend)
      });

      console.log('Respuesta de la API de solicitud:', {
        status: response.status,
        statusText: response.statusText
      });

      // Si la respuesta es 201, la creación fue exitosa
      if (response.status === 201) {
        const responseData = await response.json().catch(() => ({}));
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

      // Manejo específico para errores comunes
      if (response.status === 503) {
        throw new Error(`503_SERVICE_UNAVAILABLE: El servicio de solicitudes no está disponible temporalmente. Detalles: ${errorDetails}`);
      }

      if (response.status === 400) {
        throw new Error(`400_BAD_REQUEST: Datos de solicitud inválidos. Detalles: ${errorDetails}`);
      }

      if (response.status === 500) {
        throw new Error(`500_INTERNAL_SERVER_ERROR: Error interno del servidor de solicitudes. Detalles: ${errorDetails}`);
      }

      // Para cualquier otro código de respuesta, lanzar error
      throw new Error(`${response.status}_${response.statusText}: ${errorDetails}`);
    } catch (error: any) {
      // Si es un error de red, proporcionar información más clara
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('NETWORK_ERROR: Error de conexión con la API de solicitudes. Verifique la URL y la conectividad de red.');
      }

      // Manejo específico para errores de creación exitosa
      if (error.message && error.message.includes('201')) {
        return { success: true, status: 201 };
      }

      throw error;
    }
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

    try {
      // Crear FormData para enviar archivos
      const formData = new FormData();

      // Agregar campos principales
      formData.append('idSolicitud', idSolicitud.toString());
      formData.append('usuarioCreacion', usuarioCreacion);
      formData.append('rutTitularFallecido', rutTitularFallecido.toString());

      // Usar los documentos que ya se pasaron como parámetro
      console.log('📄 Documentos recibidos como parámetro:', documentos);

      if (!documentos || documentos.length === 0) {
        console.error('❌ No se encontraron documentos para enviar');
        throw new Error('No se encontraron documentos para enviar');
      }

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
      console.log('🚀 Enviando petición POST a:', url);
      console.log('📤 FormData preparado:', formData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // No incluir Content-Type para FormData, el navegador lo establece automáticamente
          ...buildHeaders(this.config),
        },
        body: formData
      });

      console.log('📥 Respuesta recibida:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('Documentos enviados exitosamente:', {
        idSolicitud,
        totalDocumentos: documentos.length,
        response: result
      });

      return {
        success: true,
        status: response.status,
        data: result
      };

    } catch (error: any) {
      console.error('Error al enviar documentos:', error);

      // Manejo específico de errores
      if (error.message && error.message.includes('400')) {
        throw new Error(`400_BAD_REQUEST: Error en los datos de los documentos. Detalles: ${error.message}`);
      } else if (error.message && error.message.includes('500')) {
        throw new Error(`500_INTERNAL_SERVER_ERROR: Error interno del servidor. Detalles: ${error.message}`);
      } else if (error.message && error.message.includes('503')) {
        throw new Error(`503_SERVICE_UNAVAILABLE: El servicio de documentos no está disponible temporalmente. Detalles: ${error.message}`);
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('NETWORK_ERROR: Error de conexión con la API de documentos. Verifique la URL y la conectividad de red.');
      } else {
        throw new Error(`UNKNOWN_ERROR: Error desconocido al enviar documentos. Detalles: ${error.message}`);
      }
    }
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
