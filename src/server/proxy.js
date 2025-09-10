import axios from 'axios';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { DOMParser } from 'xmldom';

const app = express();
const PORT = process.env.PORT || 3001;
const DEBUG = process.env.DEBUG === 'true';
const useMockData = process.env.USE_MOCK === 'true';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/xml' }));
app.get('/api/wsdl', async (req, res) => {
  try {
    // Usa la URL del WSDL del servicio
    const response = await axios.get(
      'http://caja.sistemastransversales.tes/consalud.Caja.servicios/SvcMandato.svc?wsdl'
    );
    res.header('Content-Type', 'text/xml');
    res.send(response.data);
  } catch (error) {
    res.status(500).send(`Error obteniendo WSDL: ${error.message}`);
  }
});

// Configuración avanzada para depuración
if (DEBUG) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', req.headers);
    if (req.body) console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
  });
}

// Función para guardar logs para depuración
function saveDebugInfo(prefix, data) {
  if (!DEBUG) return;

  try {
    // Crear directorio logs si no existe
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Guardar archivo con timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filePath = path.join(logDir, `${prefix}_${timestamp}.log`);

    if (typeof data === 'object') {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } else {
      fs.writeFileSync(filePath, data);
    }

    console.log(`Archivo de depuración guardado: ${filePath}`);
  } catch (err) {
    console.error('Error al guardar información de depuración:', err);
  }
}

// Función para extraer datos del XML
function extractDataFromXml(xmlString) {
  try {
    // Guardar XML para depuración
    saveDebugInfo('xml_response', xmlString);

    // Parsear el XML a un DOM
    const domParser = new DOMParser();
    const xmlDoc = domParser.parseFromString(xmlString, 'text/xml');

    // Buscar nodos específicos
    const findNode = (tagName) => {
      const elements = xmlDoc.getElementsByTagName(tagName);
      return elements.length > 0 ? elements[0].textContent.trim() : null;
    };

    // Extraer datos específicos
    const mandatoId = findNode('SMANDATO') || findNode('Mandato');
    const banco = findNode('Sdescorinstfinanc') || findNode('Banco');
    const tipoCuenta = findNode('DesTipoCuenta') || findNode('TipoCuenta');
    const numeroCuenta = findNode('Snumctacte') || findNode('NumeroCuenta');
    const nombreCliente = findNode('Snombres') || findNode('Nombres');
    const apellidoPaterno = findNode('Sapepaterno') || findNode('ApellidoPaterno');
    const apellido = findNode('Sapematerno') || findNode('ApellidoMaterno');
    const rutCliente = findNode('SidRutcliente') || findNode('Rut');
    const digitoVerificador = findNode('Sdigcliente') || findNode('DigitoVerificador');
    const mensaje = findNode('MENSAJE') || findNode('Mensaje') || 'OK';
    const indTipo = findNode('Sindtipo') || findNode('CodigoTipoCuenta');

    // Extraer todos los nodos posibles para depuración
    const allNodes = {};
    const allElements = xmlDoc.getElementsByTagName("*");
    for (let i = 0; i < allElements.length; i++) {
      const element = allElements[i];
      if (element.textContent && element.textContent.trim() !== '') {
        allNodes[element.nodeName] = element.textContent.trim();
      }
    }

    // Guardar para depuración
    saveDebugInfo('all_xml_nodes', allNodes);

    // Crear objeto resultado
    const result = {
      mandatoId: mandatoId || '',
      banco: banco || '',
      tipoCuenta: tipoCuenta || (indTipo ? getTipoCuentaFromCodigo(indTipo) : ''),
      numeroCuenta: numeroCuenta || '',
      nombreCliente: nombreCliente || '',
      apellidoPaterno: apellidoPaterno || '',
      apellido: apellido || '',
      rutCliente: rutCliente || '',
      digitoVerificador: digitoVerificador || '',
      mensaje: mensaje || 'OK',
      indTipo: indTipo || ''
    };

    // Incluir todos los nodos encontrados si estamos en modo debug
    if (DEBUG) {
      result._debug = {
        allNodes: allNodes
      };
    }

    return result;
  } catch (error) {
    console.error('Error al extraer datos del XML:', error);
    saveDebugInfo('xml_extraction_error', {
      error: error.message,
      stack: error.stack,
      xmlString: xmlString?.substring(0, 500) || 'No XML'
    });
    return {
      mensaje: 'Error al procesar respuesta XML: ' + error.message
    };
  }
}

