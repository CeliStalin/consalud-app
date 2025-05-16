import axios from 'axios';

interface ExternalAppParams {
  empleado: string;
  rutafiliado: string;
  nombres: string;
  appaterno: string;
  apmaterno: string;
  tipo: string;
  transactionId: string;
  [key: string]: string; // Para otros parámetros adicionales
}

interface TransactionStatus {
  status: 'pending' | 'success' | 'error';
  details?: any;
  error?: string;
}

class ExternalAppService {
  private baseUrl: string;
  private apiUrl: string;

  constructor(
    baseUrl: string = 'http://mandatos.consalud.tes/frmmandatos.aspx',
    apiUrl: string = 'http://localhost:3001/api'
  ) {
    this.baseUrl = baseUrl;
    this.apiUrl = apiUrl;
  }

  /**
   * Genera un ID de transacción único
   */
  generateTransactionId(): string {
    return `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Registra una nueva transacción a través del proxy
   */
  async registerTransaction(transactionId: string, params: ExternalAppParams): Promise<boolean> {
    try {
      console.log(`Registrando transacción ${transactionId} con el servidor proxy...`);
      const response = await axios.post(`${this.apiUrl}/external-app/register-transaction`, {
        transactionId,
        params
      });
      
      return response.data.success === true;
    } catch (error) {
      console.error('Error al registrar transacción:', error);
      return false;
    }
  }

  /**
   * Verifica el estado de una transacción a través del proxy
   */
  async checkTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    try {
      console.log(`Verificando estado de transacción ${transactionId}...`);
      const response = await axios.get(`${this.apiUrl}/external-app/transaction-status/${transactionId}`);
      
      if (response.data.success === true) {
        return {
          status: response.data.status || 'pending',
          details: response.data.transaction || {},
          error: response.data.error || undefined
        };
      }
      
      return {
        status: 'error',
        error: response.data.error || 'Error desconocido al verificar el estado'
      };
    } catch (error) {
      console.error('Error al verificar estado de transacción:', error);
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Abre la aplicación externa en una nueva ventana
   * @param params Parámetros para la aplicación externa
   */
  async openExternalApp(params: ExternalAppParams): Promise<{
    window: Window | null;
    transactionId: string;
  }> {
    try {
      // Asegurarse de que tenemos un ID de transacción
      const transactionId = params.transactionId || this.generateTransactionId();
      
      const paramsWithTransaction = {
        ...params,
        transactionId
      };

      // Registrar la transacción en el servidor
      const registered = await this.registerTransaction(transactionId, paramsWithTransaction);
      
      if (!registered) {
        console.warn('No se pudo registrar la transacción, pero se intentará abrir la aplicación');
      }
      
      // Obtener URL directamente del servidor
      console.log('Obteniendo URL del servidor...');
      const urlResponse = await axios.get(`${this.apiUrl}/external-app/url`);
      
      if (!urlResponse.data.success || !urlResponse.data.url) {
        throw new Error('No se pudo obtener la URL para la aplicación externa');
      }
      
      const url = urlResponse.data.url;
      console.log(`Abriendo URL: ${url}`);
      
      // Guardar en localStorage para seguimiento
      localStorage.setItem('currentExternalTransaction', transactionId);
      
      // Abrir la ventana
      const externalWindow = window.open(url, '_blank');
      
      if (!externalWindow) {
        throw new Error('No se pudo abrir la ventana externa. Verifique que no esté bloqueando ventanas emergentes.');
      }
      
      return {
        window: externalWindow,
        transactionId
      };
    } catch (error) {
      console.error('Error al abrir aplicación externa:', error);
      throw error;
    }
  }
}

// Exportar una instancia única del servicio
export const externalAppService = new ExternalAppService();

// También exportar la clase para poder crear instancias personalizadas si es necesario
export default ExternalAppService;