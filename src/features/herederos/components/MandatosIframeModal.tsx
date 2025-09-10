import React, { useEffect, useRef, useState } from 'react';
import './styles/MandatosIframeModal.css';

interface MandatosIframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  iframeUrl: string | null;
  transactionId: string | null;
  loading: boolean;
  error: string | null;
  onIframeLoad?: () => void;
}

const MandatosIframeModal: React.FC<MandatosIframeModalProps> = ({
  isOpen,
  onClose,
  iframeUrl,
  transactionId,
  loading,
  error,
  onIframeLoad
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [hasResourceErrors, setHasResourceErrors] = useState(false);
  const [proxyActivated, setProxyActivated] = useState(false);
  const [proxyCountdown, setProxyCountdown] = useState(0);
  const [useInternalWindow, setUseInternalWindow] = useState(false);
  const [useTabSimulation, setUseTabSimulation] = useState(false);
  const [useRealWindow, setUseRealWindow] = useState(false);
  const [popupWindow, setPopupWindow] = useState<Window | null>(null);
  const [useDirectWindow, setUseDirectWindow] = useState(false);
  const [directContent, setDirectContent] = useState<string>('');
  const [directLoading, setDirectLoading] = useState(false);

  // Iniciar proxy automáticamente cuando se abre el modal
  useEffect(() => {
    if (isOpen && iframeUrl) {
      console.log('🚀 Modal abierto, verificando proxy...');
      startProxy().then(async proxyRunning => {
        if (proxyRunning) {
          console.log('✅ Proxy disponible, activando automáticamente...');
          // Activar proxy automáticamente para URLs de mandatos
          if (iframeUrl.includes('mandatos.consalud.des')) {
            setHasResourceErrors(true);
            setProxyCountdown(1);
            setTimeout(async () => {
              if (!proxyActivated) {
                console.log('🔄 Activando proxy automáticamente...');
                await handleUseProxy();
              }
            }, 1000);
          }
        } else {
          console.log('⚠️ Proxy no disponible, el modal funcionará sin proxy');
        }
      });
    }
  }, [isOpen, iframeUrl]);

  // Detener proxy cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      console.log('🛑 Modal cerrado, deteniendo proxy...');
      stopProxy();
    }
  }, [isOpen]);

  // Resetear estados cuando cambie la URL
  useEffect(() => {
    console.log('🔄 useEffect iframeUrl triggered, iframeUrl:', iframeUrl);
    console.log('🔄 Tipo de iframeUrl:', typeof iframeUrl);
    console.log('🔄 iframeUrl es null/undefined:', iframeUrl === null || iframeUrl === undefined);

    if (iframeUrl) {
      setIframeError(null);
      setIframeLoading(true);
      setHasResourceErrors(false);
      setProxyActivated(false);
      setProxyCountdown(0);
      console.log('🔄 Nueva URL de iframe:', iframeUrl);
      console.log('🔍 Longitud de URL:', iframeUrl.length);
      console.log('🔍 URL válida:', iframeUrl.startsWith('http'));
      console.log('🔍 URL completa:', JSON.stringify(iframeUrl));

      // Verificar que la URL sea válida
      if (!iframeUrl.startsWith('http')) {
        console.error('❌ URL inválida - no comienza con http:', iframeUrl);
        setIframeError('URL inválida generada por el sistema');
        setIframeLoading(false);
      } else {
        // Activar proxy automáticamente para URLs de mandatos.consalud.des
        if (iframeUrl.includes('mandatos.consalud.des')) {
          console.log('🔄 URL de mandatos detectada, activando proxy automáticamente...');
          setHasResourceErrors(true);
          setProxyCountdown(2);

          const countdownInterval = setInterval(() => {
            setProxyCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                if (!proxyActivated) {
                  console.log('🔄 Activando proxy automáticamente para URL de mandatos...');
                  handleUseProxy();
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    } else {
      console.log('⚠️ iframeUrl es null o undefined, no se puede cargar');
    }
  }, [iframeUrl]);

  // Detectar errores de recursos en la consola
  useEffect(() => {
    if (!isOpen) return;

    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('404') || message.includes('ERR_ABORTED') || message.includes('Failed to load resource') ||
          message.includes('CORS') || message.includes('X-Frame-Options') || message.includes('Content-Security-Policy')) {
        console.log('🚨 Error de recurso/CORS detectado en iframe:', message);
        setHasResourceErrors(true);
      }
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      if (message.includes('404') || message.includes('ERR_ABORTED') || message.includes('Failed to load resource') ||
          message.includes('CORS') || message.includes('X-Frame-Options') || message.includes('Content-Security-Policy')) {
        console.log('⚠️ Advertencia de recurso/CORS detectada en iframe:', message);
        setHasResourceErrors(true);
      }
      originalConsoleWarn.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, [isOpen]);

  // Verificar headers de respuesta para detectar problemas CORS
  const checkCorsHeaders = async () => {
    if (!iframeUrl || proxyActivated) return; // No verificar si ya está usando proxy

    try {
      console.log('🔍 Verificando headers CORS para:', iframeUrl);
      const response = await fetch(iframeUrl, {
        method: 'HEAD',
        mode: 'no-cors' // Esto evita errores CORS pero no nos da los headers
      });
      console.log('📋 Respuesta HEAD:', response);

      // Si la respuesta es 'opaque' con status 0, es un problema CORS
      if (response.type === 'opaque' && response.status === 0) {
        console.log('🚨 Problema CORS confirmado - activando proxy automáticamente');
        setHasResourceErrors(true);

        // Activar proxy automáticamente después de un breve delay
        setProxyCountdown(3);
        const countdownInterval = setInterval(() => {
          setProxyCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              if (!proxyActivated) {
                console.log('🔄 Activando proxy automáticamente...');
                handleUseProxy();
              }
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.log('❌ Error al verificar headers CORS:', error);
      // Esto es esperado debido a CORS, pero nos ayuda a confirmar el problema
    }
  };

  // Verificar si hay problemas de carga de datos en el iframe
  const checkIframeDataLoading = () => {
    if (!isOpen || !iframeRef.current) return;

    try {
      const iframe = iframeRef.current;
      if (iframe.contentDocument) {
        const body = iframe.contentDocument.body;
        if (body) {
          // Buscar elementos que indican que los datos no se cargaron
          const bancosSelect = body.querySelector('select[name*="banco"], select[id*="banco"]') as HTMLSelectElement;
          const beneficiarioSelect = body.querySelector('select[name*="beneficiario"], select[id*="beneficiario"]') as HTMLSelectElement;
          const errorMessages = body.querySelectorAll('*[class*="error"], *[id*="error"]');

          let hasDataIssues = false;

          if (bancosSelect && bancosSelect.options && bancosSelect.options.length <= 1) {
            console.log('⚠️ No se encontraron bancos en el iframe');
            hasDataIssues = true;
          }

          if (beneficiarioSelect && beneficiarioSelect.options && beneficiarioSelect.options.length <= 1) {
            console.log('⚠️ No se encontraron beneficiarios en el iframe');
            hasDataIssues = true;
          }

          if (errorMessages.length > 0) {
            console.log('⚠️ Se encontraron mensajes de error en el iframe:', errorMessages.length);
            hasDataIssues = true;
          }

          if (hasDataIssues && !proxyActivated) {
            console.log('🔄 Problemas de datos detectados, activando proxy...');
            setHasResourceErrors(true);
            handleUseProxy();
          }
        }
      }
    } catch (error) {
      console.log('🔒 No se puede acceder al contenido del iframe (CORS):', error);
      // Esto es normal debido a políticas de CORS
    }
  };

  // Verificar si el proxy está disponible
  const checkProxyAvailability = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/test');
      if (response.ok) {
        console.log('✅ Proxy disponible en localhost:3001');
        return true;
      }
    } catch (error) {
      console.log('❌ Proxy no disponible:', error);
    }
    return false;
  };

  // Iniciar el servidor proxy
  const startProxy = async () => {
    try {
      console.log('🚀 Verificando servidor proxy...');

      // Verificar si ya está ejecutándose
      const isRunning = await checkProxyAvailability();
      if (isRunning) {
        console.log('✅ Proxy ya está ejecutándose');
        return true;
      }

      console.log('⚠️ Proxy no está ejecutándose');
      console.log('ℹ️ Para iniciar el proxy manualmente, ejecute: node src/server/proxy.js');
      return false;
    } catch (error) {
      console.log('⚠️ Error verificando proxy:', error);
      console.log('ℹ️ El proxy debe iniciarse manualmente: node src/server/proxy.js');
      return false;
    }
  };

  // Detener el servidor proxy
  const stopProxy = async () => {
    try {
      console.log('🛑 Verificando si se debe detener el proxy...');

      // Solo loguear que el modal se cerró
      // El proxy puede seguir ejecutándose para otros usos
      console.log('ℹ️ Modal cerrado. El proxy puede seguir ejecutándose para otros usos.');
      console.log('ℹ️ Para detener el proxy manualmente, use Ctrl+C en la terminal donde está ejecutándose.');
    } catch (error) {
      console.log('⚠️ Error en verificación de proxy:', error);
    }
  };

  // Manejar el evento de carga del iframe
  const handleIframeLoad = () => {
    console.log('📄 Iframe de mandatos cargado exitosamente');
    console.log('📄 URL actual del iframe:', iframeRef.current?.src);
    console.log('📄 URL esperada:', iframeUrl);

    // Verificar que la URL cargada sea la correcta (permitir proxy)
    const currentSrc = iframeRef.current?.src;
    const isProxyUrl = currentSrc?.includes('localhost:3001/api/mandatos-iframe');
    const isOriginalUrl = currentSrc === iframeUrl;

    if (!isProxyUrl && !isOriginalUrl) {
      console.error('❌ URL del iframe no coincide con la esperada');
      console.error('❌ URL cargada:', currentSrc);
      console.error('❌ URL esperada:', iframeUrl);
      setIframeError('Error: La URL cargada no coincide con la esperada');
      setIframeLoading(false);
      return;
    }

    if (isProxyUrl) {
      console.log('✅ Iframe cargado a través del proxy CORS');
    }

    // Configurar comunicación postMessage
    setupPostMessageCommunication();

    // Verificar si el iframe tiene contenido después de un breve delay
    setTimeout(() => {
      try {
        const iframe = iframeRef.current;
        if (iframe && iframe.contentDocument) {
          const body = iframe.contentDocument.body;
          if (body) {
            const hasContent = body.innerHTML.trim().length > 0;
            const hasTables = body.querySelectorAll('table').length > 0;
            const hasData = body.textContent && body.textContent.trim().length > 100;

            console.log('🔍 Verificación de contenido del iframe:');
            console.log('🔍 Tiene contenido HTML:', hasContent);
            console.log('🔍 Tiene tablas:', hasTables);
            console.log('🔍 Tiene texto significativo:', hasData);
            console.log('🔍 Longitud del contenido:', body.innerHTML.length);

            if (!hasContent || !hasData) {
              console.warn('⚠️ El iframe parece estar vacío o sin datos');
              // No establecer error automáticamente, solo loguear
            }
          }
        }
      } catch (error) {
        console.log('🔒 No se puede acceder al contenido del iframe (CORS):', error);
        // Esto es normal debido a políticas de CORS
      }
    }, 2000);

    setIframeLoading(false);
    setIframeError(null);

    // Verificar headers CORS después de cargar
    setTimeout(() => {
      checkCorsHeaders();
    }, 1000);

    // Verificar datos después de un delay más largo
    setTimeout(() => {
      checkIframeDataLoading();
    }, 3000);

    if (onIframeLoad) {
      onIframeLoad();
    }
  };

  // Configurar comunicación postMessage con el iframe
  const setupPostMessageCommunication = () => {
    const handleMessage = (event: MessageEvent) => {
      // Verificar origen del mensaje (solo aceptar del iframe)
      if (event.origin !== 'http://mandatos.consalud.des' &&
          event.origin !== 'http://localhost:3001') {
        return;
      }

      console.log('📨 Mensaje recibido del iframe:', event.data);

      if (event.data.type === 'AJAX_REQUEST') {
        // Manejar solicitud AJAX desde el iframe
        handleAjaxRequestFromIframe(event.data);
      } else if (event.data.type === 'DATA_LOADED') {
        // Notificar que los datos se cargaron
        console.log('✅ Datos cargados en el iframe:', event.data.data);
      } else if (event.data.type === 'ERROR') {
        // Manejar errores del iframe
        console.error('❌ Error en el iframe:', event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);

    // Enviar mensaje al iframe para configurar comunicación
    setTimeout(() => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'PARENT_READY',
          proxyUrl: 'http://localhost:3001/api/mandatos-ajax'
        }, '*');
        console.log('📤 Mensaje enviado al iframe: PARENT_READY');
      }
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  };

  // Manejar solicitudes AJAX desde el iframe
  const handleAjaxRequestFromIframe = async (data: any) => {
    try {
      console.log('🔄 Procesando solicitud AJAX desde iframe:', data);

      const { method, url, body } = data;
      const methodName = url.match(/MethodName=([^&]+)/)?.[1];

      if (!methodName) {
        console.error('❌ No se pudo extraer MethodName de la URL');
        return;
      }

      const proxyUrl = `http://localhost:3001/api/mandatos-ajax/${methodName}`;
      console.log('🔄 Redirigiendo a proxy:', proxyUrl);

      const response = await fetch(proxyUrl, {
        method: method || 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body
      });

      const result = await response.text();
      console.log('✅ Respuesta del proxy:', result);

      // Enviar respuesta de vuelta al iframe
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'AJAX_RESPONSE',
          originalUrl: url,
          data: result,
          status: response.status
        }, '*');
      }

    } catch (error) {
      console.error('❌ Error procesando solicitud AJAX:', error);

      // Enviar error de vuelta al iframe
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'AJAX_ERROR',
          originalUrl: data.url,
          error: error instanceof Error ? error.message : String(error)
        }, '*');
      }
    }
  };

  // Manejar errores del iframe
  const handleIframeError = () => {
    console.error('❌ Error al cargar iframe de mandatos');
    setIframeLoading(false);
    setIframeError('Error al cargar el formulario de mandatos. Verifique la URL o intente nuevamente.');
  };

  // Abrir URL en nueva pestaña para debugging
  const handleOpenInNewTab = () => {
    if (iframeUrl) {
      console.log('🔗 Abriendo URL en nueva pestaña:', iframeUrl);
      window.open(iframeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Recargar el iframe
  const handleReloadIframe = () => {
    if (iframeRef.current && iframeUrl) {
      console.log('🔄 Recargando iframe...');
      setIframeLoading(true);
      setIframeError(null);

      // Forzar recarga del iframe
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = iframeUrl;
        }
      }, 100);
    }
  };

  // Intentar cargar con diferentes configuraciones de CORS
  const handleReloadWithCorsFix = () => {
    if (iframeRef.current && iframeUrl) {
      console.log('🔧 Intentando recargar con configuración CORS mejorada...');
      setIframeLoading(true);
      setIframeError(null);
      setHasResourceErrors(false);

      // Limpiar iframe completamente
      if (iframeRef.current) {
        iframeRef.current.src = '';
        iframeRef.current.removeAttribute('sandbox');
        iframeRef.current.removeAttribute('allow');
        iframeRef.current.removeAttribute('referrerPolicy');
      }

      setTimeout(() => {
        if (iframeRef.current) {
          // Reconfigurar con permisos más amplios
          iframeRef.current.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-downloads allow-modals allow-presentation allow-orientation-lock allow-pointer-lock');
          iframeRef.current.setAttribute('allow', 'fullscreen; camera; microphone; geolocation; payment; usb; autoplay; encrypted-media');
          iframeRef.current.setAttribute('referrerPolicy', 'no-referrer');
          iframeRef.current.src = iframeUrl;
        }
      }, 200);
    }
  };

  // Usar proxy para solucionar problemas CORS
  const handleUseProxy = async () => {
    if (iframeRef.current && iframeUrl && !proxyActivated) {
      console.log('🔄 Usando proxy para solucionar CORS...');
      setProxyActivated(true);
      setIframeLoading(true);
      setIframeError(null);
      setHasResourceErrors(false);

      // Verificar si el proxy está disponible
      const proxyAvailable = await checkProxyAvailability();
      if (!proxyAvailable) {
        console.log('❌ Proxy no disponible, mostrando error');
        setIframeError('El servidor proxy no está disponible. Por favor, inicie el servidor proxy ejecutando: node src/server/proxy.js');
        setIframeLoading(false);
        setProxyActivated(false);
        return;
      }

      // Construir URL del proxy
      const proxyUrl = `http://localhost:3001/api/mandatos-iframe?url=${encodeURIComponent(iframeUrl)}`;
      console.log('🔗 URL del proxy:', proxyUrl);

      // Limpiar iframe completamente
      if (iframeRef.current) {
        iframeRef.current.src = '';
        iframeRef.current.removeAttribute('sandbox');
        iframeRef.current.removeAttribute('allow');
        iframeRef.current.removeAttribute('referrerPolicy');
      }

      setTimeout(() => {
        if (iframeRef.current) {
          // Configurar iframe para usar proxy con permisos amplios
          iframeRef.current.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-downloads allow-modals allow-presentation allow-orientation-lock allow-pointer-lock');
          iframeRef.current.setAttribute('allow', 'fullscreen; camera; microphone; geolocation; payment; usb; autoplay; encrypted-media; clipboard-read; clipboard-write');
          iframeRef.current.setAttribute('referrerPolicy', 'no-referrer');
          iframeRef.current.src = proxyUrl;
        }
      }, 200);
    } else if (proxyActivated) {
      console.log('⚠️ Proxy ya activado, evitando activación múltiple');
    }
  };

  // Obtener URL del iframe (con proxy si está disponible)
  const getIframeUrl = (): string | undefined => {
    if (!iframeUrl) return undefined;

    // Para URLs de mandatos.consalud.des, siempre usar proxy si está disponible
    if (iframeUrl.includes('mandatos.consalud.des')) {
      return `http://localhost:3001/api/mandatos-iframe?url=${encodeURIComponent(iframeUrl)}`;
    }

    // Para otras URLs, usar proxy solo si está activado o hay errores
    if (proxyActivated || hasResourceErrors) {
      return `http://localhost:3001/api/mandatos-iframe?url=${encodeURIComponent(iframeUrl)}`;
    }

    return iframeUrl;
  };

  // Verificar y activar proxy automáticamente para opciones especiales
  const ensureProxyForSpecialModes = async () => {
    if ((useTabSimulation || useInternalWindow) && !proxyActivated) {
      console.log('🔄 Verificando proxy para modo especial...');
      const proxyAvailable = await checkProxyAvailability();
      if (proxyAvailable) {
        console.log('✅ Proxy disponible, activando automáticamente...');
        await handleUseProxy();
      } else {
        console.log('❌ Proxy no disponible para modo especial');
      }
    }
  };

  // Efecto para activar proxy automáticamente en modos especiales
  useEffect(() => {
    ensureProxyForSpecialModes();
  }, [useTabSimulation, useInternalWindow]);

  // Abrir ventana real (sin CORS)
  const handleOpenRealWindow = () => {
    if (!iframeUrl) return;

    console.log('🚀 Abriendo ventana real sin CORS...');

    // Cerrar ventana anterior si existe
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }

    // Abrir nueva ventana
    const newWindow = window.open(
      iframeUrl,
      'mandatos-window',
      'width=1200,height=800,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=yes,menubar=yes'
    );

    if (newWindow) {
      setPopupWindow(newWindow);
      setUseRealWindow(true);

      // Configurar comunicación con la ventana
      const handleMessage = (event: MessageEvent) => {
        if (event.source === newWindow) {
          console.log('📨 Mensaje recibido de la ventana:', event.data);

          if (event.data.type === 'WINDOW_CLOSED') {
            console.log('🔒 Ventana cerrada por el usuario');
            setPopupWindow(null);
            setUseRealWindow(false);
            handleClose();
          } else if (event.data.type === 'FORM_COMPLETED') {
            console.log('✅ Formulario completado');
            setPopupWindow(null);
            setUseRealWindow(false);
            handleClose();
          }
        }
      };

      window.addEventListener('message', handleMessage);

      // Verificar si la ventana se cerró
      const checkClosed = setInterval(() => {
        if (newWindow.closed) {
          console.log('🔒 Ventana cerrada detectada');
          setPopupWindow(null);
          setUseRealWindow(false);
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);

      // Limpiar después de 5 minutos
      setTimeout(() => {
        if (!newWindow.closed) {
          clearInterval(checkClosed);
        }
      }, 300000);

    } else {
      console.error('❌ No se pudo abrir la ventana (bloqueador de popups)');
      alert('Por favor, permita ventanas emergentes para esta página y vuelva a intentar.');
    }
  };

  // Cerrar ventana real
  const handleCloseRealWindow = () => {
    if (popupWindow && !popupWindow.closed) {
      popupWindow.close();
    }
    setPopupWindow(null);
    setUseRealWindow(false);
  };

  // Cargar contenido directamente (sin iframe, sin CORS)
  const handleLoadDirectContent = async () => {
    if (!iframeUrl) return;

    console.log('🚀 Cargando contenido directamente sin CORS...');
    setDirectLoading(true);
    setUseDirectWindow(true);
    setDirectContent('');

    try {
      // Usar el proxy para obtener el contenido HTML
      const proxyUrl = `http://localhost:3001/api/mandatos-iframe?url=${encodeURIComponent(iframeUrl)}`;
      console.log('🔄 Cargando desde proxy:', proxyUrl);

      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const htmlContent = await response.text();
      console.log('✅ Contenido HTML obtenido:', htmlContent.length, 'caracteres');

      // Procesar el HTML para corregir rutas relativas
      const processedContent = processHtmlContent(htmlContent, iframeUrl);
      setDirectContent(processedContent);
      setDirectLoading(false);

      console.log('✅ Contenido procesado y listo para mostrar');

    } catch (error) {
      console.error('❌ Error cargando contenido directo:', error);
      setDirectContent(`
        <div style="padding: 20px; text-align: center; color: #d32f2f;">
          <h3>Error al cargar el formulario</h3>
          <p>No se pudo cargar el contenido: ${error instanceof Error ? error.message : 'Error desconocido'}</p>
          <button onclick="window.parent.postMessage({type: 'RELOAD_REQUEST'}, '*')"
                  style="padding: 10px 20px; background: #1976d2; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Reintentar
          </button>
        </div>
      `);
      setDirectLoading(false);
    }
  };

  // Procesar contenido HTML para corregir rutas
  const processHtmlContent = (html: string, originalUrl: string): string => {
    try {
      const urlObj = new URL(originalUrl);
      const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

      console.log('🔧 Procesando HTML para corregir rutas con base:', baseUrl);

      // Función para determinar si una ruta necesita ser proxificada
      const needsProxy = (path: string): boolean => {
        const extensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.ico'];
        return extensions.some(ext => path.toLowerCase().includes(ext));
      };

      // Función para crear URL del proxy
      const createProxyUrl = (path: string): string => {
        // Si ya es una URL completa, usarla directamente
        if (path.startsWith('http://') || path.startsWith('https://')) {
          return `http://localhost:3001/api/mandatos-resource?url=${encodeURIComponent(path)}`;
        }
        // Si empieza con /, agregar el dominio base
        if (path.startsWith('/')) {
          return `http://localhost:3001/api/mandatos-resource?url=${encodeURIComponent(baseUrl + path)}`;
        }
        // Si es relativa, agregar el dominio base
        return `http://localhost:3001/api/mandatos-resource?url=${encodeURIComponent(baseUrl + '/' + path)}`;
      };

      // Corregir rutas relativas y absolutas
      let processedHtml = html
        // Corregir href con rutas que empiezan con /
        .replace(/href="\/([^"]*)"/g, (match, path) => {
          if (needsProxy(path)) {
            const proxyUrl = createProxyUrl('/' + path);
            console.log('🔧 Proxificando href:', path, '->', proxyUrl);
            return `href="${proxyUrl}"`;
          }
          return match;
        })
        // Corregir src con rutas que empiezan con /
        .replace(/src="\/([^"]*)"/g, (match, path) => {
          if (needsProxy(path)) {
            const proxyUrl = createProxyUrl('/' + path);
            console.log('🔧 Proxificando src:', path, '->', proxyUrl);
            return `src="${proxyUrl}"`;
          }
          return match;
        })
        // Corregir url() en CSS con rutas que empiezan con /
        .replace(/url\(\/([^)]*)\)/g, (match, path) => {
          if (needsProxy(path)) {
            const proxyUrl = createProxyUrl('/' + path);
            console.log('🔧 Proxificando url():', path, '->', proxyUrl);
            return `url("${proxyUrl}")`;
          }
          return match;
        })
        // Corregir URLs completas de mandatos.consalud.des
        .replace(/href="(http:\/\/mandatos\.consalud\.des\/[^"]*)"/g, (_, url) => {
          const proxyUrl = createProxyUrl(url);
          console.log('🔧 Proxificando href completo:', url, '->', proxyUrl);
          return `href="${proxyUrl}"`;
        })
        .replace(/src="(http:\/\/mandatos\.consalud\.des\/[^"]*)"/g, (_, url) => {
          const proxyUrl = createProxyUrl(url);
          console.log('🔧 Proxificando src completo:', url, '->', proxyUrl);
          return `src="${proxyUrl}"`;
        })
        // Corregir URLs de www.consalud.cl
        .replace(/href="(https:\/\/www\.consalud\.cl\/[^"]*)"/g, (_, url) => {
          const proxyUrl = createProxyUrl(url);
          console.log('🔧 Proxificando href consalud.cl:', url, '->', proxyUrl);
          return `href="${proxyUrl}"`;
        })
        .replace(/src="(https:\/\/www\.consalud\.cl\/[^"]*)"/g, (_, url) => {
          const proxyUrl = createProxyUrl(url);
          console.log('🔧 Proxificando src consalud.cl:', url, '->', proxyUrl);
          return `src="${proxyUrl}"`;
        })
        // Corregir llamadas AJAX
        .replace(/ManagerfrmMandatos\.ashx\?MethodName=([^'"]*)/g, (_, methodName) => {
          const proxyUrl = `http://localhost:3001/api/mandatos-ajax/${methodName}`;
          console.log('🔧 Proxificando AJAX:', methodName, '->', proxyUrl);
          return proxyUrl;
        })
        .replace(/http:\/\/mandatos\.consalud\.des\/Middleware\/ManagerfrmMandatos\.ashx\?MethodName=([^'"]*)/g, (_, methodName) => {
          const proxyUrl = `http://localhost:3001/api/mandatos-ajax/${methodName}`;
          console.log('🔧 Proxificando AJAX completo:', methodName, '->', proxyUrl);
          return proxyUrl;
        });

      // Inyectar script para interceptar AJAX y recursos
      const ajaxInterceptorScript = `
        <script>
          console.log('🔧 Inyectando interceptor AJAX y recursos en ventana directa...');

          // Función para redirigir URLs al proxy
          function redirectToProxy(url) {
            if (!url) return url;

            // Si ya es del proxy, no redirigir
            if (url.includes('localhost:3001')) return url;

            // Si es una llamada AJAX, redirigir al endpoint AJAX
            if (url.includes('ManagerfrmMandatos.ashx')) {
              const urlObj = new URL(url, window.location.href);
              const methodName = urlObj.searchParams.get('MethodName');
              if (methodName) {
                return 'http://localhost:3001/api/mandatos-ajax/' + methodName;
              }
            }

            // Si es un recurso estático, redirigir al proxy de recursos
            const extensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.ico'];
            if (extensions.some(ext => url.toLowerCase().includes(ext))) {
              return 'http://localhost:3001/api/mandatos-resource?url=' + encodeURIComponent(url);
            }

            return url;
          }

          // Interceptar XMLHttpRequest
          const originalXHROpen = XMLHttpRequest.prototype.open;
          const originalXHRSend = XMLHttpRequest.prototype.send;

          XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            console.log('🔄 Interceptando XHR:', method, url);

            const redirectedUrl = redirectToProxy(url);
            if (redirectedUrl !== url) {
              console.log('🔄 Redirigiendo XHR:', url, '->', redirectedUrl);
              url = redirectedUrl;
            }

            return originalXHROpen.call(this, method, url, async, user, password);
          };

          XMLHttpRequest.prototype.send = function(data) {
            console.log('🔄 Enviando XHR con datos:', data);
            return originalXHRSend.call(this, data);
          };

          // Interceptar fetch
          const originalFetch = window.fetch;
          window.fetch = function(url, options) {
            console.log('🔄 Interceptando fetch:', url);

            const redirectedUrl = redirectToProxy(url);
            if (redirectedUrl !== url) {
              console.log('🔄 Redirigiendo fetch:', url, '->', redirectedUrl);
              url = redirectedUrl;
            }

            return originalFetch.call(this, url, options);
          };

          // Interceptar creación de elementos para corregir src y href
          const originalCreateElement = document.createElement;
          document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);

            if (tagName.toLowerCase() === 'link' || tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'img') {
              const originalSetAttribute = element.setAttribute;
              element.setAttribute = function(name, value) {
                if ((name === 'href' || name === 'src') && value) {
                  const redirectedValue = redirectToProxy(value);
                  if (redirectedValue !== value) {
                    console.log('🔄 Redirigiendo atributo', name, ':', value, '->', redirectedValue);
                    value = redirectedValue;
                  }
                }
                return originalSetAttribute.call(this, name, value);
              };
            }

            return element;
          };

          console.log('✅ Interceptor AJAX y recursos inyectado en ventana directa');
        </script>
      `;

      // Inyectar el script antes del cierre del head o al inicio del body
      if (processedHtml.includes('</head>')) {
        processedHtml = processedHtml.replace('</head>', ajaxInterceptorScript + '</head>');
      } else if (processedHtml.includes('<body')) {
        processedHtml = processedHtml.replace('<body', ajaxInterceptorScript + '<body');
      } else {
        processedHtml = ajaxInterceptorScript + processedHtml;
      }

      return processedHtml;

    } catch (error) {
      console.error('❌ Error procesando HTML:', error);
      return html;
    }
  };

  // Manejar el cierre del modal
  const handleClose = () => {
    console.log('🔒 Cerrando modal de iframe de mandatos');
    setProxyActivated(false);
    setHasResourceErrors(false);
    setProxyCountdown(0);
    onClose();
  };

  // Manejar clic en overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mandatos-iframe-modal-overlay" onClick={handleOverlayClick}>
      <div className="mandatos-iframe-modal-container">
        {/* Header del modal */}
        <div className="mandatos-iframe-modal-header">
          <div className="mandatos-iframe-modal-title">
            <h2>Actualizar Mandatos</h2>
            {transactionId && (
              <span className="transaction-id">
                ID: {transactionId.substring(0, 8)}...
              </span>
            )}
          </div>
          <div className="mandatos-iframe-modal-actions">
            {iframeUrl && (
              <>
                <button
                  className="button is-small is-warning mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReloadIframe();
                  }}
                  title="Recargar formulario"
                  disabled={iframeLoading}
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
                {hasResourceErrors && (
                  <>
                    <button
                      className="button is-small is-danger mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReloadWithCorsFix();
                      }}
                      title="Intentar solución CORS"
                      disabled={iframeLoading}
                    >
                      <i className="fas fa-tools"></i>
                    </button>
                    <button
                      className="button is-small is-success mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseProxy();
                      }}
                      title={proxyActivated ? "Proxy ya activado" : "Usar proxy para solucionar CORS"}
                      disabled={iframeLoading || proxyActivated}
                    >
                      <i className="fas fa-server"></i>
                      {proxyActivated && <span className="ml-1">✓</span>}
                    </button>
                  </>
                )}
                <button
                  className="button is-small is-info mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenInNewTab();
                  }}
                  title="Abrir en nueva pestaña"
                >
                  <i className="fas fa-external-link-alt"></i>
                </button>
                <button
                  className="button is-small is-warning mr-2"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const newValue = !useInternalWindow;
                    setUseInternalWindow(newValue);

                    // Si se activa la ventana interna, activar proxy automáticamente
                    if (newValue && !proxyActivated) {
                      console.log('🔄 Activando proxy para ventana interna...');
                      await handleUseProxy();
                    }
                  }}
                  title={useInternalWindow ? "Usar iframe normal" : "Usar ventana interna (sin CORS)"}
                >
                  <i className="fas fa-window-restore"></i>
                </button>
                <button
                  className="button is-small is-success mr-2"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const newValue = !useTabSimulation;
                    setUseTabSimulation(newValue);

                    // Si se activa la simulación de pestaña, activar proxy automáticamente
                    if (newValue && !proxyActivated) {
                      console.log('🔄 Activando proxy para simulación de pestaña...');
                      await handleUseProxy();
                    }
                  }}
                  title={useTabSimulation ? "Usar iframe normal" : "Simular pestaña del navegador (sin CORS)"}
                >
                  <i className="fas fa-window-maximize"></i>
                </button>
                <button
                  className="button is-small is-primary mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenRealWindow();
                  }}
                  title="Abrir en ventana real (sin CORS, sin iframe)"
                >
                  <i className="fas fa-external-link-square-alt"></i>
                </button>
                <button
                  className="button is-small is-info mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadDirectContent();
                  }}
                  title="Cargar contenido directamente (sin iframe, sin CORS)"
                  disabled={directLoading}
                >
                  <i className="fas fa-window-restore"></i>
                  {directLoading && <span className="ml-1">⏳</span>}
                </button>
              </>
            )}
            <button
              className="mandatos-iframe-modal-close"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              aria-label="Cerrar modal"
            >
              ×
            </button>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="mandatos-iframe-modal-body">
          {loading ? (
            <div className="mandatos-iframe-loading">
              <div className="loader-container">
                <div className="loader"></div>
              </div>
              <p>Cargando formulario de mandatos...</p>
            </div>
          ) : error ? (
            <div className="mandatos-iframe-error">
              <div className="notification is-danger">
                <h3>Error al cargar el formulario</h3>
                <p>{error}</p>
                <button className="button is-primary" onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}>
                  Cerrar
                </button>
              </div>
            </div>
          ) : useRealWindow ? (
            <div className="mandatos-real-window-info">
              <div className="notification is-info">
                <h3>✅ Ventana Real Abierta</h3>
                <p>El formulario de mandatos se ha abierto en una nueva ventana del navegador.</p>
                <p><strong>Ventajas de esta opción:</strong></p>
                <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                  <li>✅ Sin restricciones de CORS</li>
                  <li>✅ Carga completa de recursos</li>
                  <li>✅ Funcionalidad completa del formulario</li>
                  <li>✅ Datos se cargan correctamente</li>
                </ul>
                <div className="mt-4">
                  <button
                    className="button is-primary mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (popupWindow && !popupWindow.closed) {
                        popupWindow.focus();
                      }
                    }}
                  >
                    <i className="fas fa-external-link-alt mr-1"></i>
                    Ir a la Ventana
                  </button>
                  <button
                    className="button is-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseRealWindow();
                      handleClose();
                    }}
                  >
                    <i className="fas fa-times mr-1"></i>
                    Cerrar Todo
                  </button>
                </div>
              </div>
            </div>
          ) : useDirectWindow ? (
            <div className="mandatos-direct-window-container" style={{
              width: '100%',
              height: '100%',
              border: '2px solid #1976d2',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#f5f5f5'
            }}>
              <div className="direct-window-header" style={{
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '14px'
              }}>
                <span>📋 Formulario de Mandatos - Carga Directa (Sin CORS)</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUseDirectWindow(false);
                    setDirectContent('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  title="Cerrar ventana directa"
                >
                  ×
                </button>
              </div>
              <div className="direct-window-content" style={{
                height: 'calc(100% - 40px)',
                position: 'relative',
                backgroundColor: 'white',
                overflow: 'auto'
              }}>
                {directLoading ? (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10
                  }}>
                    <div className="loader-container">
                      <div className="loader"></div>
                    </div>
                    <p>Cargando formulario directamente...</p>
                  </div>
                ) : directContent ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: directContent }}
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'auto'
                    }}
                  />
                ) : (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#666'
                  }}>
                    <h3>Contenido no disponible</h3>
                    <p>No se ha cargado contenido aún.</p>
                    <button
                      className="button is-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLoadDirectContent();
                      }}
                    >
                      Cargar Contenido
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : iframeUrl ? (
            <div className="mandatos-iframe-container">
              {useTabSimulation ? (
                <div className="browser-tab-simulation" style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Barra de pestaña del navegador */}
                  <div className="browser-tab-bar" style={{
                    backgroundColor: '#f1f1f1',
                    borderBottom: '1px solid #ddd',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    minHeight: '40px'
                  }}>
                    <div className="tab-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="tab-buttons" style={{ display: 'flex', gap: '4px' }}>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#ff5f57',
                          cursor: 'pointer'
                        }} title="Cerrar pestaña" onClick={(e) => {
                          e.stopPropagation();
                          setUseTabSimulation(false);
                        }}></div>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#ffbd2e',
                          cursor: 'pointer'
                        }} title="Minimizar"></div>
                        <div style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: '#28ca42',
                          cursor: 'pointer'
                        }} title="Maximizar"></div>
                      </div>
                      <div className="tab-title" style={{
                        marginLeft: '12px',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        📋 Formulario de Mandatos
                      </div>
                    </div>
                    <div className="tab-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="refresh-button" style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }} title="Recargar" onClick={(e) => {
                        e.stopPropagation();
                        handleReloadIframe();
                      }}>
                        🔄
                      </div>
                    </div>
                  </div>

                  {/* Barra de direcciones */}
                  <div className="address-bar" style={{
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #ddd',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: '#4CAF50',
                      borderRadius: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      🔒
                    </div>
                    <div style={{
                      flex: 1,
                      backgroundColor: '#f8f8f8',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      {iframeUrl}
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      SEGURO
                    </div>
                  </div>

                  {/* Contenido del iframe */}
                  <div className="browser-content" style={{
                    flex: 1,
                    position: 'relative',
                    backgroundColor: '#fff'
                  }}>
                    {iframeLoading && (
                      <div className="mandatos-iframe-loading-overlay" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10
                      }}>
                        <div className="loader-container">
                          <div className="loader"></div>
                        </div>
                        <p>Cargando formulario de mandatos...</p>
                      </div>
                    )}
                    {iframeError ? (
                      <div className="mandatos-iframe-error-overlay" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10
                      }}>
                        <div className="notification is-danger">
                          <h3>Error al cargar el formulario</h3>
                          <p>{iframeError}</p>
                          <div className="mt-3">
                            <button
                              className="button is-primary mr-2"
                              onClick={async (e) => {
                                e.stopPropagation();
                                setIframeError(null);
                                setIframeLoading(true);
                                console.log('🔄 Reintentando con verificación de proxy...');

                                // Verificar proxy nuevamente
                                const proxyAvailable = await checkProxyAvailability();
                                if (proxyAvailable) {
                                  console.log('✅ Proxy disponible, activando...');
                                  handleUseProxy();
                                } else {
                                  console.log('❌ Proxy aún no disponible');
                                  setIframeError('El servidor proxy sigue no disponible. Por favor, inicie el servidor proxy ejecutando: node src/server/proxy.js');
                                  setIframeLoading(false);
                                }
                              }}
                            >
                              Reintentar
                            </button>
                            <button className="button is-secondary" onClick={(e) => {
                              e.stopPropagation();
                              handleClose();
                            }}>
                              Cerrar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {iframeUrl && iframeUrl.startsWith('http') ? (
                      <iframe
                        ref={iframeRef}
                        src={getIframeUrl()}
                        title="Formulario de Mandatos"
                        className="mandatos-iframe"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-downloads allow-modals allow-presentation allow-orientation-lock allow-pointer-lock"
                        allow="fullscreen; camera; microphone; geolocation; payment; usb; autoplay; encrypted-media; clipboard-read; clipboard-write"
                        referrerPolicy="no-referrer"
                        loading="eager"
                        style={{
                          display: iframeLoading ? 'none' : 'block',
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        onLoadStart={() => {
                          console.log('🚀 Iframe comenzando a cargar con src:', iframeRef.current?.src);
                          console.log('🚀 URL esperada:', iframeUrl);
                        }}
                      />
                    ) : (
                      <div className="mandatos-iframe-error-overlay" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10
                      }}>
                        <div className="notification is-warning">
                          <h3>URL no disponible</h3>
                          <p>La URL del formulario no está disponible o es inválida.</p>
                          <p><strong>URL actual:</strong> {iframeUrl || 'null'}</p>
                          <button className="button is-primary" onClick={handleClose}>
                            Cerrar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : useInternalWindow ? (
                <div className="internal-window-container" style={{
                  width: '100%',
                  height: '100%',
                  border: '2px solid #3273dc',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  position: 'relative',
                  backgroundColor: '#f5f5f5'
                }}>
                  <div className="internal-window-header" style={{
                    backgroundColor: '#3273dc',
                    color: 'white',
                    padding: '8px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px'
                  }}>
                    <span>📋 Formulario de Mandatos - Ventana Interna</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUseInternalWindow(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                      title="Cerrar ventana interna"
                    >
                      ×
                    </button>
                  </div>
                  <div className="internal-window-content" style={{
                    height: 'calc(100% - 40px)',
                    position: 'relative'
                  }}>
                    {iframeLoading && (
                      <div className="mandatos-iframe-loading-overlay" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10
                      }}>
                        <div className="loader-container">
                          <div className="loader"></div>
                        </div>
                        <p>Cargando formulario de mandatos...</p>
                      </div>
                    )}
                    {iframeError ? (
                      <div className="mandatos-iframe-error-overlay" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10
                      }}>
                        <div className="notification is-danger">
                          <h3>Error al cargar el formulario</h3>
                          <p>{iframeError}</p>
                          <div className="mt-3">
                            <button
                              className="button is-primary mr-2"
                              onClick={async (e) => {
                                e.stopPropagation();
                                setIframeError(null);
                                setIframeLoading(true);
                                console.log('🔄 Reintentando con verificación de proxy...');

                                // Verificar proxy nuevamente
                                const proxyAvailable = await checkProxyAvailability();
                                if (proxyAvailable) {
                                  console.log('✅ Proxy disponible, activando...');
                                  handleUseProxy();
                                } else {
                                  console.log('❌ Proxy aún no disponible');
                                  setIframeError('El servidor proxy sigue no disponible. Por favor, inicie el servidor proxy ejecutando: node src/server/proxy.js');
                                  setIframeLoading(false);
                                }
                              }}
                            >
                              Reintentar
                            </button>
                            <button className="button is-secondary" onClick={(e) => {
                              e.stopPropagation();
                              handleClose();
                            }}>
                              Cerrar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {iframeUrl && iframeUrl.startsWith('http') ? (
                      <iframe
                        ref={iframeRef}
                        src={getIframeUrl()}
                        title="Formulario de Mandatos"
                        className="mandatos-iframe"
                        onLoad={handleIframeLoad}
                        onError={handleIframeError}
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-downloads allow-modals allow-presentation allow-orientation-lock allow-pointer-lock"
                        allow="fullscreen; camera; microphone; geolocation; payment; usb; autoplay; encrypted-media; clipboard-read; clipboard-write"
                        referrerPolicy="no-referrer"
                        loading="eager"
                        style={{
                          display: iframeLoading ? 'none' : 'block',
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                        onLoadStart={() => {
                          console.log('🚀 Iframe comenzando a cargar con src:', iframeRef.current?.src);
                          console.log('🚀 URL esperada:', iframeUrl);
                        }}
                      />
                    ) : (
                      <div className="mandatos-iframe-error-overlay" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10
                      }}>
                        <div className="notification is-warning">
                          <h3>URL no disponible</h3>
                          <p>La URL del formulario no está disponible o es inválida.</p>
                          <p><strong>URL actual:</strong> {iframeUrl || 'null'}</p>
                          <button className="button is-primary" onClick={handleClose}>
                            Cerrar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {iframeLoading && (
                    <div className="mandatos-iframe-loading-overlay">
                      <div className="loader-container">
                        <div className="loader"></div>
                      </div>
                      <p>Cargando formulario de mandatos...</p>
                    </div>
                  )}
                  {iframeError ? (
                    <div className="mandatos-iframe-error-overlay">
                      <div className="notification is-danger">
                        <h3>Error al cargar el formulario</h3>
                        <p>{iframeError}</p>
                        <div className="mt-3">
                            <button
                              className="button is-primary mr-2"
                              onClick={async (e) => {
                                e.stopPropagation();
                                setIframeError(null);
                                setIframeLoading(true);
                                console.log('🔄 Reintentando con verificación de proxy...');

                                // Verificar proxy nuevamente
                                const proxyAvailable = await checkProxyAvailability();
                                if (proxyAvailable) {
                                  console.log('✅ Proxy disponible, activando...');
                                  handleUseProxy();
                                } else {
                                  console.log('❌ Proxy aún no disponible');
                                  setIframeError('El servidor proxy sigue no disponible. Por favor, inicie el servidor proxy ejecutando: node src/server/proxy.js');
                                  setIframeLoading(false);
                                }
                              }}
                            >
                              Reintentar
                            </button>
                            <button className="button is-secondary" onClick={(e) => {
                              e.stopPropagation();
                              handleClose();
                            }}>
                              Cerrar
                            </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                  {iframeUrl && iframeUrl.startsWith('http') ? (
                    <iframe
                      ref={iframeRef}
                      src={iframeUrl}
                      title="Formulario de Mandatos"
                      className="mandatos-iframe"
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-downloads allow-modals allow-presentation"
                      allow="fullscreen; camera; microphone; geolocation; payment; usb; autoplay"
                      referrerPolicy="no-referrer"
                      loading="eager"
                      style={{
                        display: iframeLoading ? 'none' : 'block',
                        width: '100%',
                        height: '100%',
                        border: 'none'
                      }}
                      onLoadStart={() => {
                        console.log('🚀 Iframe comenzando a cargar con src:', iframeRef.current?.src);
                        console.log('🚀 URL esperada:', iframeUrl);
                      }}
                    />
                  ) : (
                    <div className="mandatos-iframe-error-overlay">
                      <div className="notification is-warning">
                        <h3>URL no disponible</h3>
                        <p>La URL del formulario no está disponible o es inválida.</p>
                        <p><strong>URL actual:</strong> {iframeUrl || 'null'}</p>
                        <button className="button is-primary" onClick={handleClose}>
                          Cerrar
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="mandatos-iframe-error">
              <div className="notification is-warning">
                <h3>No se pudo generar la URL</h3>
                <p>No se pudo obtener la URL del formulario de mandatos.</p>
                <button className="button is-primary" onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}>
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer del modal */}
        <div className="mandatos-iframe-modal-footer">
          <div className="mandatos-iframe-modal-instructions">
            <p>
              <i className="fas fa-info-circle"></i>
              Complete la información en el formulario y cierre esta ventana cuando termine.
            </p>
            <p className="is-size-7 mt-1">
              <i className="fas fa-list"></i>
              <strong>Opciones disponibles:</strong>
            </p>
            <ul className="is-size-7 mt-1" style={{ marginLeft: '20px' }}>
              <li><i className="fas fa-sync-alt"></i> <strong>Recargar:</strong> Si no ve datos, use el botón de recarga</li>
              <li><i className="fas fa-external-link-square-alt"></i> <strong>Ventana Real:</strong> <span className="has-text-success"><strong>RECOMENDADO</strong></span> - Abre en ventana real sin CORS</li>
              <li><i className="fas fa-window-restore"></i> <strong>Carga Directa:</strong> <span className="has-text-info"><strong>NUEVO</strong></span> - Carga contenido directamente sin iframe</li>
              <li><i className="fas fa-window-maximize"></i> <strong>Simular pestaña:</strong> Simula una pestaña del navegador dentro del modal</li>
              <li><i className="fas fa-window-restore"></i> <strong>Ventana interna:</strong> Simula una ventana dentro del modal</li>
              <li><i className="fas fa-external-link-alt"></i> <strong>Nueva pestaña:</strong> Abre directamente en nueva pestaña del navegador</li>
            </ul>
            {hasResourceErrors ? (
              <div className="is-size-7 mt-1 has-text-danger">
                <p>
                  <i className="fas fa-exclamation-triangle"></i>
                  <strong>Problema CORS detectado:</strong> El servidor bloquea recursos en iframe.
                </p>
                <p className="mt-1">
                  <i className="fas fa-clock"></i>
                  <strong>Activación automática:</strong> El proxy se activará automáticamente en {proxyCountdown} segundos...
                </p>
                <p className="mt-1">
                  <i className="fas fa-tools"></i>
                  O use el botón de herramientas para intentar solución CORS manualmente.
                </p>
                <p className="mt-1">
                  <i className="fas fa-server"></i>
                  <strong>Proxy CORS:</strong> El proxy se activa automáticamente al abrir el modal. Si no funciona, inicie manualmente: node src/server/proxy.js
                </p>
                <p className="mt-1">
                  <i className="fas fa-lightbulb"></i>
                  <strong>Recomendación:</strong> Use la opción <strong>"Ventana Real"</strong> (botón azul) para evitar completamente los problemas de CORS.
                </p>
              </div>
            ) : (
              <p className="is-size-7 mt-1 has-text-info">
                <i className="fas fa-info-circle"></i>
                Para la mejor experiencia, use la opción <strong>"Ventana Real"</strong> (botón azul) que evita completamente los problemas de CORS.
              </p>
            )}
          </div>
          <button
            className="button is-secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MandatosIframeModal;