// Función auxiliar para extraer todos los nodos
function extractAllNodes(xmlDoc) {
  const result = {};

  // Función recursiva para procesar todos los nodos
  const processNode = (node) => {
    if (node.nodeType === 1) { // Elemento
      // Si tiene hijos texto
      if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
        const nodeName = node.nodeName.includes(':') ?
                        node.nodeName.split(':')[1] : node.nodeName;

        // Solo guardar si tiene un valor y no es nil
        if (node.textContent.trim() &&
            node.getAttribute('nil') !== 'true') {
          result[nodeName] = node.textContent.trim();
        }
      }

      // Procesar hijos
      for (let i = 0; i < node.childNodes.length; i++) {
        processNode(node.childNodes[i]);
      }
    }
  };

  processNode(xmlDoc);
  return result;
}

// Función para convertir código a tipo de cuenta
function getTipoCuentaFromCodigo(codigo) {
  switch (codigo) {
    case '1': return 'Cuenta Corriente';
    case '2': return 'Cuenta Vista';
    case '3': return 'Cuenta de Ahorro';
    default: return `Tipo ${codigo}`;
  }
}

// Función para generar datos simulados
function getMockData(rutCliente) {
  return {
    mandatoId: '123456',
    banco: 'BANCO DE CHILE',
    tipoCuenta: 'Cuenta Corriente',
    numeroCuenta: '123456789',
    nombreCliente: 'IGNACIO JAVIER',
    apellidoPaterno: 'QUINTANA',
    apellido: 'ASENJO',
    rutCliente: rutCliente || '17175966',
    digitoVerificador: '8',
    mensaje: 'OK',
    indTipo: '1',
    EXISTE_CTA: '1',
    EXISTE_CTA_NO_VIG: '0',
    EXISTE_CTA_Tipo: '1',
    EXISTE_TARJETA: '0',
    MENSAJE: 'OK',
    NUM_CTACTE_Tipo: '1'
  };
}

