/**
 * Servicio para comunicación entre pestañas
 * Implementa PostMessage para comunicación cross-origin y BroadcastChannel para same-origin
 */

export interface TabMessage {
  type: 'TAB_OPENED' | 'TAB_CLOSED' | 'TAB_HEARTBEAT' | 'TAB_READY';
  source: 'consalud-app' | 'external-tab' | 'mandatos-tab';
  timestamp: number;
  tabId?: string;
  url?: string;
}

export interface ExternalTabInfo {
  tabId: string;
  url: string;
  lastHeartbeat: number;
  windowRef: Window | null;
}

class TabCommunicationService {
  private broadcastChannel: BroadcastChannel | null = null;
  private externalTabs: Map<string, ExternalTabInfo> = new Map();
  private heartbeatInterval: number | null = null;
  private messageHandlers: Map<string, (message: TabMessage) => void> = new Map();
  private isInitialized = false;

  /**
   * Inicializa el servicio de comunicación
   */
  initialize(): void {
    if (this.isInitialized) return;

    console.log('🔗 [TabCommunication] Inicializando servicio de comunicación entre pestañas');

    // Crear BroadcastChannel para comunicación same-origin
    try {
      this.broadcastChannel = new BroadcastChannel('consalud-mandatos-channel');
      this.broadcastChannel.onmessage = this.handleBroadcastMessage.bind(this);
      console.log('✅ [TabCommunication] BroadcastChannel inicializado');
    } catch (error) {
      console.warn('⚠️ [TabCommunication] No se pudo inicializar BroadcastChannel:', error);
    }

    // Configurar listener para mensajes de window.postMessage
    window.addEventListener('message', this.handlePostMessage.bind(this));

    // Configurar heartbeat para verificar pestañas externas
    this.startHeartbeat();

    // Notificar que esta pestaña está abierta
    this.notifyTabOpened();

    // Configurar cleanup al cerrar la pestaña
    window.addEventListener('beforeunload', this.handleTabClosing.bind(this));

    this.isInitialized = true;
  }

