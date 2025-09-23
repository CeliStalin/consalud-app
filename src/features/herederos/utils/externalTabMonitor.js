/**
 * Script para monitorear el cierre de pestañas externas
 * Este script se inyecta en la pestaña externa para detectar cuando se cierra
 */

(function() {
  'use strict';

  console.log('🔍 [ExternalTabMonitor] Script de monitoreo cargado');

  // Escuchar mensajes de la pestaña principal
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'EXTERNAL_TAB_MONITOR' && event.data.source === 'consalud-app') {
      console.log('🔍 [ExternalTabMonitor] Monitoreo activado por pestaña principal');

      // Detectar cuando la pestaña se va a cerrar
      window.addEventListener('beforeunload', function() {
        console.log('🔍 [ExternalTabMonitor] Pestaña externa se está cerrando, notificando a pestaña principal');

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
    console.log('🔍 [ExternalTabMonitor] Pestaña externa perdió foco');
  });

  // Detectar cuando la pestaña se oculta
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      console.log('🔍 [ExternalTabMonitor] Pestaña externa ocultada');
    } else {
      console.log('🔍 [ExternalTabMonitor] Pestaña externa visible');
    }
  });

})();
