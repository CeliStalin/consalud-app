import { useCallback, useEffect } from 'react';

/**
 * Hook para asegurar la correcta integración con el core
 * y debugging de efectos como bounce
 */
export const useCoreIntegration = () => {
    const checkBounceSupport = useCallback(() => {
    // Verificar que las clases CSS del core estén disponibles
    const hasCoreBounceSupport = document.querySelector('.app-card.bounce-enabled') !== null;

    return hasCoreBounceSupport;
  }, []);
    const enableBounceDebug = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      // Agregar listeners para debug del bounce effect
      const cards = document.querySelectorAll('.app-card');
      cards.forEach(card => {
        const handleClick = () => {
          // Debug bounce effect silently
        };

        card.addEventListener('click', handleClick);

        // Cleanup function
        return () => {
          card.removeEventListener('click', handleClick);
        };
      });
    }
  }, []);

  useEffect(() => {
    // Verificar soporte después de que el DOM esté listo
    const timer = setTimeout(() => {
      checkBounceSupport();
      enableBounceDebug();
    }, 1000);

    return () => clearTimeout(timer);
  }, [checkBounceSupport, enableBounceDebug]);

  return {
    checkBounceSupport,
    enableBounceDebug
  };
};
