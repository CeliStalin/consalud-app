import { useCallback, useEffect, useRef, useState } from 'react';
import { MandatosTransactionData, mandatosTransactionService } from '../services/mandatosTransactionService';
import { useButtonLocking } from './useButtonLocking';
import { useExternalTab } from './useExternalTab';

export interface UseMandatosTransactionReturn {
  // Estados
  isIframeModalOpen: boolean;
  transactionData: MandatosTransactionData | null;
  loading: boolean;
  error: string | null;

  // Acciones
  openIframeModal: (rut: string) => Promise<void>;
  closeIframeModal: () => void;
  refreshMandatosData: () => void;

  // Datos del iframe
  iframeUrl: string | null;
  transactionId: string | null;

  // Funcionalidad de pestaña externa
  isExternalTabOpen: boolean;
  openExternalTab: (rut: string) => Promise<void>;
  closeExternalTab: () => void;
  externalTabUrl: string | null;

  // Funcionalidad de bloqueo de botones
  isButtonsLocked: boolean;
  lockReason: string | null;
}

/**
 * Hook para manejar transacciones de mandatos con iframe y pestaña externa
 * Implementa el sistema de puntero de información con token de transacción
 */
export const useMandatosTransaction = (): UseMandatosTransactionReturn => {
  const [isIframeModalOpen, setIsIframeModalOpen] = useState(false);
  const [transactionData, setTransactionData] = useState<MandatosTransactionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // Hook para manejar pestañas externas
  const {
    isExternalTabOpen,
    loading: externalTabLoading,
    error: externalTabError,
    tabUrl: externalTabUrl,
    openExternalTab: openExternalTabBase,
    closeExternalTab: closeExternalTabBase
  } = useExternalTab();

  // Hook para manejar bloqueo de botones
  const {
    isLocked: isButtonsLocked,
    lockReason,
    lockButtons,
    unlockButtons
  } = useButtonLocking();

  // Ref para el iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Ref para el intervalo de verificación
  const intervalRef = useRef<number | undefined>(undefined);

  /**
   * Abre el modal con iframe para actualizar mandatos
   */
  const openIframeModal = useCallback(async (rut: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Abriendo modal de iframe para mandatos, RUT:', rut);

      // Iniciar transacción
      const transaction = await mandatosTransactionService.iniciarTransaccionMandatos(rut);

      console.log('📋 Datos de transacción recibidos:', transaction);
      console.log('🔗 URL encriptada a establecer:', transaction.encryptedUrl);

      setTransactionData(transaction);
      setTransactionId(transaction.transactionId);

      // Establecer la URL del iframe con validación
      if (transaction.encryptedUrl && transaction.encryptedUrl.startsWith('http')) {
        setIframeUrl(transaction.encryptedUrl);
        console.log('✅ URL del iframe establecida correctamente:', transaction.encryptedUrl);
        setIsIframeModalOpen(true);
      } else {
        throw new Error(`URL encriptada inválida: ${transaction.encryptedUrl}`);
      }

      // Iniciar verificación periódica del estado
      startStatusCheck(transaction.transactionId);

      console.log('✅ Modal de iframe abierto exitosamente');
    } catch (err: any) {
      console.error('❌ Error al abrir modal de iframe:', err);
      setError(err.message || 'Error al abrir el modal de mandatos');
    } finally {
      setLoading(false);
    }
  }, []);

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
      await openExternalTabBase(transaction.encryptedUrl);

      // Bloquear botones mientras la pestaña externa esté abierta
      lockButtons('Formulario de mandatos abierto en pestaña externa');

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

  /**
   * Cierra el modal de iframe
   */
  const closeIframeModal = useCallback(() => {
    console.log('🔒 Cerrando modal de iframe');

    // Detener verificación periódica
    stopStatusCheck();

    // Actualizar estado de transacción si existe
    if (transactionId) {
      mandatosTransactionService.updateTransactionStatus(transactionId, 'cancelled');
    }

    // Limpiar estados
    setIsIframeModalOpen(false);
    setTransactionData(null);
    setTransactionId(null);
    setIframeUrl(null);
    setError(null);
  }, [transactionId, stopStatusCheck]);

  /**
   * Inicia la verificación periódica del estado de la transacción
   */
  const startStatusCheck = useCallback((txId: string) => {
    console.log('⏰ Iniciando verificación periódica para transacción:', txId);

    intervalRef.current = window.setInterval(() => {
      const currentTransaction = mandatosTransactionService.getTransactionData(txId);

      if (currentTransaction) {
        console.log('📊 Estado actual de transacción:', currentTransaction.status);

        // Si la transacción se completó o hubo error, cerrar el modal
        if (currentTransaction.status === 'completed' || currentTransaction.status === 'error') {
          console.log('✅ Transacción finalizada, cerrando modal');
          closeIframeModal();
          refreshMandatosData();
        }
      } else {
        console.log('⚠️ Transacción no encontrada, cerrando verificación');
        stopStatusCheck();
      }
    }, 2000); // Verificar cada 2 segundos
  }, [closeIframeModal, refreshMandatosData, stopStatusCheck]);

  /**
   * Maneja el evento de carga del iframe
   */
  const handleIframeLoad = useCallback(() => {
    console.log('📄 Iframe cargado');

    // Aquí se puede implementar lógica adicional cuando el iframe se carga
    // Por ejemplo, verificar si la página cargó correctamente
  }, []);

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
   */
  useEffect(() => {
    if (!isExternalTabOpen && isButtonsLocked) {
      console.log('🔄 Pestaña externa cerrada, desbloqueando botones');
      unlockButtons();
    }
  }, [isExternalTabOpen, isButtonsLocked, unlockButtons]);

  return {
    // Estados
    isIframeModalOpen,
    transactionData,
    loading: loading || externalTabLoading,
    error: error || externalTabError,

    // Acciones
    openIframeModal,
    closeIframeModal,
    refreshMandatosData,

    // Datos del iframe
    iframeUrl,
    transactionId,

    // Funcionalidad de pestaña externa
    isExternalTabOpen,
    openExternalTab,
    closeExternalTab,
    externalTabUrl,

    // Funcionalidad de bloqueo de botones
    isButtonsLocked,
    lockReason,

    // Referencias internas (para uso interno del componente)
    iframeRef,
    handleIframeLoad
  } as UseMandatosTransactionReturn & {
    iframeRef: React.RefObject<HTMLIFrameElement>;
    handleIframeLoad: () => void;
  };
};
