import { useCallback, useEffect, useRef, useState } from 'react';
import { MandatosTransactionData, mandatosTransactionService } from '../services/mandatosTransactionService';
import { useGlobalButtonLocking } from './useGlobalButtonLocking';

export interface UseMandatosTransactionReturn {
  // Estados
  transactionData: MandatosTransactionData | null;
  loading: boolean;
  error: string | null;

  // Acciones
  refreshMandatosData: () => void;

  // Datos de transacción
  transactionId: string | null;

  // Funcionalidad de pestaña externa
  isExternalTabOpen: boolean;
  isOpeningTab: boolean; // Nuevo estado para prevenir apertura múltiple
  // Eliminado: useIframeModal ya no se usa
  openExternalTab: (rut: string) => Promise<void>;
  closeExternalTab: () => void;
  externalTabUrl: string | null;

  // Funcionalidad de bloqueo de botones
  isButtonsLocked: boolean;
  lockReason: string | null;
  lockButtons: (reason: string) => void;
  unlockButtons: () => void;
  transactionToken: string | null;
  hasActiveTransaction: boolean;
}

/**
 * Hook para manejar transacciones de mandatos con pestaña externa
 * Implementa el sistema de bloqueo de botones con token de transacción
 */
export const useMandatosTransaction = (): UseMandatosTransactionReturn => {
  const [transactionData] = useState<MandatosTransactionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId] = useState<string | null>(null);

  // Hook mejorado que combina pestañas externas con bloqueo global
  const {
    isExternalTabOpen,
    isOpeningTab,
    // Eliminado: useIframeModal ya no se usa
    loading: externalTabLoading,
    error: externalTabError,
    tabUrl: externalTabUrl,
    openExternalTab: openExternalTabBase,
    closeExternalTab: closeExternalTabBase,
    isButtonsLocked,
    lockReason,
    lockButtons,
    unlockButtons,
    transactionToken,
    hasActiveTransaction
  } = useGlobalButtonLocking();

  // Debug: Log del estado recibido del hook global
  console.log('🔍 [useMandatosTransaction] Estado del hook global:', {
    isButtonsLocked,
    lockReason,
    isExternalTabOpen
  });

  // Referencias de iframe eliminadas - no se usan

  // Ref para el intervalo de verificación
  const intervalRef = useRef<number | undefined>(undefined);

  // Funciones de iframe eliminadas - sistema usa pestañas externas directamente

  /**
   * Detiene la verificación periódica
   */
  const stopStatusCheck = useCallback(() => {
    if (intervalRef.current) {
      console.log('⏹️ Deteniendo verificación periódica');
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  /**
   * Refresca los datos de mandatos después de cerrar el iframe
   */
  const refreshMandatosData = useCallback(() => {
    console.log('🔄 Refrescando datos de mandatos');

    // Aquí se puede implementar la lógica para refrescar los datos
    // Por ejemplo, volver a llamar al servicio de mandatos
    // o emitir un evento para que otros componentes se actualicen

    // Por ahora, solo logueamos la acción
    console.log('📊 Datos de mandatos refrescados');
  }, []);

  /**
   * Abre una pestaña externa para actualizar mandatos
   */
  const openExternalTab = useCallback(async (rut: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Abriendo pestaña externa para mandatos, RUT:', rut);

      // Iniciar transacción
      const transaction = await mandatosTransactionService.iniciarTransaccionMandatos(rut);

      console.log('📋 Datos de transacción recibidos:', transaction);
      console.log('🔗 URL encriptada a abrir:', transaction.encryptedUrl);

      // Validar que la URL encriptada sea válida
      if (!transaction.encryptedUrl || !transaction.encryptedUrl.startsWith('http')) {
        throw new Error(`URL encriptada inválida: ${transaction.encryptedUrl}`);
      }

      // Abrir pestaña externa con la URL encriptada
      console.log('🔄 [useMandatosTransaction] Llamando a openExternalTabBase...');
      await openExternalTabBase(transaction.encryptedUrl);
      console.log('🔄 [useMandatosTransaction] openExternalTabBase completado sin error');

      // NO bloquear botones aquí - el bloqueo se maneja en openExternalTabBase
      // solo si la pestaña se abre exitosamente

      // Solo mostrar este mensaje si no hubo error
      console.log('✅ Pestaña externa abierta exitosamente');
    } catch (err: any) {
      console.error('❌ Error al abrir pestaña externa:', err);
      setError(err.message || 'Error al abrir la pestaña externa');
    } finally {
      setLoading(false);
    }
  }, [openExternalTabBase, lockButtons]);

  /**
   * Cierra la pestaña externa
   */
  const closeExternalTab = useCallback(() => {
    console.log('🔒 Cerrando pestaña externa');
    closeExternalTabBase();
    unlockButtons(); // Desbloquear botones al cerrar la pestaña
    refreshMandatosData();
  }, [closeExternalTabBase, unlockButtons, refreshMandatosData]);

  // Función closeIframeModal eliminada - no se usa

  // Función startStatusCheck eliminada - no se usa

  // Función handleIframeLoad eliminada - no se usa

  /**
   * Limpia recursos al desmontar el componente
   */
  useEffect(() => {
    return () => {
      stopStatusCheck();
    };
  }, [stopStatusCheck]);

  /**
   * Limpia transacciones antiguas al inicializar
   */
  useEffect(() => {
    mandatosTransactionService.cleanupOldTransactions();
  }, []);

  /**
   * Efecto para detectar cuando se cierra la pestaña externa y desbloquear botones
   * SOLO si el bloqueo fue causado por una pestaña externa
   */
  useEffect(() => {
    console.log('🔍 [useMandatosTransaction] Efecto de cierre de pestaña:', {
      isExternalTabOpen,
      isButtonsLocked,
      lockReason
    });

    // Solo desbloquear si la pestaña externa se cerró Y el bloqueo fue causado por una pestaña externa
    if (!isExternalTabOpen && isButtonsLocked && lockReason?.includes('Pestaña externa abierta')) {
      console.log('🔄 [useMandatosTransaction] Pestaña externa cerrada, desbloqueando botones');
      console.trace('🔍 [useMandatosTransaction] Stack trace del desbloqueo automático');
      unlockButtons();
    }
  }, [isExternalTabOpen, isButtonsLocked, unlockButtons, lockReason]);

  return {
    // Estados
    transactionData,
    loading: loading || externalTabLoading,
    error: error || externalTabError,

    // Acciones
    refreshMandatosData,

    // Datos de transacción
    transactionId,

    // Funcionalidad de pestaña externa
    isExternalTabOpen,
    isOpeningTab,
    // Eliminado: useIframeModal ya no se usa
    openExternalTab,
    closeExternalTab,
    externalTabUrl,

    // Funcionalidad de bloqueo de botones
    isButtonsLocked,
    lockReason,
    lockButtons,
    unlockButtons,
    transactionToken,
    hasActiveTransaction,

  };
};
