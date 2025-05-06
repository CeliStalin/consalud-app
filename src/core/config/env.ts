// src/core/config/env.ts
interface EnvVariables {
  apiUrl: string;
  apiKey: string;
  clientId: string;
  authority: string;
  ambiente: string;
  sistema: string;
  nombreSistema: string;
  timeout: number;
  redirectUri: string;
}

class Environment {
  private static instance: Environment;
  public readonly env: EnvVariables;

  private constructor() {
    this.env = {
      apiUrl: import.meta.env.VITE_API_ARQUITECTURA_URL || '',
      apiKey: import.meta.env.VITE_KEY_PASS_API_ARQ || '',
      clientId: import.meta.env.VITE_CLIENT_ID || '',
      authority: import.meta.env.VITE_AUTHORITY || '',
      ambiente: import.meta.env.VITE_AMBIENTE || 'development',
      sistema: import.meta.env.VITE_SISTEMA || 'ManHerederos',
      nombreSistema: import.meta.env.VITE_NOMBRE_SISTEMA || 'Administrador de Devolución a Herederos',
      timeout: Number(import.meta.env.VITE_TIMEOUT) || 10000,
      redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/login',
    };

    // Validar que las variables críticas estén definidas
    this.validateEnv();
    
    // Mostrar información del ambiente en consola (solo en desarrollo)
    if (this.isDevelopment() || this.isTest()) {
      console.info(`🌎 Ambiente: ${this.env.ambiente}`);
      console.info(`🔌 API: ${this.env.apiUrl}`);
    }
  }

  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return Environment.instance;
  }

  private validateEnv(): void {
    const required = ['apiUrl', 'clientId', 'authority', 'sistema'];
    
    for (const key of required) {
      if (!this.env[key as keyof EnvVariables]) {
        console.error(`Variable de entorno requerida no disponible: ${key}`);
        // En producción, mejor lanzar un error
        if (this.isProduction()) {
          throw new Error(`Variable de entorno requerida: ${key}`);
        }
      }
    }
  }

  public get(key: keyof EnvVariables): any {
    return this.env[key];
  }

  public isDevelopment(): boolean {
    return this.env.ambiente === 'development' || this.env.ambiente === 'Desarrollo';
  }

  public isProduction(): boolean {
    return this.env.ambiente === 'production' || this.env.ambiente === 'Produccion';
  }

  public isTest(): boolean {
    return this.env.ambiente === 'test' || this.env.ambiente === 'Testing';
  }

  public isLocal(): boolean {
    return this.env.ambiente === 'local' || window.location.hostname === 'localhost';
  }
}

export const env = Environment.getInstance();