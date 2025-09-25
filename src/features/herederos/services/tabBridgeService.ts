/**
 * Servicio de puente para comunicación entre pestañas usando BroadcastChannel
 * Permite comunicación bidireccional entre la pestaña principal y pestañas externas
 */

interface TabBridgeMessage {
  type: 'TAB_OPENED' | 'TAB_CLOSED' | 'HEARTBEAT' | 'UNLOCK_REQUEST';
  tabId: string;
  timestamp: number;
  data?: any;
}

class TabBridgeService {
  private channel: BroadcastChannel;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor() {
    this.channel = new BroadcastChannel('consalud-tab-bridge');
    this.setupMessageHandler();
  }

  /**
   * Inicializa el servicio de puente
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    console.log('🌉 [TabBridge] Inicializando servicio de puente');
    this.isInitialized = true;

    // Iniciar heartbeat para mantener la comunicación activa
    this.startHeartbeat();
  }

  /**
   * Configura el manejador de mensajes del BroadcastChannel
   */
  private setupMessageHandler(): void {
    this.channel.addEventListener('message', (event: MessageEvent) => {
      const message: TabBridgeMessage = event.data;

      console.log('🌉 [TabBridge] Mensaje recibido:', message);

      switch (message.type) {
        case 'TAB_OPENED':
          this.handleTabOpened(message);
          break;
        case 'TAB_CLOSED':
          this.handleTabClosed(message);
          break;
        case 'HEARTBEAT':
          this.handleHeartbeat(message);
          break;
        case 'UNLOCK_REQUEST':
          this.handleUnlockRequest(message);
          break;
        default:
          console.warn('🌉 [TabBridge] Tipo de mensaje desconocido:', message.type);
      }
    });

    // Escuchar errores del canal
    this.channel.addEventListener('error', (error) => {
      console.error('🌉 [TabBridge] Error en el canal:', error);
    });
  }

  /**
   * Notifica que se abrió una nueva pestaña externa
   */
  notifyTabOpened(tabId: string, url: string): void {
    const message: TabBridgeMessage = {
      type: 'TAB_OPENED',
      tabId,
      timestamp: Date.now(),
      data: { url }
    };

    this.sendMessage(message);
    console.log('🌉 [TabBridge] Notificando pestaña abierta:', tabId);
  }

  /**
   * Notifica que se cerró una pestaña externa
   */
  notifyTabClosed(tabId: string): void {
    const message: TabBridgeMessage = {
      type: 'TAB_CLOSED',
      tabId,
      timestamp: Date.now()
    };

    this.sendMessage(message);
    console.log('🌉 [TabBridge] Notificando pestaña cerrada:', tabId);
  }

  /**
   * Envía un mensaje a través del canal
   */
  private sendMessage(message: TabBridgeMessage): void {
    try {
      this.channel.postMessage(message);
    } catch (error) {
      console.error('🌉 [TabBridge] Error al enviar mensaje:', error);
    }
  }

  /**
   * Maneja el evento de pestaña abierta
   */
  private handleTabOpened(message: TabBridgeMessage): void {
    console.log('🌉 [TabBridge] Pestaña abierta detectada:', message.tabId);

    // Crear o actualizar el estado en localStorage
    localStorage.setItem('consalud_external_tab_active', message.timestamp.toString());
    localStorage.setItem('consalud_external_tab_open', JSON.stringify({
      tabId: message.tabId,
      url: message.data?.url,
      timestamp: message.timestamp,
      confirmed: true
    }));

    // Emitir evento personalizado para que otros componentes reaccionen
    window.dispatchEvent(new CustomEvent('consalud-tab-opened', {
      detail: { tabId: message.tabId, url: message.data?.url }
    }));
  }

  /**
   * Maneja el evento de pestaña cerrada
   */
  private handleTabClosed(message: TabBridgeMessage): void {
    console.log('🌉 [TabBridge] Pestaña cerrada detectada:', message.tabId);

    // Limpiar el estado del localStorage
    localStorage.removeItem('consalud_external_tab_active');
    localStorage.removeItem('consalud_external_tab_open');

    // Emitir evento personalizado para que otros componentes reaccionen
    window.dispatchEvent(new CustomEvent('consalud-tab-closed', {
      detail: { tabId: message.tabId }
    }));
  }

  /**
   * Maneja el heartbeat para mantener la comunicación activa
   */
  private handleHeartbeat(message: TabBridgeMessage): void {
    // Actualizar el timestamp de la pestaña activa
    const activeTabData = localStorage.getItem('consalud_external_tab_open');
    if (activeTabData) {
      try {
        const tabData = JSON.parse(activeTabData);
        if (tabData.tabId === message.tabId) {
          localStorage.setItem('consalud_external_tab_active', message.timestamp.toString());
          console.log('🌉 [TabBridge] Heartbeat recibido de:', message.tabId);
        }
      } catch (error) {
        console.error('🌉 [TabBridge] Error al procesar heartbeat:', error);
      }
    }
  }

  /**
   * Maneja la solicitud de desbloqueo
   */
  private handleUnlockRequest(message: TabBridgeMessage): void {
    console.log('🌉 [TabBridge] Solicitud de desbloqueo recibida:', message.tabId);

    // Limpiar el estado del localStorage
    localStorage.removeItem('consalud_external_tab_active');
    localStorage.removeItem('consalud_external_tab_open');

    // Emitir evento personalizado para desbloquear
    window.dispatchEvent(new CustomEvent('consalud-unlock-request', {
      detail: { tabId: message.tabId }
    }));
  }

  /**
   * Inicia el heartbeat para mantener la comunicación activa
   */
  private startHeartbeat(): void {
    // Solo iniciar heartbeat si somos la pestaña principal
    if (window.opener === null) {
      this.heartbeatInterval = setInterval(() => {
        const activeTabData = localStorage.getItem('consalud_external_tab_open');
        if (activeTabData) {
          try {
            const tabData = JSON.parse(activeTabData);
            const message: TabBridgeMessage = {
              type: 'HEARTBEAT',
              tabId: tabData.tabId,
              timestamp: Date.now()
            };
            this.sendMessage(message);
          } catch (error) {
            console.error('🌉 [TabBridge] Error al enviar heartbeat:', error);
          }
        }
      }, 5000); // Heartbeat cada 5 segundos
    }
  }

  /**
   * Detiene el heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Limpia recursos del servicio
   */
  cleanup(): void {
    console.log('🌉 [TabBridge] Limpiando servicio de puente');
    this.stopHeartbeat();
    this.channel.close();
    this.isInitialized = false;
  }

  /**
   * Obtiene el estado actual de las pestañas
   */
  getTabState(): { hasActiveTab: boolean; tabId?: string; timestamp?: number } {
    const activeTabTimestamp = localStorage.getItem('consalud_external_tab_active');
    const activeTabData = localStorage.getItem('consalud_external_tab_open');

    if (activeTabTimestamp && activeTabData) {
      try {
        const tabData = JSON.parse(activeTabData);
        return {
          hasActiveTab: true,
          tabId: tabData.tabId,
          timestamp: parseInt(activeTabTimestamp)
        };
      } catch (error) {
        console.error('🌉 [TabBridge] Error al parsear datos de pestaña:', error);
      }
    }

    return { hasActiveTab: false };
  }
}

// Instancia singleton del servicio
export const tabBridgeService = new TabBridgeService();

// Inicializar automáticamente
tabBridgeService.initialize();