  /**
   * Inicializa la detección de pestañas
   */
  private initTabDetection(): void {
    console.log('🔍 [TabCommunication] Inicializando detección de pestañas');

    // Configurar detección de visibilidad para detectar pestañas activas
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('🔍 [TabCommunication] Pestaña principal oculta - posible pestaña externa activa');
      } else {
        console.log('🔍 [TabCommunication] Pestaña principal visible');
      }
    });

    // Configurar detección de foco para detectar cambios de pestaña
    window.addEventListener('focus', () => {
      console.log('🔍 [TabCommunication] Pestaña principal enfocada');
    });

    window.addEventListener('blur', () => {
      console.log('🔍 [TabCommunication] Pestaña principal perdió foco - posible pestaña externa activa');
    });
  }

  /**
   * Registra un handler para mensajes específicos
   */
  onMessage(type: string, handler: (message: TabMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Abre una pestaña externa y establece comunicación
   */
  async openExternalTab(url: string): Promise<string> {
    console.log('🚀 [TabCommunication] Abriendo pestaña externa:', url);

    const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Abrir la pestaña
      const newTab = window.open(url, '_blank', 'noopener,noreferrer');

      // Manejar el caso donde el navegador bloquea popups pero aún abre la pestaña
      if (!newTab) {
        console.warn('⚠️ [TabCommunication] window.open retornó null - posible bloqueo de popups');

      // Crear un objeto mock INMEDIATAMENTE para representar la pestaña abierta
      // Esto asegura que el bloqueo se mantenga hasta que se confirme que no hay pestaña
      const mockTabInfo: ExternalTabInfo = {
        tabId,
        url,
        lastHeartbeat: Date.now(),
        windowRef: null // No tenemos referencia directa
      };

      this.externalTabs.set(tabId, mockTabInfo);
      console.log('✅ [TabCommunication] Pestaña externa registrada como mock (popup bloqueado):', tabId);

      // Crear ID único simple en localStorage para esta pestaña
      this.createSimpleTabId(tabId, url);

      // Notificar que se detectó una pestaña (aunque no podemos comunicarnos con ella)
      this.notifyExternalTabOpened(tabId);

      // TEMPORALMENTE DESHABILITADO: Verificación automática que estaba limpiando localStorage prematuramente
      // setTimeout(() => {
      //   this.verifyAndCleanupMockTab(tabId);
      // }, 5000);

      // Retornar el tabId incluso si no tenemos referencia directa
      return tabId;
      }

      // Registrar la pestaña externa (caso normal)
      const tabInfo: ExternalTabInfo = {
        tabId,
        url,
        lastHeartbeat: Date.now(),
        windowRef: newTab
      };

      this.externalTabs.set(tabId, tabInfo);

      // Crear ID único simple en localStorage para esta pestaña
      this.createSimpleTabId(tabId, url);

      // Inyectar script de comunicación en la pestaña externa
      this.injectCommunicationScript(newTab, tabId);

      console.log('✅ [TabCommunication] Pestaña externa registrada:', tabId);
      return tabId;

    } catch (error) {
      console.error('❌ [TabCommunication] Error al abrir pestaña externa:', error);
      throw error;
    }
  }

  /**
   * Inyecta el script de comunicación en la pestaña externa
   */
  private injectCommunicationScript(newTab: Window, tabId: string): void {
    // Esperar a que la pestaña se cargue
    setTimeout(() => {
      try {
        // Crear script de comunicación
        const script = newTab.document.createElement('script');
        script.textContent = `
          (function() {
            'use strict';

            const tabId = '${tabId}';
            const parentWindow = window.opener;

            console.log('🔗 [ExternalTab] Script de comunicación cargado para tabId:', tabId);

            // Función para enviar mensaje al padre
            function sendToParent(type, data = {}) {
              if (parentWindow && !parentWindow.closed) {
                parentWindow.postMessage({
                  type: type,
                  source: 'external-tab',
                  tabId: tabId,
                  timestamp: Date.now(),
                  ...data
                }, '*');
              }
            }

            // Notificar que la pestaña está lista
            sendToParent('TAB_READY');

            // Configurar heartbeat cada 2 segundos
            const heartbeatInterval = setInterval(() => {
              sendToParent('TAB_HEARTBEAT');
            }, 2000);

            // Notificar cierre de pestaña
            window.addEventListener('beforeunload', () => {
              clearInterval(heartbeatInterval);
              sendToParent('TAB_CLOSED');
            });

            // Notificar cuando la pestaña pierde/gana foco
            window.addEventListener('blur', () => {
              sendToParent('TAB_HEARTBEAT', { status: 'blurred' });
            });

            window.addEventListener('focus', () => {
              sendToParent('TAB_HEARTBEAT', { status: 'focused' });
            });

            console.log('✅ [ExternalTab] Comunicación configurada');
          })();
        `;

        newTab.document.head.appendChild(script);
        console.log('✅ [TabCommunication] Script de comunicación inyectado');

      } catch (error) {
        console.warn('⚠️ [TabCommunication] No se pudo inyectar script de comunicación:', error);
      }
    }, 1000);
  }

  /**
   * Maneja mensajes del BroadcastChannel
   */
  private handleBroadcastMessage(event: MessageEvent): void {
    console.log('📡 [TabCommunication] Mensaje BroadcastChannel recibido:', event.data);
    this.processMessage(event.data);
  }

  /**
   * Maneja mensajes de window.postMessage
   */
  private handlePostMessage(event: MessageEvent): void {
    // Solo procesar mensajes de pestañas externas
    if (event.data && event.data.source === 'external-tab') {
      console.log('📨 [TabCommunication] Mensaje PostMessage recibido:', event.data);
      this.processMessage(event.data);
    }
  }

  /**
   * Procesa un mensaje recibido
   */
  private processMessage(message: TabMessage): void {
    const { type, tabId } = message;

    switch (type) {
      case 'TAB_READY':
        console.log('✅ [TabCommunication] Pestaña externa lista:', tabId);
        break;

      case 'TAB_HEARTBEAT':
        if (tabId && this.externalTabs.has(tabId)) {
          const tabInfo = this.externalTabs.get(tabId)!;
          tabInfo.lastHeartbeat = Date.now();
          console.log('💓 [TabCommunication] Heartbeat recibido de:', tabId);
        }
        break;

      case 'TAB_CLOSED':
        if (tabId && this.externalTabs.has(tabId)) {
          console.log('🔒 [TabCommunication] Pestaña externa cerrada:', tabId);
          this.externalTabs.delete(tabId);
          this.notifyExternalTabClosed(tabId);
        }
        break;
    }

    // Llamar handlers registrados
    const handler = this.messageHandlers.get(type);
    if (handler) {
      handler(message);
    }
  }

  /**
   * Notifica que una pestaña de la aplicación está abierta
   */
  private notifyTabOpened(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'TAB_OPENED',
        source: 'consalud-app',
        timestamp: Date.now(),
        url: window.location.href
      });
    }
  }

  /**
   * Notifica que una pestaña externa se abrió
   */
  private notifyExternalTabOpened(tabId: string): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'TAB_OPENED',
        source: 'consalud-app',
        timestamp: Date.now(),
        tabId
      });
    }
  }

  /**
   * Notifica que una pestaña externa se cerró
   */
  private notifyExternalTabClosed(tabId: string): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'TAB_CLOSED',
        source: 'consalud-app',
        timestamp: Date.now(),
        tabId
      });
    }
  }

  /**
   * Maneja el cierre de la pestaña actual
   */
  private handleTabClosing(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'TAB_CLOSED',
        source: 'consalud-app',
        timestamp: Date.now(),
        url: window.location.href
      });
    }
  }

  /**
   * Inicia el sistema de heartbeat para verificar pestañas externas
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = window.setInterval(() => {
      const now = Date.now();
      const timeout = 5000; // 5 segundos sin heartbeat = pestaña cerrada

      for (const [tabId, tabInfo] of this.externalTabs.entries()) {
        if (now - tabInfo.lastHeartbeat > timeout) {
          console.log('⏰ [TabCommunication] Timeout de heartbeat para pestaña:', tabId);
          this.externalTabs.delete(tabId);
          this.notifyExternalTabClosed(tabId);
        }
      }
    }, 3000); // Verificar cada 3 segundos
  }

  /**
   * Verifica si hay pestañas externas abiertas
   */
  hasExternalTabs(): boolean {
    return this.externalTabs.size > 0;
  }

  /**
   * Verifica y limpia pestañas mock que no se pueden detectar
   */
  private verifyAndCleanupMockTab(tabId: string): void {
    const tabInfo = this.externalTabs.get(tabId);
    if (!tabInfo || tabInfo.windowRef) {
      // Si la pestaña tiene windowRef, no es mock, no limpiar
      return;
    }

    console.log('🔍 [TabCommunication] Verificando pestaña mock:', tabId);

    // Intentar detectar si realmente hay una pestaña abierta usando técnicas alternativas
    const hasRealTab = this.detectOpenTabs();

    if (!hasRealTab) {
      console.log('🗑️ [TabCommunication] Limpiando pestaña mock - no se detectó pestaña real:', tabId);
      this.closeExternalTab(tabId);
    } else {
      console.log('✅ [TabCommunication] Pestaña mock confirmada como real:', tabId);
    }
  }

  /**
   * Detecta manualmente si hay pestañas abiertas usando técnicas alternativas
   * Útil cuando window.open retorna null pero la pestaña se abre
   */
  detectOpenTabs(): boolean {
    try {
      console.log('🔍 [TabCommunication] Detectando pestañas abiertas...');

      // Técnica 1: Verificar si window.focus() funciona
      // Si hay otras pestañas abiertas, window.focus() puede no funcionar
      const originalFocus = document.hasFocus();

      // Intentar hacer foco en la ventana
      window.focus();

      // Técnica 2: Verificar si hay ventanas en la lista de ventanas del navegador
      // (Esto solo funciona en algunos navegadores y contextos)
      if (window.opener || window.parent !== window) {
        console.log('🔍 [TabCommunication] Ventana detectada como hija/abierta');
        return true;
      }

      // Técnica 3: Verificar si hay pestañas usando localStorage y eventos de visibilidad
      // Esta técnica es más confiable para detectar pestañas activas
      const hasActiveExternalTab = this.checkActiveExternalTabs();

      if (hasActiveExternalTab) {
        console.log('🔍 [TabCommunication] Pestaña externa activa detectada');
        return true;
      }

      // Técnica 4: Verificar si hay pestañas usando el evento beforeunload
      // Si hay pestañas abiertas, el evento puede comportarse diferente
      const hasUnloadProtection = this.checkUnloadProtection();

      if (hasUnloadProtection) {
        console.log('🔍 [TabCommunication] Protección de cierre detectada - posible pestaña externa');
        return true;
      }

      console.log('🔍 [TabCommunication] No se detectaron pestañas externas');
      return false;
    } catch (error) {
      console.warn('⚠️ [TabCommunication] Error en detección manual de pestañas:', error);
      return false;
    }
  }

  /**
   * Verifica si hay pestañas externas activas usando técnicas de visibilidad
   */
  private checkActiveExternalTabs(): boolean {
    try {
      // Verificar si hay pestañas usando localStorage como indicador
      const tabKey = 'consalud_external_tab_active';
      const currentTime = Date.now();

      // Marcar que esta pestaña está activa
      localStorage.setItem(tabKey, currentTime.toString());

      // Verificar si hay otras pestañas marcadas como activas
      // (Esta es una técnica heurística)
      return false; // Por ahora, retornar false hasta implementar mejor
    } catch (error) {
      console.warn('⚠️ [TabCommunication] Error en verificación de pestañas activas:', error);
      return false;
    }
  }

  /**
   * Verifica si hay protección contra cierre de ventana (indicador de pestañas abiertas)
   */
  private checkUnloadProtection(): boolean {
    try {
      // Esta técnica es experimental y puede no ser confiable
      // Se basa en la idea de que las pestañas externas pueden tener protección contra cierre
      return false; // Por ahora, retornar false hasta implementar mejor
    } catch (error) {
      console.warn('⚠️ [TabCommunication] Error en verificación de protección de cierre:', error);
      return false;
    }
  }

  /**
   * Obtiene información de las pestañas externas
   */
  getExternalTabs(): ExternalTabInfo[] {
    return Array.from(this.externalTabs.values());
  }

  /**
   * Cierra una pestaña externa específica
   */
  closeExternalTab(tabId: string): void {
    const tabInfo = this.externalTabs.get(tabId);
    if (tabInfo && tabInfo.windowRef && !tabInfo.windowRef.closed) {
      try {
        tabInfo.windowRef.close();
      } catch (error) {
        console.warn('⚠️ [TabCommunication] No se pudo cerrar pestaña externa:', error);
      }
    }

    // Limpiar estado persistente en localStorage
    this.clearPersistentState(tabId);

    this.externalTabs.delete(tabId);
  }

  /**
   * Limpia el estado persistente en localStorage
   */
  private clearPersistentState(tabId: string): void {
    try {
      // Limpiar ambas claves del localStorage
      localStorage.removeItem('consalud_external_tab_active');
      localStorage.removeItem('consalud_external_tab_open');
      console.log(`🧹 [TabCommunication] Estado persistente limpiado para ${tabId} (consalud_external_tab_active y consalud_external_tab_open)`);
    } catch (error) {
      console.error('❌ [TabCommunication] Error al limpiar estado persistente:', error);
    }
  }

  /**
   * Crea un ID único simple en localStorage para la pestaña
   */
  private createSimpleTabId(tabId: string, url: string): void {
    try {
      const simpleTabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Guardar en localStorage con un ID único simple
      localStorage.setItem('consalud_external_tab_active', Date.now().toString());
      localStorage.setItem('consalud_external_tab_open', JSON.stringify({
        tabId: simpleTabId,
        url,
        timestamp: Date.now(),
        confirmed: false
      }));

      console.log(`✅ [TabCommunication] ID único creado para pestaña: ${simpleTabId}`);
    } catch (error) {
      console.error('❌ [TabCommunication] Error al crear ID único:', error);
    }
  }

  /**
   * Inyecta script de detección de cierre en la pestaña externa
   */
  private injectCommunicationScript(tabWindow: Window, tabId: string): void {
    try {
      // Esperar a que la pestaña cargue
      setTimeout(() => {
        try {
          // Crear script que se ejecute en la pestaña externa
          const script = `
            (function() {
              console.log('🚀 [External Tab] Script de detección inyectado en pestaña externa');

              // Función para limpiar localStorage cuando se cierre la pestaña
              function cleanupOnClose() {
                console.log('🧹 [External Tab] Limpiando localStorage al cerrar pestaña');
                try {
                  localStorage.removeItem('consalud_external_tab_active');
                  localStorage.removeItem('consalud_external_tab_open');

                  // Notificar a la pestaña principal
                  if (window.opener) {
                    window.opener.postMessage({
                      type: 'TAB_CLOSED',
                      tabId: '${tabId}',
                      source: 'external-tab'
                    }, '*');
                  }
                } catch (error) {
                  console.error('❌ [External Tab] Error al limpiar localStorage:', error);
                }
              }

              // Detectar cierre de pestaña
              window.addEventListener('beforeunload', cleanupOnClose);
              window.addEventListener('unload', cleanupOnClose);

              // También detectar cuando la pestaña pierde foco (posible cierre)
              let focusLost = false;
              window.addEventListener('blur', () => {
                focusLost = true;
                setTimeout(() => {
                  if (focusLost && document.hidden) {
                    console.log('🔍 [External Tab] Pestaña posiblemente cerrada (perdió foco)');
                    cleanupOnClose();
                  }
                }, 1000);
              });

              // Restaurar foco si la pestaña sigue activa
              window.addEventListener('focus', () => {
                focusLost = false;
              });

              console.log('✅ [External Tab] Detección de cierre configurada');
            })();
          `;

          // Intentar ejecutar el script en la pestaña externa
          tabWindow.eval(script);
          console.log(`✅ [TabCommunication] Script de detección inyectado en pestaña ${tabId}`);

        } catch (error) {
          console.warn(`⚠️ [TabCommunication] No se pudo inyectar script en pestaña ${tabId}:`, error);
          // Esto es normal por políticas CORS, pero intentamos de todas formas
        }
      }, 1000);

    } catch (error) {
      console.error('❌ [TabCommunication] Error al inyectar script:', error);
    }
  }

  /**
   * Configura monitoreo para detectar cuando se cierra la pestaña
   */
  private setupTabCloseMonitoring(tabId: string): void {
    console.log(`🔍 [TabCommunication] Configurando monitoreo de cierre para ${tabId}`);

    // Monitorear cambios en la visibilidad de la página
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log(`🔍 [TabCommunication] Pestaña principal oculta - posible cambio a pestaña externa ${tabId}`);
      } else {
        console.log(`🔍 [TabCommunication] Pestaña principal visible - verificando si ${tabId} aún está abierta`);

        // Verificar si la pestaña externa aún está abierta
        setTimeout(() => {
          this.checkIfTabStillOpen(tabId);
        }, 1000);
      }
    };

    // Monitorear cuando la página vuelve a tener foco
    const handleFocus = () => {
      console.log(`🔍 [TabCommunication] Pestaña principal enfocada - verificando estado de ${tabId}`);
      setTimeout(() => {
        this.checkIfTabStillOpen(tabId);
      }, 500);
    };

    // Agregar listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Limpiar listeners después de 5 minutos
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    }, 300000);
  }

  /**
   * Verifica si una pestaña externa aún está abierta
   */
  private checkIfTabStillOpen(tabId: string): void {
    const tabInfo = this.externalTabs.get(tabId);
    if (!tabInfo) {
      return; // La pestaña ya fue limpiada
    }

    // Si es una pestaña mock (sin windowRef), usar técnicas de detección alternativas
    if (!tabInfo.windowRef) {
      console.log(`🔍 [TabCommunication] Verificando pestaña mock ${tabId} usando técnicas alternativas`);

      // Verificar si hay cambios en el foco o visibilidad que indiquen que la pestaña se cerró
      const hasRealTab = this.detectOpenTabs();

      if (!hasRealTab) {
        console.log(`🗑️ [TabCommunication] Pestaña mock ${tabId} parece estar cerrada - limpiando`);
        this.closeExternalTab(tabId);
      }
    }
  }

  /**
   * Cierra todas las pestañas externas
   */
  closeAllExternalTabs(): void {
    for (const [tabId, tabInfo] of this.externalTabs.entries()) {
      this.closeExternalTab(tabId);
    }
  }

  /**
   * Limpia recursos
   */
  destroy(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }

    this.closeAllExternalTabs();
    this.externalTabs.clear();
    this.messageHandlers.clear();
    this.isInitialized = false;

    console.log('🧹 [TabCommunication] Servicio destruido');
  }
}

// Instancia singleton
export const tabCommunicationService = new TabCommunicationService();