// Función común para procesar la solicitud SOAP
async function processSoapRequest(rutCliente, nSecMandato) {
  if (!rutCliente) {
    throw new Error('El RUT del cliente es requerido');
  }

  // Si estamos usando datos simulados, regresar inmediatamente
  if (useMockData) {
    console.log('Usando datos simulados para RUT:', rutCliente);
    return getMockData(rutCliente);
  }

  console.log(`Consultando mandato para RUT: ${rutCliente}, Mandato: ${nSecMandato || 'No especificado'}`);

  // Construir el envelope SOAP
  const soapEnvelope = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:con="Consalud.Caja.Servicios">
   <soapenv:Header/>
   <soapenv:Body>
      <con:TraeInfoMandato>
         <con:pCliente>${rutCliente}</con:pCliente>
         <con:pNSecMandato>${nSecMandato}</con:pNSecMandato>
      </con:TraeInfoMandato>
   </soapenv:Body>
</soapenv:Envelope>`;

  // Guardar solicitud para depuración
  saveDebugInfo('soap_request', soapEnvelope);


  try {
    // MODIFICANDO SOAPACTION BASADO EN LA RESPUESTA
    const response = await axios.post(
      'http://caja.sistemastransversales.tes/consalud.Caja.servicios/SvcMandato.svc',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction':  'Consalud.Caja.Servicios/SvcMandato/TraeInfoMandato'
        },
        timeout: 15000 // 15 segundos de timeout
      }
    );

    console.log('Estado de respuesta del servicio SOAP:', response.status);

    if (response.status === 200) {
      // Procesar la respuesta XML
      const xmlResponse = response.data;
      console.log('Respuesta XML recibida (primeros 200 caracteres):',
        typeof xmlResponse === 'string' ? xmlResponse.substring(0, 200) + '...' : 'No es string');

      // Extraer los datos del XML
      const processedData = extractDataFromXml(xmlResponse);
      console.log('Datos procesados:', processedData);

      return processedData;
    } else {
      throw new Error(`Error en la respuesta del servicio: ${response.status}`);
    }
  } catch (error) {
    // Información detallada sobre el error
    console.error('Error completo en la petición SOAP:', error);

    if (error.response && error.response.data) {
      console.error('Datos del error:', error.response.data);
      console.error('Headers de respuesta:', error.response.headers);
      saveDebugInfo('soap_error_response', error.response.data);
    }

    // Guardar error para depuración
    saveDebugInfo('soap_error', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data || 'No response data',
      status: error.response?.status || 'No status',
      headers: error.response?.headers || 'No headers'
    });

    throw error;
  }
}

// NUEVO: Añadir soporte para GET en /api/mandato (para pruebas)
app.get('/api/mandato', async (req, res) => {
  try {
    // Obtener los parámetros de la consulta
    const { rutCliente, nSecMandato = '' } = req.query;

    if (!rutCliente) {
      return res.status(400).json({
        mensaje: 'El RUT del cliente es requerido como parámetro de consulta (ejemplo: /api/mandato?rutCliente=12345678)'
      });
    }

    // Usar función común para procesar
    const processedData = await processSoapRequest(rutCliente, nSecMandato);
    return res.json(processedData);

  } catch (error) {
    console.error('Error en API proxy (GET):', error);

    return res.status(500).json({
      mensaje: 'Error al procesar la solicitud: ' + error.message,
      error: error.message
    });
  }
});

// Ruta POST para consultar mandato
app.post('/api/mandato', async (req, res) => {
  try {
    // Esperamos datos JSON del frontend
    const { rutCliente, nSecMandato = '' } = req.body;

    if (!rutCliente) {
      return res.status(400).json({
        mensaje: 'El RUT del cliente es requerido'
      });
    }

    console.log('Cuerpo de la solicitud:', req.body);

    // Usar función común para procesar
    const processedData = await processSoapRequest(rutCliente, nSecMandato);
    return res.json(processedData);

  } catch (error) {
    console.error('Error en API proxy (POST):', error);

    // Manejar diferentes tipos de errores
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Respuesta de error:', error.response.data);
      console.error('Estado de error:', error.response.status);

      return res.status(error.response.status).json({
        mensaje: `Error en el servicio: ${error.response.status}`,
        error: error.message
      });
    } else if (error.request) {
      // La petición fue realizada pero no se recibió respuesta
      console.error('Sin respuesta del servidor');

      return res.status(503).json({
        mensaje: 'No se pudo conectar con el servicio',
        error: error.message
      });
    } else {
      // Error en la configuración de la petición
      console.error('Error de configuración:', error.message);

      return res.status(500).json({
        mensaje: 'Error interno al procesar la petición',
        error: error.message
      });
    }
  }
});

// Endpoint para datos simulados
app.get('/api/mandato/mock', (req, res) => {
  const rutCliente = req.query.rutCliente || '17175966';
  res.json(getMockData(rutCliente));
});

// NUEVO: Proxy para iframe de mandatos (solución CORS)
app.get('/api/mandatos-iframe', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        mensaje: 'La URL del iframe es requerida como parámetro (ejemplo: /api/mandatos-iframe?url=http://mandatos.consalud.des/frmmandatos.aspx?param=...)'
      });
    }

    console.log('🔄 Proxying iframe request para:', url);

    // Hacer la petición al servidor de mandatos
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Aceptar redirects
      }
    });

    console.log('✅ Respuesta del servidor de mandatos:', response.status);

    // Configurar headers CORS para permitir iframe
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.header('X-Frame-Options', 'ALLOWALL');
    res.header('Content-Security-Policy', "frame-ancestors *");
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');

      // Procesar el HTML para corregir rutas relativas
      let htmlContent = response.data;

      // Si el contenido es HTML, procesar las rutas
      if (typeof htmlContent === 'string' && htmlContent.includes('<html')) {
        // Extraer el dominio base de la URL original
        const urlObj = new URL(url);
        const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

        console.log('🔧 Procesando HTML para corregir rutas relativas con base:', baseUrl);
        console.log('🔧 HTML original (primeros 500 caracteres):', htmlContent.substring(0, 500));

        // Inyectar script para interceptar AJAX ANTES de procesar las rutas
        const ajaxInterceptorScript = `
          <script>
            console.log('🔧 Inyectando interceptor AJAX...');

            // Interceptar XMLHttpRequest
            const originalXHROpen = XMLHttpRequest.prototype.open;
            const originalXHRSend = XMLHttpRequest.prototype.send;

            XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
              console.log('🔄 Interceptando XHR:', method, url);

              // Si es una llamada a ManagerfrmMandatos.ashx, redirigir al proxy
              if (url && url.includes('ManagerfrmMandatos.ashx')) {
                const urlObj = new URL(url, window.location.href);
                const methodName = urlObj.searchParams.get('MethodName');
                if (methodName) {
                  const proxyUrl = 'http://localhost:3001/api/mandatos-ajax/' + methodName;
                  console.log('🔄 Redirigiendo AJAX a proxy:', url, '->', proxyUrl);
                  url = proxyUrl;
                }
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

              // Si es una llamada a ManagerfrmMandatos.ashx, redirigir al proxy
              if (url && url.includes('ManagerfrmMandatos.ashx')) {
                const urlObj = new URL(url, window.location.href);
                const methodName = urlObj.searchParams.get('MethodName');
                if (methodName) {
                  const proxyUrl = 'http://localhost:3001/api/mandatos-ajax/' + methodName;
                  console.log('🔄 Redirigiendo fetch a proxy:', url, '->', proxyUrl);
                  url = proxyUrl;
                }
              }

              return originalFetch.call(this, url, options);
            };

            console.log('✅ Interceptor AJAX inyectado correctamente');
          </script>
        `;

        // Inyectar el script antes del cierre del head o al inicio del body
        if (htmlContent.includes('</head>')) {
          htmlContent = htmlContent.replace('</head>', ajaxInterceptorScript + '</head>');
        } else if (htmlContent.includes('<body')) {
          htmlContent = htmlContent.replace('<body', ajaxInterceptorScript + '<body');
        } else {
          htmlContent = ajaxInterceptorScript + htmlContent;
        }

      // Corregir rutas relativas de CSS, JS, imágenes, etc.
      htmlContent = htmlContent
        // Corregir rutas que empiezan con /
        .replace(/href="\/([^"]*\.css[^"]*)"/g, `href="http://localhost:3001/api/mandatos-resource?url=${encodeURIComponent(baseUrl + '/' + '$1')}"`)
        .replace(/src="\/([^"]*\.(js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)[^"]*)"/g, `src="http://localhost:3001/api/mandatos-resource?url=${encodeURIComponent(baseUrl + '/' + '$1')}"`)
        .replace(/url\(\/([^)]*\.(css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)[^)]*)\)/g, `url("http://localhost:3001/api/mandatos-resource?url=${encodeURIComponent(baseUrl + '/' + '$1')}")`)
        // Corregir rutas que empiezan con //
        .replace(/url\("\/\/([^"]*)"\)/g, `url("http://localhost:3001/api/mandatos-resource?url=${encodeURIComponent(urlObj.protocol + '//' + '$1')}")`)
        .replace(/url\('\/\/([^']*)'\)/g, `url('http://localhost:3001/api/mandatos-resource?url=${encodeURIComponent(urlObj.protocol + '//' + '$1')}')`)
        // Corregir rutas relativas sin /
        .replace(/href="([^"]*\.css[^"]*)"/g, (match, path) => {
          if (!path.startsWith('http') && !path.startsWith('/')) {
            return `href="http://localhost:3001/api/mandatos-resource?url=${encodeURIComponent(baseUrl + '/' + path)}"`;
          }
          return match;
        })
        .replace(/src="([^"]*\.(js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)[^"]*)"/g, (match, path) => {
          if (!path.startsWith('http') && !path.startsWith('/')) {
            return `src="http://localhost:3001/api/mandatos-resource?url=${encodeURIComponent(baseUrl + '/' + path)}"`;
          }
          return match;
        })
        // Corregir URLs en CSS
        .replace(/url\(([^)]*\.(css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)[^)]*)\)/g, (match, path) => {
          const cleanPath = path.replace(/['"]/g, '');
          if (!cleanPath.startsWith('http') && !cleanPath.startsWith('/')) {
            return `url("http://localhost:3001/api/mandatos-resource?url=${encodeURIComponent(baseUrl + '/' + cleanPath)}")`;
          }
          return match;
        })
        // Redirigir llamadas AJAX a través del proxy de iframe
        .replace(/url:\s*['"]([^'"]*ManagerfrmMandatos\.ashx[^'"]*)['"]/g, (match, path) => {
          if (path.includes('ManagerfrmMandatos.ashx')) {
            const resourceUrl = encodeURIComponent(path.startsWith('http') ? path : baseUrl + '/' + path);
            return `url: "http://localhost:3001/api/mandatos-iframe?url=${resourceUrl}"`;
          }
          return match;
        })
        // Redirigir llamadas AJAX con diferentes patrones
        .replace(/['"]([^'"]*ManagerfrmMandatos\.ashx[^'"]*)['"]/g, (match, path) => {
          if (path.includes('ManagerfrmMandatos.ashx')) {
            const resourceUrl = encodeURIComponent(path.startsWith('http') ? path : baseUrl + '/' + path);
            return `"http://localhost:3001/api/mandatos-iframe?url=${resourceUrl}"`;
          }
          return match;
        })
        // Redirigir todas las llamadas AJAX a través del proxy
        .replace(/url:\s*['"]([^'"]*\.ashx[^'"]*)['"]/g, (match, path) => {
          const resourceUrl = encodeURIComponent(path.startsWith('http') ? path : baseUrl + '/' + path);
          return `url: "http://localhost:3001/api/mandatos-iframe?url=${resourceUrl}"`;
        })
        .replace(/['"]([^'"]*\.ashx[^'"]*)['"]/g, (match, path) => {
          const resourceUrl = encodeURIComponent(path.startsWith('http') ? path : baseUrl + '/' + path);
          return `"http://localhost:3001/api/mandatos-iframe?url=${resourceUrl}"`;
        })
        // Redirigir llamadas AJAX específicas de ManagerfrmMandatos.ashx
        .replace(/ManagerfrmMandatos\.ashx\?MethodName=([^'"]*)/g, (match, methodName) => {
          return `http://localhost:3001/api/mandatos-ajax/${methodName}`;
        })
        // Redirigir URLs completas de ManagerfrmMandatos.ashx
        .replace(/http:\/\/mandatos\.consalud\.des\/Middleware\/ManagerfrmMandatos\.ashx\?MethodName=([^'"]*)/g, (match, methodName) => {
          return `http://localhost:3001/api/mandatos-ajax/${methodName}`;
        })
        // Redirigir URLs con parámetros adicionales
        .replace(/http:\/\/mandatos\.consalud\.des\/Middleware\/ManagerfrmMandatos\.ashx\?MethodName=([^&]+)&([^'"]*)/g, (match, methodName, params) => {
          return `http://localhost:3001/api/mandatos-ajax/${methodName}?${params}`;
        })
        // Redirigir todas las referencias a ManagerfrmMandatos.ashx en el código JavaScript
        .replace(/['"]([^'"]*ManagerfrmMandatos\.ashx[^'"]*)['"]/g, (match, url) => {
          if (url.includes('MethodName=')) {
            const methodName = url.match(/MethodName=([^&]+)/)?.[1];
            if (methodName) {
              return `"http://localhost:3001/api/mandatos-ajax/${methodName}"`;
            }
          }
          return match;
        });

      // Agregar meta tag para permitir iframe y scripts adicionales
      htmlContent = htmlContent.replace(
        '<head>',
        `<head>
        <meta http-equiv="X-Frame-Options" content="ALLOWALL">
        <meta http-equiv="Content-Security-Policy" content="frame-ancestors *">
        <base href="${baseUrl}/">
        <script>
          console.log('🔧 Iniciando interceptor AJAX robusto...');
          console.log('🔧 Timestamp:', new Date().toISOString());

          // Función para convertir URL relativa a absoluta
          function resolveUrl(url, baseUrl) {
            if (url.startsWith('http')) return url;
            if (url.startsWith('//')) return 'http:' + url;
            if (url.startsWith('/')) return baseUrl + url;
            if (url.startsWith('../')) {
              var parts = baseUrl.split('/');
              parts.pop();
              return parts.join('/') + '/' + url.substring(3);
            }
            return baseUrl + '/' + url;
          }

          // Obtener URL base
          var baseUrl = '${baseUrl}';
          console.log('🔧 URL base detectada:', baseUrl);
          console.log('🔧 Interceptor robusto cargado correctamente');

          // Interceptar XMLHttpRequest
          var originalXHROpen = XMLHttpRequest.prototype.open;
          var originalXHRSend = XMLHttpRequest.prototype.send;

          XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
            this._url = url;
            this._method = method;

            console.log('🔧 XMLHttpRequest.open interceptado:', method, url);

            // Convertir URL relativa a absoluta si es necesario
            var absoluteUrl = resolveUrl(url, baseUrl);
            console.log('🔧 URL absoluta resuelta:', absoluteUrl);

            // Redirigir URLs de ManagerfrmMandatos.ashx a través del proxy específico
            if (absoluteUrl && absoluteUrl.includes('ManagerfrmMandatos.ashx')) {
              var methodName = absoluteUrl.match(/MethodName=([^&]+)/);
              if (methodName) {
                var proxyUrl = 'http://localhost:3001/api/mandatos-ajax/' + methodName[1];
                console.log('🔄 Redirigiendo AJAX:', absoluteUrl, '->', proxyUrl);
                url = proxyUrl;
              }
            } else {
              console.log('🔧 URL no contiene ManagerfrmMandatos.ashx, no redirigiendo');
            }

            return originalXHROpen.call(this, method, url, async, user, password);
          };

          XMLHttpRequest.prototype.send = function(data) {
            var xhr = this;

            xhr.addEventListener('load', function() {
              if (xhr._url && xhr._url.includes('mandatos-ajax')) {
                console.log('✅ AJAX completado:', xhr._url, 'Status:', xhr.status);
              }
            });

            xhr.addEventListener('error', function() {
              if (xhr._url && xhr._url.includes('mandatos-ajax')) {
                console.log('❌ Error AJAX:', xhr._url);
              }
            });

            return originalXHRSend.call(this, data);
          };

          console.log('✅ Interceptor XMLHttpRequest configurado');

          // Interceptar jQuery AJAX
          function setupJQueryInterceptor() {
            if (typeof $ !== 'undefined' && $.ajax) {
              console.log('🔧 Configurando interceptor jQuery...');
              var originalAjax = $.ajax;
              $.ajax = function(options) {
                if (options.url) {
                  var absoluteUrl = resolveUrl(options.url, baseUrl);
                  if (absoluteUrl && absoluteUrl.includes('ManagerfrmMandatos.ashx')) {
                    var methodName = absoluteUrl.match(/MethodName=([^&]+)/);
                    if (methodName) {
                      var proxyUrl = 'http://localhost:3001/api/mandatos-ajax/' + methodName[1];
                      console.log('🔄 Redirigiendo jQuery AJAX:', absoluteUrl, '->', proxyUrl);
                      options.url = proxyUrl;
                    }
                  }
                }
                return originalAjax.call(this, options);
              };
              console.log('✅ Interceptor jQuery configurado');
            } else {
              setTimeout(setupJQueryInterceptor, 100);
            }
          }

          setupJQueryInterceptor();

          // Interceptar fetch API también
          var originalFetch = window.fetch;
          window.fetch = function(url, options) {
            if (typeof url === 'string') {
              var absoluteUrl = resolveUrl(url, baseUrl);
              if (absoluteUrl && absoluteUrl.includes('ManagerfrmMandatos.ashx')) {
                var methodName = absoluteUrl.match(/MethodName=([^&]+)/);
                if (methodName) {
                  var proxyUrl = 'http://localhost:3001/api/mandatos-ajax/' + methodName[1];
                  console.log('🔄 Redirigiendo fetch:', absoluteUrl, '->', proxyUrl);
                  url = proxyUrl;
                }
              }
            }
            return originalFetch.call(this, url, options);
          };

          console.log('✅ Interceptor fetch configurado');

          // Verificar datos al cargar
          window.addEventListener('load', function() {
            console.log('🔄 Página cargada, verificando datos...');
            setTimeout(function() {
              var bancosSelect = document.querySelector('select[name*="banco"], select[id*="banco"]');
              var beneficiarioSelect = document.querySelector('select[name*="beneficiario"], select[id*="beneficiario"]');

              if (bancosSelect && bancosSelect.options.length <= 1) {
                console.log('⚠️ No se encontraron bancos, intentando recargar...');
                window.location.reload();
              }

              if (beneficiarioSelect && beneficiarioSelect.options.length <= 1) {
                console.log('⚠️ No se encontraron beneficiarios, intentando recargar...');
                window.location.reload();
              }
            }, 3000);
          });
        </script>`
      );

      console.log('✅ HTML procesado y rutas corregidas');
      console.log('✅ HTML procesado (primeros 500 caracteres):', htmlContent.substring(0, 500));
    }

    res.send(htmlContent);

  } catch (error) {
    console.error('❌ Error en proxy de iframe:', error);

    // Guardar error para depuración
    saveDebugInfo('iframe_proxy_error', {
      message: error.message,
      stack: error.stack,
      url: req.query.url,
      response: error.response?.data || 'No response data',
      status: error.response?.status || 'No status'
    });

    res.status(500).json({
      mensaje: 'Error al cargar el iframe: ' + error.message,
      error: error.message
    });
  }
});


