import { runtimeEnv } from './runtimeEnv';

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
    // Usa runtimeEnv (simplificado sin variables duplicadas VITE_APP_*)
    this.env = {
      apiUrl: runtimeEnv.VITE_API_ARQUITECTURA_URL || '',
      apiKey: runtimeEnv.VITE_KEY_PASS_API_ARQ || '',
      clientId: runtimeEnv.VITE_CLIENT_ID || '',
      authority: runtimeEnv.VITE_AUTHORITY || '',
      ambiente: runtimeEnv.VITE_AMBIENTE || 'development',
      sistema: runtimeEnv.VITE_SISTEMA || 'ManHerederos',
      nombreSistema: runtimeEnv.VITE_NOMBRE_SISTEMA || 'Administrador de Devolución a Herederos',
      timeout: Number(runtimeEnv.VITE_TIMEOUT) || 10000,
      redirectUri: (() => {
        const uri = runtimeEnv.VITE_REDIRECT_URI || '/login';
        // Si empieza con http o https, usar tal cual
        return uri.startsWith('http')
          ? uri
          : window.location.origin + (uri.startsWith('/') ? uri : '/' + uri);
      })(),
    };

    this.validateEnv();
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
