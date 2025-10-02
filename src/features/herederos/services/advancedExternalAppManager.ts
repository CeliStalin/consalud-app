/**
 * Servicio avanzado para manejo de aplicaciones externas con Window Reference + Polling
 * Basado en la sugerencia del usuario para una solución más robusta
 */

export type WindowStatus = 'closed' | 'opening' | 'open' | 'error';

export interface ExternalAppState {
  status: WindowStatus;
  openedAt: Date | null;
  closedAt: Date | null;
  error: string | null;
  tabId?: string;
  url?: string;
}

export interface ExternalAppCallbacks {
  onOpened?: (state: ExternalAppState) => void;
  onClosed?: (state: ExternalAppState) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: WindowStatus) => void;
}

class AdvancedExternalAppManager {
  private appState: ExternalAppState = {
    status: 'closed',
    openedAt: null,
    closedAt: null,
    error: null
  };
  private windowRef: Window | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private callbacks: ExternalAppCallbacks = {};
  private readonly POLL_INTERVAL = 1000; // Verificar cada segundo

  constructor() {
    // Manager inicializado silenciosamente
  }

  /**
   * Configura los callbacks para eventos
   */
  setCallbacks(callbacks: ExternalAppCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Abre una aplicación externa
   */
  async openExternalApp(url: string, windowFeatures?: string): Promise<string> {
    try {


      this.updateState({
        status: 'opening',
        error: null
      });

      // Configuración por defecto de la ventana
      const defaultFeatures = 'width=1200,height=800,scrollbars=yes,resizable=yes,menubar=no,toolbar=no';
      const features = windowFeatures || defaultFeatures;

      // Generar un ID único para esta pestaña
      const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      this.windowRef = window.open(url, 'external_app', features);

      if (!this.windowRef) {
        throw new Error('No se pudo abrir la ventana (popup bloqueado)');
      }

      // Verificar que la ventana se abrió correctamente
      await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (this.windowRef && !this.windowRef.closed) {
            resolve();
          } else {
            reject(new Error('La ventana se cerró inmediatamente'));
          }
        }, 500);
      });

      this.updateState({
        status: 'open',
        openedAt: new Date(),
        closedAt: null,
        error: null,
        tabId,
        url
      });

      // Guardar en localStorage para persistencia
      this.saveToLocalStorage(tabId, url);

      this.startMonitoring();
      this.callbacks.onOpened?.(this.appState);


      return tabId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ [AdvancedExternalAppManager] Error al abrir aplicación externa:', errorMessage);

      this.updateState({
        status: 'error',
        error: errorMessage
      });

      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  /**
   * Inicia el monitoreo de la ventana
   */
  private startMonitoring(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }



    this.pollInterval = setInterval(() => {
      if (this.windowRef?.closed) {
        this.handleWindowClosed();
      } else if (this.windowRef) {
        // La ventana sigue abierta, actualizar timestamp en localStorage
        this.updateLocalStorageTimestamp();
      }
    }, this.POLL_INTERVAL);
  }

  /**
   * Maneja el cierre de la ventana
   */
  private handleWindowClosed(): void {


    this.updateState({
      status: 'closed',
      closedAt: new Date()
    });

    this.stopMonitoring();
    this.clearFromLocalStorage();
    this.windowRef = null;

    this.callbacks.onClosed?.(this.appState);
    this.onApplicationClosed();
  }

  /**
   * Acciones a ejecutar cuando se cierra la aplicación externa
   */
  private onApplicationClosed(): void {


    try {
      // Ejemplo de acciones comunes:
      // - Recargar datos
      // - Mostrar notificaciones
      // - Actualizar estado global
      // - Llamadas a API

      localStorage.setItem('lastExternalAppClosed', new Date().toISOString());


    } catch (error) {
      console.error('❌ [AdvancedExternalAppManager] Error en acciones post-cierre:', error);
    }
  }

  /**
   * Detiene el monitoreo
   */
  private stopMonitoring(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;

    }
  }

  /**
   * Cierra la ventana externa manualmente
   */
  closeExternalWindow(): void {
    if (this.windowRef && !this.windowRef.closed) {

      this.windowRef.close();
      this.handleWindowClosed();
    }
  }

  /**
   * Actualiza el estado y notifica a los callbacks
   */
  private updateState(updates: Partial<ExternalAppState>): void {
    const previousStatus = this.appState.status;
    this.appState = { ...this.appState, ...updates };

    // Notificar cambio de estado
    if (previousStatus !== this.appState.status) {
      this.callbacks.onStatusChange?.(this.appState.status);
    }
  }

  /**
   * Guarda el estado en localStorage para persistencia
   */
  private saveToLocalStorage(tabId: string, url: string): void {
    const timestamp = Date.now();

    localStorage.setItem('consalud_external_tab_active', timestamp.toString());
    localStorage.setItem('consalud_external_tab_open', JSON.stringify({
      tabId,
      url,
      timestamp,
      confirmed: true,
      manager: 'AdvancedExternalAppManager'
    }));


  }

  /**
   * Actualiza el timestamp en localStorage
   */
  private updateLocalStorageTimestamp(): void {
    const timestamp = Date.now();
    localStorage.setItem('consalud_external_tab_active', timestamp.toString());
  }

  /**
   * Limpia el estado del localStorage
   */
  private clearFromLocalStorage(): void {
    localStorage.removeItem('consalud_external_tab_active');
    localStorage.removeItem('consalud_external_tab_open');

  }

  /**
   * Obtiene el estado actual
   */
  getState(): ExternalAppState {
    return { ...this.appState };
  }

  /**
   * Verifica si hay una ventana abierta
   */
  isWindowOpen(): boolean {
    return this.appState.status === 'open' && this.windowRef !== null && !this.windowRef.closed;
  }

  /**
   * Restaura el estado desde localStorage al inicializar
   */
  restoreFromLocalStorage(): boolean {
    const activeTabTimestamp = localStorage.getItem('consalud_external_tab_active');
    const activeTabData = localStorage.getItem('consalud_external_tab_open');

    if (activeTabTimestamp && activeTabData) {
      try {
        const tabData = JSON.parse(activeTabData);
        const timestamp = parseInt(activeTabTimestamp);
        const timeSinceOpened = Date.now() - timestamp;

        // Si han pasado menos de 10 minutos, restaurar el estado
        if (timeSinceOpened < 600000) {


          this.updateState({
            status: 'open',
            openedAt: new Date(timestamp),
            closedAt: null,
            error: null,
            tabId: tabData.tabId,
            url: tabData.url
          });

          // No podemos restaurar windowRef, pero podemos simular el estado
          return true;
        } else {

          this.clearFromLocalStorage();
        }
      } catch (error) {
        console.error('❌ [AdvancedExternalAppManager] Error al restaurar desde localStorage:', error);
        this.clearFromLocalStorage();
      }
    }

    return false;
  }

  /**
   * Limpia recursos
   */
  cleanup(): void {

    this.stopMonitoring();

    if (this.windowRef && !this.windowRef.closed) {
      this.windowRef.close();
    }

    this.windowRef = null;
    this.clearFromLocalStorage();

    this.updateState({
      status: 'closed',
      openedAt: null,
      closedAt: null,
      error: null
    });
  }

  /**
   * Obtiene el color del estado para UI
   */
  getStatusColor(status: WindowStatus): string {
    switch (status) {
      case 'open': return '#4CAF50';
      case 'opening': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#757575';
    }
  }
}

// Instancia singleton
export const advancedExternalAppManager = new AdvancedExternalAppManager();

// Restaurar estado al inicializar
advancedExternalAppManager.restoreFromLocalStorage();