// Servir Service Worker
app.get('/sw-proxy.js', (req, res) => {
  res.header('Content-Type', 'application/javascript');
  res.header('Service-Worker-Allowed', '/');
  res.send(`
    // Service Worker para interceptar llamadas AJAX
    console.log('🔧 Service Worker cargado para interceptar AJAX');

    self.addEventListener('fetch', function(event) {
      const url = new URL(event.request.url);

      // Interceptar llamadas a ManagerfrmMandatos.ashx
      if (url.pathname.includes('ManagerfrmMandatos.ashx')) {
        const methodName = url.searchParams.get('MethodName');
        if (methodName) {
          const proxyUrl = \`http://localhost:3001/api/mandatos-ajax/\${methodName}\`;
          console.log('🔄 Service Worker redirigiendo:', event.request.url, '->', proxyUrl);

          event.respondWith(
            fetch(proxyUrl, {
              method: event.request.method,
              headers: event.request.headers,
              body: event.request.body
            }).catch(error => {
              console.error('❌ Error en Service Worker:', error);
              return fetch(event.request);
            })
          );
        }
      }
    });
  `);
});

// NUEVO: Proxy para recursos estáticos (CSS, JS, imágenes, fuentes) y llamadas AJAX
app.all('/api/mandatos-resource', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        mensaje: 'La URL del recurso es requerida como parámetro'
      });
    }

    console.log('🔄 Proxying resource request para:', url);
    console.log('🔄 Method:', req.method);
    console.log('🔄 Body:', req.body);

    // Hacer la petición al recurso
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      params: req.query,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 15000,
      maxRedirects: 3,
      responseType: 'arraybuffer' // Para manejar binarios (imágenes, fuentes)
    });

    console.log('✅ Recurso obtenido:', response.status, url);

    // Configurar headers CORS para permitir acceso
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // Determinar el tipo de contenido
    const contentType = response.headers['content-type'] || 'application/octet-stream';
    res.header('Content-Type', contentType);

    // Enviar el contenido
    res.send(response.data);

  } catch (error) {
    console.error('❌ Error en proxy de recurso:', error);

    res.status(500).json({
      mensaje: 'Error al cargar el recurso: ' + error.message,
      error: error.message
    });
  }
});

