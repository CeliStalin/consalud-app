/**
 * Script para monitorear el cierre de pestañas externas
 * Este script se inyecta en la pestaña externa para detectar cuando se cierra
 */

(function() {
  'use strict';

  // Escuchar mensajes de la pestaña principal
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'EXTERNAL_TAB_MONITOR' && event.data.source === 'consalud-app') {

      // Detectar cuando la pestaña se va a cerrar
      window.addEventListener('beforeunload', function() {

        // Notificar a la pestaña principal
        try {
          if (event.source && !event.source.closed) {
            event.source.postMessage({
              type: 'EXTERNAL_TAB_CLOSING',
              source: 'external-tab-monitor',
              timestamp: Date.now()
            }, '*');
          }
        } catch (error) {
          console.warn('⚠️ [ExternalTabMonitor] Error al notificar cierre:', error);
        }
      });
    }
  });

  // También detectar cuando la pestaña pierde el foco (posible cierre)
  window.addEventListener('blur', function() {
  });

  // Detectar cuando la pestaña se oculta
  document.addEventListener('visibilitychange', function() {
  });

})();
