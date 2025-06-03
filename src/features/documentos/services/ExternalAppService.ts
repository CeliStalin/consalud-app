interface ExternalAppParams {
  empleado: string;
  rutafiliado: string;
  nombres: string;
  appaterno: string;
  apmaterno: string;
  tipo: string;
  transactionId: string;
  [key: string]: string;
}

interface TransactionStatus {
  status: 'pending' | 'success' | 'error';
  details?: any;
  error?: string;
}

class ExternalAppService {
  private baseUrl: string;

  constructor(
    baseUrl: string = 'http://mandatos.consalud.tes/frmmandatos.aspx'
  ) {
    this.baseUrl = baseUrl;
  }

  /**
   * Genera un ID de transacción único
   */
  generateTransactionId(): string {
    return `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Encripta los parámetros para la aplicación externa - versión para pruebas
   * @param params Parámetros a encriptar
   */
  async encryptParams(params: ExternalAppParams): Promise<string> {
    try {
      // En un entorno real, esta llamada debería ir a tu API de encriptación
      console.log('Parámetros a encriptar:', params);
      
      // Para pruebas, solo devolvemos un string fijo
      // En producción, este valor vendría de tu API de encriptación
      return "empleado=DMENA&rutafiliado=17175966-8&nombres=Ignacio%20Javier&appaterno=Quintana&apmaterno=Asenjo&tipo=HER";
    } catch (error) {
      console.error('Error al encriptar parámetros:', error);
      throw new Error('No se pudieron encriptar los parámetros');
    }
  }

  /**
   * Genera la URL completa para la aplicación externa
   * @param params Parámetros para la aplicación externa
   */
  async generateUrl(params: ExternalAppParams): Promise<string> {
    try {
      // Para pruebas, podemos usar una URL directa sin encriptar
      // return this.buildDirectUrl(params);
      
      // O usar la versión encriptada (simulada)
      const encryptedParams = await this.encryptParams(params);
      return `${this.baseUrl}?param=${encryptedParams}`;
    } catch (error) {
      console.error('Error al generar URL:', error);
      throw error;
    }
  }

  /**
   * Registra una nueva transacción - versión simplificada para pruebas
   */
  async registerTransaction(transactionId: string, params: ExternalAppParams): Promise<boolean> {
    // En un entorno real, esto llamaría a una API
    console.log('Transacción registrada:', { transactionId, params });
    return true;
  }

  /**
   * Verifica el estado de una transacción - versión simplificada para pruebas
   */
  async checkTransactionStatus(_transactionId: string): Promise<TransactionStatus> {
    // Simulación para desarrollo (80% probabilidad de éxito)
    const success = Math.random() > 0.2;
    
    return {
      status: success ? 'success' : 'error',
      details: success ? { message: 'Operación completada correctamente' } : undefined,
      error: success ? undefined : 'La operación falló o fue cancelada'
    };
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

      // Registrar la transacción (simulado)
      await this.registerTransaction(transactionId, paramsWithTransaction);
      
      // Generar la URL
      // Para pruebas, usamos directamente la URL de la aplicación ASP.NET
      // const url = await this.generateUrl(paramsWithTransaction);
      
      // URL directa para pruebas -
      const url = `http://mandatos.consalud.tes/frmmandatos.aspx?param=0D0F4162C48B1AFC1A4D7EBE785806F42C69BE6A4774A5B6F965BB9EE11CE752E5C83CD48C1E540EBDCC8A24675365D7FE2F6543ECEDD7BF907EC9EAB993BECDB0625FA1546E934388C4EBBEE7E0DCCBB354F2CD3C780CD90A01BDF6D8055BDB68EA1CB7056C9003EE90508A30B90382`;
      
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