// NUEVO: Endpoints específicos para llamadas AJAX de mandatos
app.all('/api/mandatos-ajax/:methodName', async (req, res) => {
  try {
    const { methodName } = req.params;
    const queryParams = req.query;
    const bodyData = req.body;

    console.log('🔄 Proxying AJAX request para método:', methodName);
    console.log('🔄 Query params:', queryParams);
    console.log('🔄 Body data:', bodyData);

    // Construir URL del endpoint original
    const baseUrl = 'http://mandatos.consalud.des/Middleware/ManagerfrmMandatos.ashx';
    const url = `${baseUrl}?MethodName=${methodName}`;

    // Configurar headers para la petición
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Content-Type': req.headers['content-type'] || 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'http://mandatos.consalud.des/frmmandatos.aspx'
    };

    // Hacer la petición al servidor original
    const response = await axios({
      method: req.method,
      url: url,
      data: bodyData,
      params: queryParams,
      headers: headers,
      timeout: 30000,
      maxRedirects: 3
    });

    console.log('✅ AJAX response recibida:', response.status, 'para método:', methodName);

    // Configurar headers CORS para permitir acceso
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Content-Type', response.headers['content-type'] || 'application/json');

    // Enviar la respuesta
    res.send(response.data);

  } catch (error) {
    console.error('❌ Error en proxy AJAX:', error);

    // Configurar headers CORS incluso para errores
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    res.status(500).json({
      mensaje: 'Error al procesar la llamada AJAX: ' + error.message,
      error: error.message
    });
  }
});

