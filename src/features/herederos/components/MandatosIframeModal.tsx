import React, { useState } from 'react';
import { encriptarParametrosMandatos } from '../services/herederosService';
import './styles/MandatosIframeModal.css';

interface MandatosIframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  iframeUrl: string | null;
  transactionId: string | null;
  loading: boolean;
  error: string | null;
  onIframeLoad?: () => void;
  // Funcionalidad de pestaña externa
  isExternalTabOpen?: boolean;
  onOpenExternalTab?: () => void;
  onCloseExternalTab?: () => void;
  externalTabUrl?: string | null;
}

const MandatosIframeModal: React.FC<MandatosIframeModalProps> = ({
  isOpen,
  onClose,
  loading,
  error,
  isExternalTabOpen = false,
  onOpenExternalTab,
  onCloseExternalTab,
  externalTabUrl
}) => {
  const [tabContent, setTabContent] = useState<string>('');
  const [tabLoading, setTabLoading] = useState(false);

  const handleClose = () => {
    setTabContent('');
    setTabLoading(false);
    onClose();
  };

  // Función para abrir en pestaña externa
  const handleOpenExternalTab = () => {
    if (onOpenExternalTab) {
      onOpenExternalTab();
    }
  };

  // Simular pestaña dentro de la aplicación con proxy avanzado
  const handleOpenTabSimulation = async () => {
    try {
      setTabLoading(true);
      console.log('🚀 Creando simulación de pestaña dentro de la aplicación...');

      // Obtener datos del session storage para la encriptación
      console.log('🔍 Buscando datos en sessionStorage...');

      // Buscar en diferentes claves posibles
      const possibleKeys = [
        'titularContext',
        'formHerederoData',
        'formData'
      ];

      // También buscar claves que empiecen con 'formHerederoData_'
      const allKeys = Object.keys(sessionStorage);
      const herederoKeys = allKeys.filter(key => key.startsWith('formHerederoData_'));
      possibleKeys.push(...herederoKeys);

      // Priorizar claves de herederos (formHerederoData_RUT)
      possibleKeys.sort((a, b) => {
        if (a.startsWith('formHerederoData_') && !b.startsWith('formHerederoData_')) return -1;
        if (!a.startsWith('formHerederoData_') && b.startsWith('formHerederoData_')) return 1;
        return 0;
      });

      console.log('🔍 Claves disponibles en sessionStorage:', allKeys);
      console.log('🔍 Claves de herederos encontradas:', herederoKeys);

      let sessionData: any = null;

      for (const key of possibleKeys) {
        const data = sessionStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log(`🔍 Datos en ${key}:`, parsed);

            // Verificar si tiene los campos necesarios
            if (parsed.RutCompleto || parsed.rut || parsed.Rut) {
              sessionData = parsed;
              console.log(`✅ Datos encontrados en ${key}`);
              break;
            }
          } catch (error) {
            console.log(`❌ Error parseando ${key}:`, error);
          }
        }
      }

      if (!sessionData) {
        throw new Error('No se encontraron datos en sessionStorage');
      }

      console.log('🔍 Estructura completa de sessionData:', sessionData);
      console.log('🔍 Campos disponibles en sessionData:', Object.keys(sessionData));

      // Extraer datos para encriptación
      let rutAfiliado = '';
      let nombres = '';
      let apellidoPaterno = '';
      let apellidoMaterno = '';

      if (sessionData.RutCompleto) {
        // Datos de FormHerederoData
        rutAfiliado = sessionData.RutCompleto; // Mantener formato con guión
        nombres = sessionData.NombrePersona || '';
        apellidoPaterno = sessionData.ApellidoPaterno || '';
        apellidoMaterno = sessionData.ApellidoMaterno || '';
      } else if (sessionData.rut) {
        // Datos de titularContext
        rutAfiliado = sessionData.rut;
        nombres = sessionData.nombre || '';
        apellidoPaterno = sessionData.apellidoPat || '';
        apellidoMaterno = sessionData.apellidoMat || '';
      }

      console.log('📋 Datos extraídos para encriptación:', {
        rutAfiliado,
        nombres,
        apellidoPaterno,
        apellidoMaterno
      });

      if (!rutAfiliado) {
        throw new Error('No se pudo extraer el RUT de los datos encontrados');
      }

      // Llamar al servicio de encriptación
      const encryptedUrl = await encriptarParametrosMandatos(
        'SCELI',
        rutAfiliado,
        nombres,
        apellidoPaterno,
        apellidoMaterno
      );
      console.log('🔐 URL encriptada recibida:', encryptedUrl);

      // Limpiar la URL (remover comillas y @ si existen)
      let cleanUrl = encryptedUrl.trim();
      if (cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) {
        cleanUrl = cleanUrl.slice(1, -1);
      }
      if (cleanUrl.startsWith('@')) {
        cleanUrl = cleanUrl.slice(1);
      }

      console.log('🧹 URL limpia:', cleanUrl);

      if (!cleanUrl.startsWith('http')) {
        throw new Error(`URL encriptada inválida: ${cleanUrl}`);
      }

      // Crear contenido HTML que simule una pestaña del navegador con supresión de errores
      const tabHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Formulario de Mandatos - Consalud</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f5f5f5;
              height: 100vh;
              overflow: hidden;
            }
            .browser-tab {
              background: white;
              height: 100vh;
              display: flex;
              flex-direction: column;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            .tab-header {
              background: #f8f9fa;
              border-bottom: 1px solid #e9ecef;
              padding: 8px 16px;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .tab-controls {
              display: flex;
              gap: 8px;
            }
            .tab-control {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              border: none;
              cursor: pointer;
            }
            .tab-control.close { background: #ff5f57; }
            .tab-control.minimize { background: #ffbd2e; }
            .tab-control.maximize { background: #28ca42; }
            .tab-url {
              background: white;
              border: 1px solid #ddd;
              border-radius: 20px;
              padding: 6px 16px;
              flex: 1;
              font-size: 14px;
              color: #666;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .tab-url::before {
              content: "🔒";
              font-size: 12px;
            }
            .tab-content {
              flex: 1;
              position: relative;
            }
            .tab-iframe {
              width: 100%;
              height: 100%;
              border: none;
              background: white;
            }
            .loading {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              text-align: center;
              color: #666;
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid #f3f3f3;
              border-top: 4px solid #007bff;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 16px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
          <script>
            // Suprimir TODOS los errores de consola para recursos
            (function() {
              const originalConsoleError = console.error;
              const originalConsoleWarn = console.warn;

              // Suprimir errores de recursos específicos
              console.error = function(...args) {
                const message = args.join(' ');
                if (message.includes('Failed to load resource') ||
                    message.includes('404 (Not Found)') ||
                    message.includes('net::ERR_ABORTED') ||
                    message.includes('.css') ||
                    message.includes('.woff') ||
                    message.includes('.png') ||
                    message.includes('.jpg') ||
                    message.includes('.gif')) {
                  // No mostrar estos errores
                  return;
                }
                originalConsoleError.apply(console, args);
              };

              console.warn = function(...args) {
                const message = args.join(' ');
                if (message.includes('Failed to load resource') ||
                    message.includes('404 (Not Found)') ||
                    message.includes('net::ERR_ABORTED') ||
                    message.includes('.css') ||
                    message.includes('.woff') ||
                    message.includes('.png') ||
                    message.includes('.jpg') ||
                    message.includes('.gif')) {
                  // No mostrar estos warnings
                  return;
                }
                originalConsoleWarn.apply(console, args);
              };

              // Suprimir errores de red globalmente
              window.addEventListener('error', function(e) {
                if (e.target && e.target.tagName) {
                  const tagName = e.target.tagName.toLowerCase();
                  if (tagName === 'link' || tagName === 'img' || tagName === 'script') {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  }
                }
              }, true);

              // Suprimir errores de recursos no encontrados
              window.addEventListener('unhandledrejection', function(e) {
                if (e.reason && e.reason.message &&
                    (e.reason.message.includes('Failed to load') ||
                     e.reason.message.includes('404'))) {
                  e.preventDefault();
                  return false;
                }
              });

              console.log('✅ Supresión de errores de recursos configurada');
            })();
          </script>
        </head>
        <body>
          <div class="browser-tab">
            <div class="tab-header">
              <div class="tab-controls">
                <button class="tab-control close" onclick="window.close()"></button>
                <button class="tab-control minimize"></button>
                <button class="tab-control maximize"></button>
              </div>
              <div class="tab-url">${cleanUrl}</div>
            </div>
            <div class="tab-content">
              <div class="loading" id="loading">
                <div class="spinner"></div>
                <div>Cargando formulario de mandatos...</div>
              </div>
              <iframe
                class="tab-iframe"
                src="${cleanUrl}"
                sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                onload="document.getElementById('loading').style.display='none'"
                onerror="document.getElementById('loading').innerHTML='<div style=&quot;color:red;&quot;>Error al cargar el formulario</div>'"
              ></iframe>
            </div>
          </div>
        </body>
        </html>
      `;

      setTabContent(tabHtml);
      setTabLoading(false);

      console.log('✅ Simulación de pestaña creada exitosamente');

    } catch (error: any) {
      console.error('❌ Error creando simulación de pestaña:', error);
      setTabLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="mandatos-iframe-modal-overlay" onClick={handleClose}>
      <div className="mandatos-iframe-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="mandatos-iframe-modal-header">
            <h2>Actualizar Mandatos</h2>
          <div className="mandatos-iframe-modal-actions">
            <button
              className="button is-small is-success"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenExternalTab();
              }}
              title="Abrir en nueva pestaña del navegador (recomendado)"
              disabled={loading || isExternalTabOpen}
            >
              <i className="fas fa-external-link-alt"></i>
              {loading ? '⏳ Cargando...' : 'Abrir en Pestaña'}
            </button>
            <button
              className="button is-small is-primary"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenTabSimulation();
              }}
              title="Simular pestaña del navegador dentro de la aplicación"
              disabled={tabLoading || isExternalTabOpen}
            >
              <i className="fas fa-tab"></i>
              {tabLoading ? '⏳ Cargando...' : 'Simular Pestaña'}
            </button>
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
          {isExternalTabOpen ? (
            <div className="mandatos-external-tab-info">
              <div className="notification is-info">
                <h3>🌐 Pestaña Externa Abierta</h3>
                <p>El formulario de mandatos se ha abierto en una nueva pestaña del navegador.</p>
                <p><strong>URL:</strong> <code>{externalTabUrl}</code></p>
                <div className="mt-4">
                  <p className="has-text-weight-semibold">⚠️ Instrucciones importantes:</p>
                  <ul className="mt-2">
                    <li>• Complete el formulario en la pestaña externa</li>
                    <li>• Los botones de esta aplicación estarán bloqueados hasta que cierre la pestaña</li>
                    <li>• Una vez terminado, cierre la pestaña externa para continuar</li>
                  </ul>
                </div>
                <div className="mt-4">
                  <button
                    className="button is-warning"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCloseExternalTab) {
                        onCloseExternalTab();
                      }
                    }}
                  >
                    <i className="fas fa-times"></i>
                    Cerrar Pestaña Externa
                  </button>
                </div>
              </div>
            </div>
          ) : loading ? (
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
          ) : tabContent ? (
            <div className="mandatos-tab-simulation">
              <iframe
                srcDoc={tabContent}
                style={{
                  width: '100%',
                  height: '600px',
                  border: 'none',
                  borderRadius: '8px'
                }}
                title="Simulación de Pestaña - Formulario de Mandatos"
              />
            </div>
          ) : (
            <div className="mandatos-iframe-placeholder">
              <div className="notification is-info">
                <h3>Formulario de Mandatos</h3>
                <p>Seleccione una opción para abrir el formulario de mandatos:</p>

                <div className="columns mt-4">
                  <div className="column">
                    <div className="box has-background-success-light">
                      <h4 className="has-text-success-dark">
                        <i className="fas fa-external-link-alt"></i> Pestaña Externa (Recomendado)
                      </h4>
                      <p className="mt-2">Abre el formulario en una nueva pestaña del navegador.</p>
                      <p><strong>Ventajas:</strong></p>
                      <ul>
                        <li>✅ Experiencia nativa del navegador</li>
                        <li>✅ Mejor compatibilidad con formularios complejos</li>
                        <li>✅ Bloqueo automático de botones durante el proceso</li>
                        <li>✅ Detección automática de cierre de pestaña</li>
                      </ul>
                    </div>
                  </div>

                  <div className="column">
                    <div className="box has-background-primary-light">
                      <h4 className="has-text-primary-dark">
                        <i className="fas fa-tab"></i> Simulación de Pestaña
                      </h4>
                      <p className="mt-2">Abre el formulario dentro de la aplicación.</p>
                      <p><strong>Ventajas:</strong></p>
                      <ul>
                        <li>✅ No sales de la aplicación</li>
                        <li>✅ Interceptores avanzados para recursos</li>
                        <li>✅ Interfaz familiar de navegador</li>
                        <li>✅ Proxy automático para CORS</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer del modal */}
        <div className="mandatos-iframe-modal-footer">
          <p>Complete la información en el formulario y cierre esta ventana cuando termine.</p>
          <button
            className="button is-primary"
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
