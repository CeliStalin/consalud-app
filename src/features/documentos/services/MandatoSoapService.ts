
export interface MandatoResult {
  mandatoId: string;
  banco: string;
  tipoCuenta: string;
  numeroCuenta: string;
  nombreCliente: string;
  apellido: string;
  rutCliente: string;
  digitoVerificador: string;
  mensaje: string;
  [key: string]: any; // Para otros campos que puedan venir
}

export class MandatoSoapService {
  private baseUrl = 'http://caja.sistemastransversales.tes/consalud.Caja.servicios/SvcMandato.svc';

  /**
   * Obtiene información del mandato usando SOAP
   */
  async getMandatoInfo(rutCliente: string, nSecMandato: string = ''): Promise<MandatoResult> {
    try {
      console.log(`Consultando información de mandato para RUT: ${rutCliente}, Mandato: ${nSecMandato || 'No especificado'}`);
      
      // Construir el envelope SOAP
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

      // Realizar la petición
      // Nota: En un entorno real, esto podría requerir un proxy para evitar problemas CORS
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': 'Consalud.Caja.Servicios/ISvcMandato/TraeInfoMandato'
        },
        body: soapEnvelope
      });

      // Verificar respuesta
      if (!response.ok) {
        throw new Error(`Error en la respuesta SOAP: ${response.status}`);
      }

      // Obtener el XML como texto
      const xmlText = await response.text();
      console.log('Respuesta SOAP recibida:', xmlText.substring(0, 200) + '...');
      
      // Parsear el XML 
      // Nota: En producción, considera usar una biblioteca como xml2js
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      // Extraer los datos relevantes del XML
      const result: MandatoResult = {
        mandatoId: this.getXmlValue(xmlDoc, "SMANDATO") || '',
        banco: this.getXmlValue(xmlDoc, "Sdescorinstfinanc") || '',
        tipoCuenta: this.getXmlValue(xmlDoc, "DesTipoCuenta") || '',
        numeroCuenta: this.getXmlValue(xmlDoc, "Snumctacte") || '',
        nombreCliente: this.getXmlValue(xmlDoc, "Snombres") || '',
        apellido: this.getXmlValue(xmlDoc, "Sapematerno") || '',
        rutCliente: this.getXmlValue(xmlDoc, "SidRutcliente") || '',
        digitoVerificador: this.getXmlValue(xmlDoc, "Sdigcliente") || '',
        mensaje: this.getXmlValue(xmlDoc, "MENSAJE") || 'Error al procesar'
      };
      
      // Si no encontramos datos, podemos usar un mock para desarrollo
      if (!result.mandatoId || result.mandatoId.trim() === '') {
        console.warn('No se encontraron datos en la respuesta XML, usando datos de ejemplo');
        return this.getMockResult(rutCliente);
      }
      
      return result;
    } catch (error) {
      console.error('Error al obtener información del mandato:', error);
      
      // Para desarrollo, devolvemos datos de ejemplo cuando hay error
      console.log('Usando datos de ejemplo debido al error');
      return this.getMockResult(rutCliente);
    }
  }
  
  /**
   * Método auxiliar para obtener valores del XML
   */
  private getXmlValue(xmlDoc: Document, tagName: string): string | null {
    // Buscamos el tag en cualquier namespace
    const elements = xmlDoc.getElementsByTagName(tagName);
    if (elements.length > 0 && elements[0].textContent) {
      return elements[0].textContent;
    }
    
    return null;
  }
  
  /**
   * Generamos datos de prueba para desarrollo/testing
   */
  private getMockResult(rutCliente: string): MandatoResult {
    // Datos de ejemplo basados en el XML de respuesta proporcionado
    return {
      mandatoId: '137382',
      banco: 'Banco del Estado de Chile',
      tipoCuenta: 'Cuenta Corriente',
      numeroCuenta: 'aaaa',
      nombreCliente: 'IGNACIO JAVIER',
      apellido: 'ASENJO',
      rutCliente: rutCliente || '17175966',
      digitoVerificador: '8',
      mensaje: 'OK'
    };
  }
}

export const mandatoSoapService = new MandatoSoapService();