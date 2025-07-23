/**
 * Utilidades centralizadas para servicios de API
 */

export interface ApiConfig {
  baseUrl: string;
  apiKeyHeader: string;
  apiKeyValue: string;
}

/**
 * Obtiene la configuración de API para herederos
 */
export function getHerederosApiConfig(): ApiConfig {
  return {
    baseUrl: import.meta.env.VITE_BFF_HEREDEROS_DNS || '',
    apiKeyHeader: import.meta.env.VITE_BFF_HEREDEROS_API_KEY_HEADER || '',
    apiKeyValue: import.meta.env.VITE_BFF_HEREDEROS_API_KEY_VALUE || ''
  };
}

/**
 * Construye headers comunes para las peticiones
 */
export function buildHeaders(config: ApiConfig, additionalHeaders?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'accept': 'application/json',
    ...additionalHeaders
  };

  if (config.apiKeyHeader && config.apiKeyValue) {
    headers[config.apiKeyHeader] = config.apiKeyValue;
  }

  return headers;
}

/**
 * Maneja errores de API de forma consistente
 */
export function handleApiError(error: any, context: string): never {
  if (import.meta.env.DEV) {
    console.error(`Error en ${context}:`, error);
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error(`Error en ${context}: ${error?.message || 'Error desconocido'}`);
}

/**
 * Función helper para hacer peticiones GET
 */
export async function apiGet<T>(url: string, config: ApiConfig, context: string): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(config)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    handleApiError(error, context);
  }
}

/**
 * Función helper para hacer peticiones POST
 */
export async function apiPost<T>(url: string, data: any, config: ApiConfig, context: string): Promise<T> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(config, {
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    handleApiError(error, context);
  }
} 