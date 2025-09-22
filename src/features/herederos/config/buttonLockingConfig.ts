/**
 * Configuración del sistema de bloqueo de botones
 * Centraliza todas las configuraciones para facilitar el mantenimiento
 */

export interface ButtonLockingConfig {
  // Configuración de notificaciones
  notifications: {
    showOverlay: boolean;
    showTopBar: boolean;
    autoHide: boolean;
    hideDelay: number;
  };

  // Configuración de timeouts
  timeouts: {
    maxLockTime: number; // Tiempo máximo de bloqueo en ms
    tabCheckInterval: number; // Intervalo de verificación de pestañas en ms
    tabCheckIntervalLong: number; // Intervalo largo de verificación en ms
  };

  // Configuración de detección de pestañas
  tabDetection: {
    enabled: boolean;
    methods: ('closed' | 'location' | 'focus')[];
    retryAttempts: number;
  };

  // Configuración de eventos
  events: {
    emitCustomEvents: boolean;
    logEvents: boolean;
  };

  // Configuración de estilos
  styles: {
    addBodyClass: boolean;
    customCSSClass: string;
  };
}

/**
 * Configuración por defecto
 */
export const defaultButtonLockingConfig: ButtonLockingConfig = {
  notifications: {
    showOverlay: true,
    showTopBar: true,
    autoHide: false,
    hideDelay: 5000
  },

  timeouts: {
    maxLockTime: 10 * 60 * 1000, // 10 minutos
    tabCheckInterval: 1000, // 1 segundo
    tabCheckIntervalLong: 5000 // 5 segundos
  },

  tabDetection: {
    enabled: true,
    methods: ['closed', 'location'],
    retryAttempts: 3
  },

  events: {
    emitCustomEvents: true,
    logEvents: true
  },

  styles: {
    addBodyClass: true,
    customCSSClass: 'buttons-locked'
  }
};

/**
 * Configuración para desarrollo
 */
export const developmentButtonLockingConfig: ButtonLockingConfig = {
  ...defaultButtonLockingConfig,
  timeouts: {
    maxLockTime: 2 * 60 * 1000, // 2 minutos en desarrollo
    tabCheckInterval: 500, // Verificación más frecuente
    tabCheckIntervalLong: 2000
  },
  events: {
    emitCustomEvents: true,
    logEvents: true
  }
};

/**
 * Configuración para producción
 */
export const productionButtonLockingConfig: ButtonLockingConfig = {
  ...defaultButtonLockingConfig,
  timeouts: {
    maxLockTime: 15 * 60 * 1000, // 15 minutos en producción
    tabCheckInterval: 2000, // Verificación menos frecuente
    tabCheckIntervalLong: 10000
  },
  events: {
    emitCustomEvents: true,
    logEvents: false
  }
};

/**
 * Obtiene la configuración según el entorno
 */
export const getButtonLockingConfig = (): ButtonLockingConfig => {
  const env = import.meta.env.MODE;

  switch (env) {
    case 'development':
      return developmentButtonLockingConfig;
    case 'production':
      return productionButtonLockingConfig;
    default:
      return defaultButtonLockingConfig;
  }
};

/**
 * Mensajes de error personalizables
 */
export const buttonLockingMessages = {
  errors: {
    urlInvalid: 'URL inválida para abrir en pestaña externa',
    popupBlocked: 'No se pudo abrir la pestaña. Verifique que los popups estén permitidos.',
    tabAlreadyOpen: 'Ya hay una pestaña externa abierta. Cierre la pestaña actual antes de abrir una nueva.',
    rutNotFound: 'No se encontró RUT del heredero en el session storage',
    tabClosed: 'Pestaña externa cerrada detectada',
    tabInaccessible: 'Pestaña externa inaccesible (location null)',
    tabDifferentDomain: 'Pestaña externa en dominio diferente o cerrada',
    maxLockTimeExceeded: 'Desbloqueando botones automáticamente después del tiempo máximo'
  },

  success: {
    tabOpened: 'Pestaña externa abierta exitosamente',
    tabClosed: 'Pestaña externa cerrada exitosamente',
    buttonsLocked: 'Botones bloqueados',
    buttonsUnlocked: 'Botones desbloqueados'
  },

  info: {
    startingTabCheck: 'Iniciando verificación periódica de pestaña externa',
    stoppingTabCheck: 'Deteniendo verificación periódica de pestaña',
    tabCheckAdditional: 'Verificación adicional: pestaña cerrada'
  }
};

/**
 * Utilidades de configuración
 */
export const buttonLockingUtils = {
  /**
   * Valida una configuración
   */
  validateConfig: (config: Partial<ButtonLockingConfig>): boolean => {
    if (config.timeouts?.maxLockTime && config.timeouts.maxLockTime < 60000) {
      console.warn('⚠️ Tiempo máximo de bloqueo muy bajo (< 1 minuto)');
      return false;
    }

    if (config.timeouts?.tabCheckInterval && config.timeouts.tabCheckInterval < 100) {
      console.warn('⚠️ Intervalo de verificación muy bajo (< 100ms)');
      return false;
    }

    return true;
  },

  /**
   * Combina configuraciones
   */
  mergeConfig: (base: ButtonLockingConfig, override: Partial<ButtonLockingConfig>): ButtonLockingConfig => {
    return {
      ...base,
      ...override,
      notifications: { ...base.notifications, ...override.notifications },
      timeouts: { ...base.timeouts, ...override.timeouts },
      tabDetection: { ...base.tabDetection, ...override.tabDetection },
      events: { ...base.events, ...override.events },
      styles: { ...base.styles, ...override.styles }
    };
  },

  /**
   * Obtiene el mensaje de error por clave
   */
  getErrorMessage: (key: keyof typeof buttonLockingMessages.errors): string => {
    return buttonLockingMessages.errors[key];
  },

  /**
   * Obtiene el mensaje de éxito por clave
   */
  getSuccessMessage: (key: keyof typeof buttonLockingMessages.success): string => {
    return buttonLockingMessages.success[key];
  }
};

