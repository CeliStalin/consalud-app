import { useCallback, useEffect, useState } from 'react';
import { mandatosTransactionService } from '../services/mandatosTransactionService';
import { useAdvancedExternalApp } from './useAdvancedExternalApp';
import { useGlobalButtonLocking } from './useGlobalButtonLocking';

export interface UseMandatosTransactionReturn {
  // Estados básicos
  loading: boolean;
  error: string | null;
  transactionId: string | null;

  // Funcionalidad de aplicación externa
  isExternalTabOpen: boolean;
  isOpeningTab: boolean;
  openExternalTab: (rut: string) => Promise<void>;
  closeExternalTab: () => void;
  externalTabUrl: string | null;
  externalAppStatus?: string;
  externalAppTabId?: string;
  openedAt?: Date | null;
  closedAt?: Date | null;

  // Funcionalidad de bloqueo de botones
  isButtonsLocked: boolean;
  lockReason: string | null;
  lockButtons: (reason: string) => void;
  unlockButtons: () => void;

  // Propiedades de transacción
  transactionToken: string | null;
  hasActiveTransaction: boolean;
}

/**
 * Hook simplificado para manejar transacciones de mandatos
 * SOLO bloquea botones basándose en el estado de la aplicación externa
 */
export const useMandatosTransaction = (): UseMandatosTransactionReturn => {
  // Estados básicos
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Hook de bloqueo de botones
  const {
    isButtonsLocked,
    lockReason,
    lockButtons,
    unlockButtons,
    transactionToken,
    hasActiveTransaction
  } = useGlobalButtonLocking();

  // Hook de aplicación externa
  const {
    status: externalAppStatus,
    isOpen: isExternalAppOpen,
    tabId: externalAppTabId,
    url: externalAppUrl,
    openedAt,
    closedAt,
    openExternalApp,
    closeExternalApp
  } = useAdvancedExternalApp();

  /**
   * SOLUCIÓN SIMPLE: Solo bloquear botones específicos (Actualizar/Guardar) sin modal
   */
  useEffect(() => {
    console.log('🔍 [useMandatosTransaction] Estado de aplicación externa:', {
      status: externalAppStatus,
      isOpen: isExternalAppOpen,
      tabId: externalAppTabId
    });

    // Solo bloquear botones específicos, NO mostrar modal de bloqueo
    if (externalAppStatus === 'open' && externalAppTabId) {
      console.log('🔒 [useMandatosTransaction] Aplicación externa abierta - bloqueando botones específicos');
      // Bloquear solo los botones, sin modal
      lockButtons(`Pestaña externa abierta - TabId: ${externalAppTabId}`);
    } else if (externalAppStatus === 'closed') {
      console.log('🔓 [useMandatosTransaction] Aplicación externa cerrada - desbloqueando botones');
      unlockButtons();
    }
  }, [externalAppStatus, externalAppTabId, lockButtons, unlockButtons]);

  /**
   * Abre una pestaña externa para actualización de mandatos
   * SIMPLIFICADO: Solo abre la aplicación externa, el bloqueo se maneja automáticamente
   */
  const openExternalTab = useCallback(async (rut: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Abriendo pestaña externa para mandatos, RUT:', rut);

      // Iniciar transacción
      const transaction = await mandatosTransactionService.iniciarTransaccionMandatos(rut);
      setTransactionId(transaction.transactionId);

      console.log('📋 Datos de transacción recibidos:', transaction);
      console.log('🔗 URL encriptada a abrir:', transaction.encryptedUrl);

      // Validar que la URL encriptada sea válida
      if (!transaction.encryptedUrl || !transaction.encryptedUrl.startsWith('http')) {
        throw new Error(`URL encriptada inválida: ${transaction.encryptedUrl}`);
      }

      // Abrir aplicación externa - el bloqueo se maneja automáticamente por el useEffect
      await openExternalApp(transaction.encryptedUrl);

      console.log('✅ Pestaña externa abierta exitosamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al abrir pestaña externa';
      console.error('❌ Error al abrir pestaña externa:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [openExternalApp]);

  /**
   * Cierra la pestaña externa
   * SIMPLIFICADO: Solo cierra la aplicación externa, el desbloqueo se maneja automáticamente
   */
  const closeExternalTab = useCallback(() => {
    console.log('🔄 [useMandatosTransaction] Cerrando pestaña externa');
    closeExternalApp();
    console.log('✅ [useMandatosTransaction] Pestaña externa cerrada');
  }, [closeExternalApp]);

  return {
    // Estados básicos
    loading,
    error,
    transactionId,

    // Funcionalidad de aplicación externa
    isExternalTabOpen: isExternalAppOpen,
    isOpeningTab: externalAppStatus === 'opening',
    openExternalTab,
    closeExternalTab,
    externalTabUrl: externalAppUrl || null,
    externalAppStatus,
    externalAppTabId,
    openedAt,
    closedAt,

    // Funcionalidad de bloqueo de botones
    isButtonsLocked,
    lockReason,
    lockButtons,
    unlockButtons,

    // Propiedades de transacción
    transactionToken,
    hasActiveTransaction
  };
};
