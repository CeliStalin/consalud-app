import axios from 'axios';

// Definición de interfaz para los parámetros de la aplicación externa
interface ExternalAppParams {
  empleado: string;
  rutafiliado: string;
  nombres: string;
  appaterno: string;
  apmaterno: string;
  tipo: string;
  transactionId?: string;  // Opcional porque lo generamos si no se proporciona
  [key: string]: string | undefined;  // Para otros parámetros adicionales
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
   * NOTA: Esta es una versión simplificada para pruebas
   */
  private buildDirectUrl(params: ExternalAppParams): string {
    const queryParams = new URLSearchParams();
    
    // Añadir cada parámetro al objeto URLSearchParams
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value);
      }
    });
    
    // Construir la URL directa - para pruebas
    return `${this.baseUrl}?${queryParams.toString()}`;
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
  async checkTransactionStatus(transactionId: string): Promise<TransactionStatus> {
    // Simulación para desarrollo (80% probabilidad de éxito)
    const success = Math.random() > 0.2;
    
    return {
      status: success ? 'success' : 'error',
      details: success ? { message: 'Operación completada correctamente' } : undefined,
      error: success ? undefined : 'La operación falló o fue cancelada'
    };
  }

  /**
   * Método para abrir la aplicación en un modal
   * @param params Parámetros para la aplicación externa
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
      
      // Crear el modal con iframe
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
   * Método para crear el modal con iframe
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
    
    // Cuando el iframe cargue, intentar interceptar el botón de cerrar
    iframe.onload = () => {
      try {
        // Intentar acceder al contenido del iframe (podría fallar por CORS)
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (iframeDoc) {
          // Buscar todos los botones y links con texto "Cerrar"
          const cerrarElements = iframeDoc.querySelectorAll('button, input[type="button"], a');
          
          for (let i = 0; i < cerrarElements.length; i++) {
            const el = cerrarElements[i] as HTMLElement;
            
            // Verificar si el texto del elemento o su valor tiene "Cerrar"
            if (el.textContent?.includes('Cerrar') || 
                (el as HTMLInputElement).value?.includes('Cerrar')) {
              
              // Crear un nuevo evento click que no se propague
              el.addEventListener('click', (e) => {
                // Detener evento original
                e.preventDefault();
                e.stopPropagation();
                
                // Cerrar el modal
                document.body.removeChild(modal);
                
                // Disparar evento personalizado
                this.triggerCloseEvent(transactionId, 'success');
                
                return false;
              }, true);
              
              console.log('Interceptado botón cerrar en iframe');
            }
          }
        }
      } catch (e) {
        console.warn('No se pudo acceder al contenido del iframe por restricciones CORS:', e);
      }
    };
    
    // Botón de cierre (nuestro botón de respaldo)
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
    
    // Manejar cierre
    closeButton.onclick = () => {
      document.body.removeChild(modal);
      
      // Disparar evento personalizado
      this.triggerCloseEvent(transactionId, 'cancelled');
    };
    
    // Ensamblar todos los elementos
    iframeContainer.appendChild(iframe);
    iframeContainer.appendChild(closeButton);
    modal.appendChild(iframeContainer);
    document.body.appendChild(modal);
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
      const url = await this.generateUrl(paramsWithTransaction);
      
      // URL directa para pruebas
      //const url = `http://mandatos.consalud.tes/frmmandatos.aspx?param=0D0F4162C48B1AFC1A4D7EBE785806F42C69BE6A4774A5B6F965BB9EE11CE752E5C83CD48C1E540EBDCC8A24675365D7FE2F6543ECEDD7BF907EC9EAB993BECDB0625FA1546E934388C4EBBEE7E0DCCBB354F2CD3C780CD90A01BDF6D8055BDB68EA1CB7056C9003EE90508A30B90382`;
      
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