// Endpoint para iniciar el proxy
app.post('/api/start-proxy', (req, res) => {
  console.log('🚀 Solicitud de inicio de proxy recibida');
  res.json({
    status: 'OK',
    message: 'Proxy ya está ejecutándose',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para detener el proxy
app.post('/api/stop-proxy', (req, res) => {
  console.log('🛑 Solicitud de detención de proxy recibida');
  res.json({
    status: 'OK',
    message: 'Proxy detenido',
    timestamp: new Date().toISOString()
  });

  // Detener el servidor después de un breve delay
  setTimeout(() => {
    console.log('🛑 Deteniendo servidor proxy...');
    process.exit(0);
  }, 1000);
});

// Endpoint de prueba (para verificar si el servidor está funcionando)
app.get('/api/test', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor proxy en funcionamiento',
    config: {
      debug: DEBUG,
      useMockData: useMockData,
      port: PORT
    },
    endpoints: [
      { method: 'POST', url: '/api/mandato', description: 'Consulta de mandato (requiere cuerpo JSON)' },
      { method: 'GET', url: '/api/mandato?rutCliente=12345678', description: 'Consulta de mandato por GET (para pruebas)' },
      { method: 'GET', url: '/api/mandato/mock', description: 'Datos simulados de mandato' },
      { method: 'GET', url: '/api/mandatos-iframe?url=...', description: 'Proxy para iframe de mandatos (solución CORS)' },
      { method: 'GET', url: '/api/mandatos-resource?url=...', description: 'Proxy para recursos estáticos (CSS, JS, imágenes, fuentes)' },
      { method: 'ALL', url: '/api/mandatos-ajax/:methodName', description: 'Proxy específico para llamadas AJAX de mandatos (LLENADESTINATARIOPAGO, LLENABANCOS, etc.)' },
      { method: 'POST', url: '/api/start-proxy', description: 'Iniciar proxy (ya está ejecutándose)' },
      { method: 'POST', url: '/api/stop-proxy', description: 'Detener proxy' },
      { method: 'GET', url: '/api/test', description: 'Verificación del servidor' }
    ]
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor proxy ejecutándose en http://localhost:${PORT}`);
  console.log('Configuración:');
  console.log(` - Modo debug: ${DEBUG ? 'Activado' : 'Desactivado'}`);
  console.log(` - Uso de datos simulados: ${useMockData ? 'Activado' : 'Desactivado'}`);
  console.log('Endpoints disponibles:');
  console.log(' - POST /api/mandato - Para solicitudes SOAP (producción)');
  console.log(' - GET /api/mandato?rutCliente=12345678 - Para pruebas rápidas');
  console.log(' - GET /api/mandato/mock - Para obtener datos simulados');
  console.log(' - GET /api/mandatos-iframe?url=... - Proxy para iframe de mandatos (solución CORS)');
  console.log(' - GET /api/mandatos-resource?url=... - Proxy para recursos estáticos (CSS, JS, imágenes, fuentes)');
  console.log(' - GET /api/test - Para verificar el estado del servidor');
});
