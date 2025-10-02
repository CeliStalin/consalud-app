/**
 * Logger Service
 * Servicio centralizado de logging con soporte para diferentes niveles
 * Solo activo en modo desarrollo, silenciado en producción
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development' || import.meta.env.MODE === 'local';
    this.config = {
      enabled: this.isDevelopment,
      level: 'info',
      prefix: '[App]'
    };
  }

  /**
   * Configura el logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log de debug - solo en desarrollo
   */
  debug(message: string, ...args: any[]): void {
    if (this.config.enabled && this.isDevelopment) {
      console.log(`${this.config.prefix} ${message}`, ...args);
    }
  }

  /**
   * Log informativo - solo en desarrollo
   */
  info(message: string, ...args: any[]): void {
    if (this.config.enabled && this.isDevelopment) {
      console.info(`${this.config.prefix} ${message}`, ...args);
    }
  }

  /**
   * Warning - visible en todos los ambientes
   */
  warn(message: string, ...args: any[]): void {
    if (this.config.enabled) {
      console.warn(`${this.config.prefix} ${message}`, ...args);
    }
  }

  /**
   * Error - siempre visible
   */
  error(message: string, error?: any): void {
    console.error(`${this.config.prefix} ${message}`, error || '');
  }

  /**
   * Crea un logger con prefijo personalizado
   */
  createLogger(prefix: string): Logger {
    const logger = new Logger();
    logger.configure({ ...this.config, prefix: `[${prefix}]` });
    return logger;
  }
}

// Exportar instancia singleton
export const logger = new Logger();

// Exportar función helper para crear loggers con contexto
export const createLogger = (context: string): Logger => {
  return logger.createLogger(context);
};

export default logger;
