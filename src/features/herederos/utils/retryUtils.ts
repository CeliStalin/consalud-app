/**
 * Utilidades para manejo de reintentos en llamadas a APIs
 */

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // en milisegundos
  maxDelay: number; // en milisegundos
  backoffMultiplier: number;
  retryableStatusCodes: number[];
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 segundo
  maxDelay: 10000, // 10 segundos
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504] // Timeout, Too Many Requests, Server Errors
};

/**
 * Calcula el delay para el siguiente reintento usando backoff exponencial
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Verifica si un error es retryable basado en el status code
 */
function isRetryableError(error: any, config: RetryConfig): boolean {
  // Si es un error de red (TypeError con fetch)
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }

  // Si tiene status code, verificar si es retryable
  if (error.status || error.statusCode) {
    const statusCode = error.status || error.statusCode;
    return config.retryableStatusCodes.includes(statusCode);
  }

  // Si es un error de timeout
  if (error.message && error.message.includes('timeout')) {
    return true;
  }

  return false;
}

/**
 * Ejecuta una función con reintentos automáticos
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  operationName: string = 'Operation'
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      console.log(`🔄 ${operationName} - Intento ${attempt}/${config.maxRetries + 1}`);

      const result = await operation();

      if (attempt > 1) {
        console.log(`✅ ${operationName} - Éxito en el intento ${attempt}`);
      }

      return result;
    } catch (error: any) {
      lastError = error;

      console.log(`❌ ${operationName} - Intento ${attempt} falló:`, {
        error: error.message,
        status: error.status || error.statusCode,
        isRetryable: isRetryableError(error, config)
      });

      // Si es el último intento o el error no es retryable, lanzar el error
      if (attempt === config.maxRetries + 1 || !isRetryableError(error, config)) {
        console.error(`💥 ${operationName} - Falló definitivamente después de ${attempt} intentos`);
        throw error;
      }

      // Calcular delay para el siguiente intento
      const delay = calculateDelay(attempt, config);
      console.log(`⏳ ${operationName} - Esperando ${delay}ms antes del siguiente intento...`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Configuraciones específicas para diferentes tipos de operaciones
 */
export const RETRY_CONFIGS = {
  // Para APIs críticas que deben funcionar
  CRITICAL: {
    ...DEFAULT_RETRY_CONFIG,
    maxRetries: 3,
    baseDelay: 1000
  },

  // Para operaciones de documentos (más tolerante a fallos)
  DOCUMENTS: {
    ...DEFAULT_RETRY_CONFIG,
    maxRetries: 2,
    baseDelay: 2000
  },

  // Para operaciones rápidas
  FAST: {
    ...DEFAULT_RETRY_CONFIG,
    maxRetries: 2,
    baseDelay: 500
  }
} as const;

