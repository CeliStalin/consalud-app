import axios from 'axios';

export interface MandatoResult {
  mandatoId: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  nombreCliente: string;
  apellido: string;
  apellidoPaterno?: string;
  rutCliente: string;
  digitoVerificador: string;
  mensaje: string;
  [key: string]: any; // Para otros campos que puedan venir
}

export class MandatoSoapService {
  // Cambiamos para usar un proxy local
  private baseUrl = '/api/mandato';
  
  // Mapeo de nombres de campos en el XML a nombres en la interfaz MandatoResult
  private fieldMappings: { [key: string]: string } = {
    // Mapeos estándar
    'SMANDATO': 'mandatoId',
    'Sdescorinstfinanc': 'banco',
    'DesTipoCuenta': 'tipoCuenta',
    'Snumctacte': 'numeroCuenta',
    'Snombres': 'nombreCliente',
    'Sapematerno': 'apellido',
    'Sapepaterno': 'apellidoPaterno',
    'SidRutcliente': 'rutCliente',
    'Sdigcliente': 'digitoVerificador',
    'MENSAJE': 'mensaje',
    'Sindtipo': 'indTipo',
    
    // Mapeos alternativos (diferentes nombres posibles para el mismo campo)
    'Mandato': 'mandatoId',
    'NumeroMandato': 'mandatoId',
    'Banco': 'banco',
    'NombreBanco': 'banco',
    'TipoCuenta': 'tipoCuenta',
    'NumeroCuenta': 'numeroCuenta',
    'Nombres': 'nombreCliente',
    'ApellidoPaterno': 'apellidoPaterno',
    'ApellidoMaterno': 'apellido',
    'Rut': 'rutCliente',
    'DigitoVerificador': 'digitoVerificador',
    'DV': 'digitoVerificador',
    'Mensaje': 'mensaje',
    'CodigoTipoCuenta': 'indTipo',
    
    // Versiones con prefijos comunes de namespaces
    'ns:SMANDATO': 'mandatoId',
    'ns:Sdescorinstfinanc': 'banco',
    's:SMANDATO': 'mandatoId',
    's:Sdescorinstfinanc': 'banco',
  };

