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
  // Usamos el proxy local
  private baseUrl = '/api/mandato';
  
  /**
   * Obtiene información del mandato
   * Esta implementación usa un proxy para evitar problemas de CORS
   */
  async getMandatoInfo(rutCliente: string, nSecMandato: string = ''): Promise<MandatoResult> {
    try {
      console.log(`Consultando información de mandato para RUT: ${rutCliente}, Mandato: ${nSecMandato || 'No especificado'}`);
      
      // Solicitud directa a nuestro servidor proxy con cuerpo JSON
      const response = await axios.post(this.baseUrl, {
        rutCliente,
        nSecMandato
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 200 && response.data) {
        console.log('Respuesta recibida del proxy:', response.data);
        return response.data;
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
        } else if (error.response.data.mensaje) {
          errorMessage = error.response.data.mensaje;
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
}

export const mandatoSoapService = new MandatoSoapService();