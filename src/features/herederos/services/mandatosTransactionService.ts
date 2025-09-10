import { encriptarParametrosMandatos } from './herederosService';

export interface MandatosTransactionData {
  transactionId: string;
  encryptedUrl: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'error' | 'cancelled';
}

export interface SessionStorageData {
  RutCompleto: string;
  NombrePersona: string;
  ApellidoPaterno: string;
  ApellidoMaterno: string;
}

/**
 * Servicio para manejar transacciones de mandatos con iframe
 * Implementa un sistema de puntero de información con token de transacción
 */
export class MandatosTransactionService {
  private static readonly TRANSACTION_PREFIX = 'mandatos_transaction_';
  private static readonly SESSION_DATA_KEY = 'formHerederoData_';

  /**
   * Genera un ID único para la transacción
   */
  private generateTransactionId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene datos del session storage para un RUT específico
   */
  private getSessionStorageData(rut: string): SessionStorageData | null {
    try {
      const storageKey = `${MandatosTransactionService.SESSION_DATA_KEY}${rut.replace(/[^0-9kK]/g, '')}`;
      const stored = sessionStorage.getItem(storageKey);

      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          RutCompleto: parsed.RutCompleto || '',
          NombrePersona: parsed.NombrePersona || '',
          ApellidoPaterno: parsed.ApellidoPaterno || '',
          ApellidoMaterno: parsed.ApellidoMaterno || ''
        };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener datos del session storage:', error);
      return null;
    }
  }

  /**
   * Limpia el RUT para usar en la API (sin puntos, pero manteniendo el guión y dígito verificador)
   */
  private cleanRutForApi(rutCompleto: string): string {
    // Remover solo los puntos, mantener el guión y dígito verificador
    return rutCompleto.replace(/\./g, '');
  }

  /**
   * Inicia una nueva transacción de mandatos
   * @param rut - RUT del heredero para obtener datos del session storage
   */
  async iniciarTransaccionMandatos(rut: string): Promise<MandatosTransactionData> {
    try {
      console.log('🚀 Iniciando transacción de mandatos para RUT:', rut);

      // Obtener datos del session storage
      const sessionData = this.getSessionStorageData(rut);
      if (!sessionData) {
        throw new Error('No se encontraron datos en el session storage para el RUT especificado');
      }

      console.log('📋 Datos obtenidos del session storage:', sessionData);

      // Limpiar RUT para la API
      const rutAfiliado = this.cleanRutForApi(sessionData.RutCompleto);

      // Llamar a la API de encriptación
      const encryptedUrl = await encriptarParametrosMandatos(
        'SISTEMA',
        rutAfiliado,
        sessionData.NombrePersona,
        sessionData.ApellidoPaterno,
        sessionData.ApellidoMaterno
      );

      // Validar que la URL encriptada sea válida
      if (!encryptedUrl || encryptedUrl.trim() === '') {
        throw new Error('La API de encriptación no devolvió una URL válida');
      }

      // Limpiar comillas dobles y símbolo @ si los hay
      let cleanUrl = encryptedUrl.trim();
      if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) {
        cleanUrl = cleanUrl.slice(1, -1);
        console.log('🧹 URL limpiada de comillas en transacción:', cleanUrl);
      }

      // Limpiar símbolo @ al inicio si existe
      if (cleanUrl.startsWith('@')) {
        cleanUrl = cleanUrl.slice(1);
        console.log('🧹 URL limpiada de símbolo @ en transacción:', cleanUrl);
      }

      // Verificar que la URL sea válida
      if (!cleanUrl.startsWith('http')) {
        throw new Error(`URL encriptada inválida: ${cleanUrl}`);
      }

      console.log('🔐 URL encriptada recibida:', cleanUrl);
      console.log('🔍 Longitud de la URL:', cleanUrl.length);

      // Crear datos de transacción
      const transactionId = this.generateTransactionId();
      const transactionData: MandatosTransactionData = {
        transactionId,
        encryptedUrl: cleanUrl,
        timestamp: Date.now(),
        status: 'pending'
      };

      // Guardar en session storage
      const storageKey = `${MandatosTransactionService.TRANSACTION_PREFIX}${transactionId}`;
      sessionStorage.setItem(storageKey, JSON.stringify(transactionData));

      console.log('✅ Transacción iniciada exitosamente:', transactionData);

      return transactionData;
    } catch (error) {
      console.error('❌ Error al iniciar transacción de mandatos:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos de una transacción por ID
   */
  getTransactionData(transactionId: string): MandatosTransactionData | null {
    try {
      const storageKey = `${MandatosTransactionService.TRANSACTION_PREFIX}${transactionId}`;
      const stored = sessionStorage.getItem(storageKey);

      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error al obtener datos de transacción:', error);
      return null;
    }
  }

  /**
   * Actualiza el estado de una transacción
   */
  updateTransactionStatus(transactionId: string, status: MandatosTransactionData['status']): boolean {
    try {
      const storageKey = `${MandatosTransactionService.TRANSACTION_PREFIX}${transactionId}`;
      const stored = sessionStorage.getItem(storageKey);

      if (stored) {
        const transactionData: MandatosTransactionData = JSON.parse(stored);
        transactionData.status = status;
        sessionStorage.setItem(storageKey, JSON.stringify(transactionData));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error al actualizar estado de transacción:', error);
      return false;
    }
  }

  /**
   * Limpia una transacción del session storage
   */
  clearTransaction(transactionId: string): boolean {
    try {
      const storageKey = `${MandatosTransactionService.TRANSACTION_PREFIX}${transactionId}`;
      sessionStorage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Error al limpiar transacción:', error);
      return false;
    }
  }

  /**
   * Obtiene todas las transacciones activas
   */
  getActiveTransactions(): MandatosTransactionData[] {
    try {
      const transactions: MandatosTransactionData[] = [];
      const keys = Object.keys(sessionStorage);

      keys.forEach(key => {
        if (key.startsWith(MandatosTransactionService.TRANSACTION_PREFIX)) {
          const stored = sessionStorage.getItem(key);
          if (stored) {
            try {
              const transactionData: MandatosTransactionData = JSON.parse(stored);
              transactions.push(transactionData);
            } catch (error) {
              console.error('Error al parsear transacción:', error);
            }
          }
        }
      });

      return transactions;
    } catch (error) {
      console.error('Error al obtener transacciones activas:', error);
      return [];
    }
  }

  /**
   * Limpia transacciones antiguas (más de 1 hora)
   */
  cleanupOldTransactions(): number {
    try {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      let cleanedCount = 0;
      const keys = Object.keys(sessionStorage);

      keys.forEach(key => {
        if (key.startsWith(MandatosTransactionService.TRANSACTION_PREFIX)) {
          const stored = sessionStorage.getItem(key);
          if (stored) {
            try {
              const transactionData: MandatosTransactionData = JSON.parse(stored);
              if (transactionData.timestamp < oneHourAgo) {
                sessionStorage.removeItem(key);
                cleanedCount++;
              }
            } catch (error) {
              console.error('Error al procesar transacción para limpieza:', error);
            }
          }
        }
      });

      console.log(`🧹 Limpiadas ${cleanedCount} transacciones antiguas`);
      return cleanedCount;
    } catch (error) {
      console.error('Error al limpiar transacciones antiguas:', error);
      return 0;
    }
  }
}

// Exportar instancia única
export const mandatosTransactionService = new MandatosTransactionService();
