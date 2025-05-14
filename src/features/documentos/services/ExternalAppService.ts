// src/features/documentos/services/ExternalAppService.ts

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
  
  interface OpenExternalAppResult {
    window: Window | null;
    transactionId: string;
  }
  
  /**
   * Servicio para manejar la integración con aplicaciones externas
   */
  class ExternalAppService {
    private baseUrl: string;
    private apiUrl: string;
    
    constructor(
      baseUrl: string = 'http://mandatos.consalud.tes/frmmandatos.aspx',
      apiUrl: string = '/api'
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
     * Construye la URL con parámetros directamente (sin encriptar)
     */
    private buildDirectUrl(params: ExternalAppParams): string {
      const queryParams = new URLSearchParams();
      
      // Añadir cada parámetro al objeto URLSearchParams
      Object.entries(params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      
      // Construir la URL directa
      return `${this.baseUrl}?${queryParams.toString()}`;
    }
  
    /**
     * Simula la encriptación de parámetros (para desarrollo)
     */
    async encryptParams(params: ExternalAppParams): Promise<string> {
      try {
        // En un entorno real, esta llamada debería ir a tu API de encriptación
        console.log('Parámetros a encriptar:', params);
        
        // Para simulación, generamos una cadena codificada en base64
        const jsonString = JSON.stringify(params);
        const base64 = btoa(jsonString);
        
        return base64;
      } catch (error) {
        console.error('Error al encriptar parámetros:', error);
        throw new Error('No se pudieron encriptar los parámetros');
      }
    }
  
    /**
     * Genera la URL completa para la aplicación externa
     */
    async generateUrl(params: ExternalAppParams): Promise<string> {
      try {
        // Para desarrollo, usamos una URL directa sin encriptar
        // Vite expone las variables de entorno a través de import.meta.env
        const isDevelopment = import.meta.env.DEV;
        
        if (isDevelopment) {
          return this.buildDirectUrl(params);
        }
        
        // En producción, usamos la versión encriptada
        const encryptedParams = await this.encryptParams(params);
        return `${this.baseUrl}?param=${encodeURIComponent(encryptedParams)}`;
      } catch (error) {
        console.error('Error al generar URL:', error);
        throw error;
      }
    }
  
    /**
     * Registra una nueva transacción en el sistema
     */
    async registerTransaction(transactionId: string, params: ExternalAppParams): Promise<boolean> {
      try {
        // En un entorno real, esto llamaría a una API para registrar la transacción
        // Para desarrollo, simulamos el registro
        console.log('Registrando transacción:', { transactionId, params });
        
        // Guardar en localStorage para seguimiento
        localStorage.setItem(`transaction_${transactionId}`, JSON.stringify({
          status: 'pending',
          timestamp: Date.now(),
          params
        }));
        
        // También guardar el ID de la última transacción para verificaciones generales
        localStorage.setItem('currentExternalTransaction', transactionId);
        
        // Log detallado para depuración
        console.log(`Transacción registrada: {transactionId: '${transactionId}', params: ${JSON.stringify(params)}}`);
        
        return true;
      } catch (error) {
        console.error('Error al registrar transacción:', error);
        throw error;
      }
    }
  
    /**
     * Verifica el estado de una transacción
     */
    async checkTransactionStatus(transactionId: string): Promise<TransactionStatus> {
      try {
        console.log(`Verificando estado de transacción: ${transactionId}`);
        
        // En un entorno real, esto llamaría a una API para verificar el estado
        // Para desarrollo, simulamos la respuesta
        
        // Verificar si hay datos guardados en localStorage
        const storedData = localStorage.getItem(`transaction_${transactionId}`);
        
        if (!storedData) {
          // Verificar si hay una transacción con ese ID en el localStorage general
          // (Para propósitos de testing y retrocompatibilidad)
          const checkCurrentTransaction = localStorage.getItem('currentExternalTransaction');
          
          if (checkCurrentTransaction === transactionId) {
            console.log('Transacción encontrada en localStorage pero sin datos detallados');
            // Asumir un éxito para fines de demostración
            return {
              status: 'success',
              details: { message: 'Operación simulada completada correctamente' }
            };
          }
          
          console.warn(`Transacción no encontrada: ${transactionId}`);
          return {
            status: 'error',
            error: 'Transacción no encontrada'
          };
        }
        
        const transactionData = JSON.parse(storedData);
        console.log('Datos de transacción encontrados:', transactionData);
        
        // Si la transacción tiene más de 5 minutos, la marcamos como completada
        const currentTime = Date.now();
        const transactionTime = transactionData.timestamp || 0;
        const timeDiff = currentTime - transactionTime;
        const fiveMinutesMs = 5 * 60 * 1000;
        
        if (transactionData.status === 'pending' && timeDiff > fiveMinutesMs) {
          // Actualizar estado a completado
          console.log('Transacción pendiente con más de 5 minutos, marcando como exitosa');
          transactionData.status = 'success';
          localStorage.setItem(`transaction_${transactionId}`, JSON.stringify(transactionData));
        }
        
        // Simulación para desarrollo (80% probabilidad de éxito si no hay estado definido)
        let status = transactionData.status;
        if (status === 'pending') {
          // En una implementación real, esto verificaría el estado actual con el backend
          console.log('Estado pendiente, simulando respuesta');
          const success = Math.random() > 0.2;
          status = success ? 'success' : 'error';
          
          // Actualizamos el estado
          transactionData.status = status;
          localStorage.setItem(`transaction_${transactionId}`, JSON.stringify(transactionData));
        }
        
        console.log(`Estado final de la transacción: ${status}`);
        
        return {
          status: status as 'pending' | 'success' | 'error',
          details: status === 'success' ? { message: 'Operación completada correctamente' } : undefined,
          error: status === 'error' ? 'La operación falló o fue cancelada' : undefined
        };
      } catch (error) {
        console.error('Error al verificar estado de transacción:', error);
        throw error;
      }
    }
  
    /**
     * Actualiza el estado de una transacción
     */
    async updateTransactionStatus(transactionId: string, status: 'pending' | 'success' | 'error', details?: any): Promise<boolean> {
      try {
        // En un entorno real, esto llamaría a una API para actualizar el estado
        // Para desarrollo, simulamos la actualización
        const storedData = localStorage.getItem(`transaction_${transactionId}`);
        
        if (!storedData) {
          return false;
        }
        
        const transactionData = JSON.parse(storedData);
        transactionData.status = status;
        
        if (details) {
          transactionData.details = details;
        }
        
        localStorage.setItem(`transaction_${transactionId}`, JSON.stringify(transactionData));
        return true;
      } catch (error) {
        console.error('Error al actualizar estado de transacción:', error);
        throw error;
      }
    }
  
    /**
     * Abre la aplicación externa en una nueva ventana
     */
    async openExternalApp(params: ExternalAppParams): Promise<OpenExternalAppResult> {
      try {
        // Asegurarse de que tenemos un ID de transacción
        const transactionId = params.transactionId || this.generateTransactionId();
        
        const paramsWithTransaction = {
          ...params,
          transactionId
        };
  
        // Registrar la transacción
        await this.registerTransaction(transactionId, paramsWithTransaction);
        
        // Para desarrollo, podemos usar diferentes URLs según el ambiente
        let url: string;
        
        // Vite expone las variables de entorno a través de import.meta.env
        const isDevelopment = import.meta.env.DEV;
        
        if (isDevelopment) {
          // URL directa para pruebas
          url = `http://mandatos.consalud.tes/frmmandatos.aspx?empleado=${params.empleado}&rutafiliado=${params.rutafiliado}&nombres=${encodeURIComponent(params.nombres)}&appaterno=${encodeURIComponent(params.appaterno)}&apmaterno=${encodeURIComponent(params.apmaterno)}&tipo=${params.tipo}&transactionId=${transactionId}`;
        } else {
          // Generar URL para producción
          url = await this.generateUrl(paramsWithTransaction);
        }
        
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