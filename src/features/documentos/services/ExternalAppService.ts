import axios from 'axios';

// Definición de interfaz para los parámetros de la aplicación externa
interface ExternalAppParams {
  empleado: string;
  rutafiliado: string;
  nombres: string;
  appaterno: string;
  apmaterno: string;
  tipo: string;
  transactionId?: string;
  [key: string]: string | undefined;
}

// Definición de interfaz para el estado de la transacción
interface TransactionStatus {
  status: 'pending' | 'success' | 'error';
  details?: any;
  error?: string;
}

class ExternalAppService {
  private baseUrl: string;
  private apiUrl: string;
  private modalMode: boolean = true; // Configuración para usar modal en lugar de ventana

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
   * Construye la URL con parámetros 
   */
  private buildDirectUrl(params: ExternalAppParams): string {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value);
      }
    });
    
    return `${this.baseUrl}?${queryParams.toString()}`;
  }

  /**
   * Simula encriptación para pruebas - en producción llamaría a tu API real
   */
  async encryptParams(params: ExternalAppParams): Promise<string> {
    try {
      // Para pruebas, simulamos una cadena encriptada
      return 'param=0D0F4162C48B1AFC1A4D7EBE785806F42C69BE6A4774A5B6F965BB9EE11CE752E5C83CD48C1E540EBDCC8A24675365D7FE2F6543ECEDD7BF907EC9EAB993BECDB0625FA1546E934388C4EBBEE7E0DCCBB354F2CD3C780CD90A01BDF6D8055BDB68EA1CB7056C9003EE90508A30B90382';
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
      // Para desarrollo, usar la url directa dada para pruebas
      if (params.rutafiliado === '17175966-8') {
        return 'http://mandatos.consalud.tes/frmmandatos.aspx?param=0D0F4162C48B1AFC1A4D7EBE785806F42C69BE6A4774A5B6F965BB9EE11CE752E5C83CD48C1E540EBDCC8A24675365D7FE2F6543ECEDD7BF907EC9EAB993BECDB0625FA1546E934388C4EBBEE7E0DCCBB354F2CD3C780CD90A01BDF6D8055BDB68EA1CB7056C9003EE90508A30B90382';
      }
      
      // En otro caso, simular encriptación
      const encryptedParams = await this.encryptParams(params);
      return `${this.baseUrl}?param=${encodeURIComponent(encryptedParams)}`;
    } catch (error) {
      console.error('Error al generar URL:', error);
      throw error;
    }
  }

  /**
   * Registra una nueva transacción - versión simplificada para pruebas
   */
  async registerTransaction(transactionId: string, params: ExternalAppParams): Promise<boolean> {
    // Simulamos registro en localStorage para desarrollo
    localStorage.setItem(`transaction_${transactionId}`, JSON.stringify({
      params,
      status: 'pending',
      timestamp: Date.now()
    }));
    return true;
  }

  /**
   * Verifica el estado de una transacción
   */
  async checkTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    // Verificar si hay datos en localStorage para esta transacción
    const storedData = localStorage.getItem(`transaction_${transactionId}`);
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        
        // Si estamos en modo desarrollo y hay datos almacenados,
        // consideramos la transacción exitosa
        if (data) {
          return {
            status: 'success',
            details: { message: 'Operación completada correctamente' }
          };
        }
      } catch (e) {
        console.error('Error al leer datos de transacción:', e);
      }
    }
    
    // Si llegamos aquí, devolvemos error
    return {
      status: 'error',
      error: 'La operación falló o fue cancelada'
    };
  }

  /**
   * Método para abrir la aplicación en un modal EVITANDO problemas CORS
   */
  async openExternalAppInModal(params: ExternalAppParams): Promise<{
    modalId: string;
    transactionId: string;
  }> {
    try {
      // Asegurarse de que tenemos un ID de transacción
      const transactionId = params.transactionId || this.generateTransactionId();
      const modalId = `external-modal-${transactionId}`;
      
      const paramsWithTransaction = {
        ...params,
        transactionId
      };

      // Registrar la transacción
      await this.registerTransaction(transactionId, paramsWithTransaction);
      
      // Generar la URL
      const url = await this.generateUrl(paramsWithTransaction);
      
      // Crear el modal 
      this.createModalWithIframe(modalId, url, transactionId);
      
      // Guardar en localStorage para seguimiento
      localStorage.setItem('currentExternalTransaction', transactionId);
      
      return {
        modalId,
        transactionId
      };
    } catch (error) {
      console.error('Error al abrir aplicación en modal:', error);
      throw error;
    }
  }

  /**
   * Método para crear el modal con iframe - VERSIÓN MEJORADA SIN PROBLEMAS CORS
   */
  private createModalWithIframe(modalId: string, url: string, transactionId: string): void {
    // Remover modal existente si hay alguno
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
      document.body.removeChild(existingModal);
    }
    
    // Crear el contenedor del modal
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    
    // Crear el contenedor del iframe
    const iframeContainer = document.createElement('div');
    iframeContainer.style.position = 'relative';
    iframeContainer.style.width = '90%';
    iframeContainer.style.height = '90%';
    iframeContainer.style.maxWidth = '1200px';
    iframeContainer.style.backgroundColor = 'white';
    iframeContainer.style.borderRadius = '8px';
    iframeContainer.style.overflow = 'hidden';
    iframeContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    
    // Crear el iframe
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.id = `iframe-${transactionId}`;
    
    // IMPORTANTE: NO intentamos acceder al contenido del iframe (evitamos CORS)
    // En lugar de eso, usamos eventos para detectar cierre o mensajes
    
    // Escuchar eventos de mensaje que puedan venir del iframe
    const messageHandler = (event: MessageEvent) => {
      // IMPORTANTE: Verificar origen para seguridad
      if (event.origin.includes('mandatos.consalud.tes')) {
        if (event.data === 'closeModal' || event.data?.action === 'close') {
          // Si recibimos mensaje de cierre, cerramos el modal
          this.closeModal(modalId);
          this.triggerCloseEvent(transactionId, 'success');
        }
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Crear un botón de respaldo para cerrar el modal
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '15px';
    closeButton.style.right = '15px';
    closeButton.style.backgroundColor = '#f3f3f3';
    closeButton.style.color = '#333';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '16px';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.zIndex = '10';
    
    // Función para cerrar y limpiar
    const closeAndCleanup = () => {
      window.removeEventListener('message', messageHandler);
      document.body.removeChild(modal);
      this.triggerCloseEvent(transactionId, 'cancelled');
    };
    
    closeButton.onclick = closeAndCleanup;
    
    // También cerramos si se hace clic fuera del iframe
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeAndCleanup();
      }
    };
    
    // Ensamblar todos los elementos
    iframeContainer.appendChild(iframe);
    iframeContainer.appendChild(closeButton);
    modal.appendChild(iframeContainer);
    document.body.appendChild(modal);
    
    // Configurar un temporizador para verificar periódicamente el mandato
    // Esto nos permite actualizar datos aunque no recibamos mensajes del iframe
    const checkInterval = setInterval(() => {
      // Verificar si el modal sigue existiendo
      if (!document.getElementById(modalId)) {
        clearInterval(checkInterval);
        return;
      }
      
      // Intentar obtener datos actualizados cada 10 segundos
      // Este enfoque funciona incluso si no podemos acceder al contenido del iframe
      console.log('Verificando mandato actualizado...');
      this.refreshMandatoData();
    }, 10000);
  }
  
  /**
   * Método para actualizar datos del mandato
   */
  private refreshMandatoData() {
    // Disparar un evento personalizado que notifique que debe actualizarse el mandato
    const refreshEvent = new CustomEvent('refreshMandatoRequest', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(refreshEvent);
  }

  /**
   * Método para disparar el evento de cierre
   */
  private triggerCloseEvent(transactionId: string, status: 'success' | 'cancelled' | 'error'): void {
    const closeEvent = new CustomEvent('externalAppClosed', {
      detail: { 
        transactionId,
        status 
      }
    });
    window.dispatchEvent(closeEvent);
    
    // También disparamos el evento de actualización
    this.refreshMandatoData();
  }
  
  /**
   * Método para cerrar el modal programáticamente
   */
  public closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      document.body.removeChild(modal);
    }
  }

  /**
   * Abre la aplicación externa en una nueva ventana
   * Método alternativo si no se desea usar el modal
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

      // Registrar la transacción
      await this.registerTransaction(transactionId, paramsWithTransaction);
      
      // Generar la URL
      const url = await this.generateUrl(paramsWithTransaction);
      
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