  /**
   * Obtiene información del mandato
   * Esta implementación usa un proxy para evitar problemas de CORS
   */
  async getMandatoInfo(rutCliente: string, nSecMandato: string = ''): Promise<MandatoResult> {
    try {
      console.log(`Consultando información de mandato para RUT: ${rutCliente}, Mandato: ${nSecMandato || 'No especificado'}`);
      
      // Construir el envelope SOAP directamente
      const soapEnvelope = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:con="Consalud.Caja.Servicios">
          <soapenv:Header/>
          <soapenv:Body>
            <con:TraeInfoMandato>
              <con:pCliente>${rutCliente}</con:pCliente>
              <con:pNSecMandato>${nSecMandato}</con:pNSecMandato>
            </con:TraeInfoMandato>
          </soapenv:Body>
        </soapenv:Envelope>
      `;
      
      // Hacer la petición con el XML ya preparado y los headers correctos
      const response = await axios.post(this.baseUrl, soapEnvelope, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': 'Consalud.Caja.Servicios/ISvcMandato/TraeInfoMandato'
        }
      });
      
      // Procesar la respuesta
      if (response.status === 200 && response.data) {
        // Si la respuesta ya viene procesada desde el backend
        if (typeof response.data === 'object' && (response.data.mandatoId || response.data.banco)) {
          console.log('Respuesta procesada recibida del proxy:', response.data);
          return response.data;
        }
        
        // Si la respuesta viene como XML, procesarla
        if (typeof response.data === 'string' && response.data.includes('<')) {
          console.log('Respuesta XML recibida, procesando:', response.data);
          return this.processXmlResponse(response.data, rutCliente);
        }
        
        // Si viene como objeto pero no en el formato esperado
        console.log('Respuesta no reconocida recibida del proxy:', response.data);
        
        // Verificar si hay datos en un formato diferente
        if (response.data.result) {
          return this.mapApiResponseToResult(response.data.result, rutCliente);
        }
      }
      
      // Retornar objeto vacío con mensaje
      return {
        mandatoId: '',
        banco: '',
        tipoCuenta: '',
        numeroCuenta: '',
        nombreCliente: '',
        apellido: '',
        rutCliente: rutCliente,
        digitoVerificador: '',
        mensaje: 'No se pudo obtener información del servicio'
      };
    } catch (error) {
      console.error('Error al obtener información del mandato:', error);
      
      // Verificar si tenemos detalle del error en la respuesta
      let errorMessage = 'Error en la comunicación con el servicio';
      
      if (axios.isAxiosError(error) && error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Retornar objeto vacío con mensaje de error
      return {
        mandatoId: '',
        banco: '',
        tipoCuenta: '',
        numeroCuenta: '',
        nombreCliente: '',
        apellido: '',
        rutCliente: rutCliente,
        digitoVerificador: '',
        mensaje: errorMessage
      };
    }
  }
  
  /**
   * Procesa una respuesta XML y extrae los datos
   */
  private processXmlResponse(xmlText: string, rutCliente: string): MandatoResult {
    console.log('Procesando respuesta XML:', xmlText);
    
    // Parsear el XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Extraer los datos y retornarlos
    return this.extractDataFromXml(xmlDoc, rutCliente);
  }
  
  /**
   * Mapea una respuesta de API a nuestro formato de resultado
   */
  private mapApiResponseToResult(apiResponse: any, rutCliente: string): MandatoResult {
    // Crear el objeto base
    const result: MandatoResult = {
      mandatoId: '',
      banco: '',
      tipoCuenta: '',
      numeroCuenta: '',
      nombreCliente: '',
      apellido: '',
      rutCliente: rutCliente,
      digitoVerificador: '',
      mensaje: 'OK'
    };
    
    // Mapear los campos desde la respuesta API
    // Esto dependerá de la estructura que devuelva tu API proxy
    if (apiResponse) {
      Object.keys(apiResponse).forEach(key => {
        // Buscar el nombre del campo en nuestro mapeo
        const fieldName = this.fieldMappings[key] || key.toLowerCase();
        
        // Si existe, asignarlo
        if (fieldName && apiResponse[key] !== undefined && apiResponse[key] !== null) {
          result[fieldName] = apiResponse[key];
        }
      });
    }
    
    return result;
  }
  
  /**
   * Extrae todos los datos relevantes del XML
   */
  private extractDataFromXml(xmlDoc: Document, rutCliente: string): MandatoResult {
    // Crear resultado base con valores por defecto
    const result: MandatoResult = {
      mandatoId: '',
      banco: '',
      tipoCuenta: '',
      numeroCuenta: '',
      nombreCliente: '',
      apellido: '',
      rutCliente: rutCliente,
      digitoVerificador: '',
      mensaje: '',
    };
    
    // Debugging - listar todos los nodos para identificar los tags correctos
    this.debugListAllNodes(xmlDoc);
    
    // Explorar todos los nombres de nodos posibles y extraer sus valores
    for (const [xmlField, resultField] of Object.entries(this.fieldMappings)) {
      const value = this.getXmlValue(xmlDoc, xmlField);
      if (value !== null) {
        result[resultField] = value;
        console.log(`Campo extraído: ${xmlField} => ${resultField} = "${value}"`);
      }
    }
    
    // Buscar campos dentro de la respuesta de TraeInfoMandatoResult
    const traeMandatoResult = xmlDoc.getElementsByTagName("TraeInfoMandatoResult")[0];
    if (traeMandatoResult) {
      // Buscar en nodos hijos directos, que es donde suelen estar los datos en SOAP
      this.extractFieldsFromNode(traeMandatoResult, result);
    }
    
    // Si no tenemos un mensaje específico, establecer uno por defecto
    if (!result.mensaje) {
      result.mensaje = result.mandatoId ? 'OK' : 'No se encontraron datos';
    }
    
    // Derivar el tipo de cuenta a partir del código si está disponible
    if (result.indTipo && !result.tipoCuenta) {
      result.tipoCuenta = this.getTipoCuentaFromCodigo(result.indTipo);
    }
    
    console.log('Datos extraídos del XML:', result);
    
    return result;
  }
  
  /**
   * Extrae campos de un nodo específico y sus hijos
   */
  private extractFieldsFromNode(node: Element, result: MandatoResult): void {
    // Procesar todos los nodos hijos
    for (let i = 0; i < node.children.length; i++) {
      const childNode = node.children[i];
      const nodeName = childNode.nodeName;
      
      // Verificar si tenemos un mapeo para este nodo
      const resultField = this.fieldMappings[nodeName] || 
                          this.fieldMappings[nodeName.replace(/^.*:/, '')]; // Quitar prefijo si existe
      
      if (resultField && childNode.textContent) {
        result[resultField] = childNode.textContent.trim();
        console.log(`Encontrado en nodo hijo: ${nodeName} => ${resultField} = "${childNode.textContent.trim()}"`);
      }
      
      // Recursivamente procesar nodos hijos
      if (childNode.children.length > 0) {
        this.extractFieldsFromNode(childNode as Element, result);
      }
    }
  }
  
  /**
   * Función de depuración para listar todos los nodos y sus valores
   */
  private debugListAllNodes(xmlDoc: Document): void {
    console.log('====== LISTADO DE TODOS LOS NODOS DEL XML ======');
    const allElements = xmlDoc.getElementsByTagName("*");
    
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      if (element.textContent && element.textContent.trim() !== '') {
        console.log(`Nodo: ${element.nodeName}, Valor: "${element.textContent.trim()}"`);
      }
    }
    console.log('===============================================');
  }
  
  /**
   * Método auxiliar para obtener valores del XML con manejo de errores mejorado
   */
  private getXmlValue(xmlDoc: Document, tagName: string): string | null {
    try {
      // Primero intentamos buscar el tag directamente
      const elements = xmlDoc.getElementsByTagName(tagName);
      if (elements.length > 0 && elements[0].textContent) {
        return elements[0].textContent.trim();
      }
      
      // Si no lo encontramos, buscamos en espacios de nombres
      // A veces los campos pueden estar prefijados con el namespace
      const allElements = xmlDoc.getElementsByTagName("*");
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        // Verificar nombre exacto o nombre con cualquier prefijo (ns:tagName)
        if ((element.localName === tagName || element.nodeName.endsWith(`:${tagName}`)) && 
            element.textContent) {
          return element.textContent.trim();
        }
      }
      
      // Buscar en atributos (algunos servicios SOAP devuelven datos en atributos XML)
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i];
        if (element.hasAttribute(tagName)) {
          return element.getAttribute(tagName);
        }
      }
      
      return null;
    } catch (e) {
      console.warn(`Error al extraer campo ${tagName} del XML:`, e);
      return null;
    }
  }
  
  /**
   * Convierte el código de tipo de cuenta a una descripción legible
   */
  private getTipoCuentaFromCodigo(codigo: string): string {
    switch (codigo) {
      case '1': return 'Cuenta Corriente';
      case '2': return 'Cuenta Vista';
      case '3': return 'Cuenta de Ahorro';
      default: return `Tipo ${codigo}`;
    }
  }
}

export const mandatoSoapService = new MandatoSoapService();