import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { DOMParser } from 'xmldom';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;
const DEBUG = process.env.DEBUG === 'true';
const useMockData = process.env.USE_MOCK === 'true';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/xml' }));

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
  const soapEnvelope = `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:con="Consalud.Caja.Servicios">
      <soapenv:Header/>
      <soapenv:Body>
        <con:TraeInfoMandato>
          <con:pCliente>${rutCliente}</con:pCliente>
          <con:pNSecMandato>${nSecMandato}</con:pNSecMandato>
        </con:TraeInfoMandato>
      </soapenv:Body>
    </soapenv:Envelope>
  `;
  
  // Guardar solicitud para depuración
  saveDebugInfo('soap_request', soapEnvelope);
  
  try {
    // Realizar petición SOAP con axios
    const response = await axios.post(
      'http://caja.sistemastransversales.tes/consalud.Caja.servicios/SvcMandato.svc',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': 'Consalud.Caja.Servicios/ISvcMandato/TraeInfoMandato'
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
      
      // Verificar que tenemos un string XML válido
      if (typeof xmlResponse !== 'string' || !xmlResponse.includes('<')) {
        throw new Error('Respuesta no es un XML válido');
      }
      
      // Extraer los datos del XML
      const processedData = extractDataFromXml(xmlResponse);
      console.log('Datos procesados:', processedData);
      
      return processedData;
    } else {
      throw new Error(`Error en la respuesta del servicio: ${response.status}`);
    }
  } catch (error) {
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
  console.log(' - GET /api/test - Para verificar el estado del servidor');
});