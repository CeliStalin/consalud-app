// proxy.js - Versión completa con JWT mejorado y soporte para aplicación externa
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { DOMParser } from 'xmldom';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'; // Asegúrate de tener esta dependencia instalada

// Carga de variables de entorno desde .env
dotenv.config();

// Constantes del servidor
const app = express();
const PORT = process.env.PORT || 3001;
const DEBUG = process.env.DEBUG === 'true';
const useMockData = process.env.USE_MOCK === 'true';
const TOKEN_EXPIRY = 60 * 60; // 1 hora en segundos

// URL de la aplicación externa
const EXTERNAL_APP_URL = process.env.EXTERNAL_APP_URL || 'http://mandatos.consalud.tes/frmmandatos.aspx?param=0D0F4162C48B1AFC1A4D7EBE785806F42C69BE6A4774A5B6F965BB9EE11CE752E5C83CD48C1E540EBDCC8A24675365D7FE2F6543ECEDD7BF907EC9EAB993BECDB0625FA1546E934388C4EBBEE7E0DCCBB354F2CD3C780CD90A01BDF6D8055BDB68EA1CB7056C9003EE90508A30B90382';

// Mejor gestión del JWT_SECRET
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' 
  ? undefined 
  : 'desarrollo-secreto-no-usar-en-produccion');

// Validar la existencia de JWT_SECRET en producción
if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  console.error('ERROR CRÍTICO: JWT_SECRET no está definido');
  console.error('En producción, esto es un requisito de seguridad.');
  console.error('Ejecute el servidor con una variable de entorno JWT_SECRET definida.');
  process.exit(1);
}

// Logger mejorado para seguridad
function logSecurityWarning(message) {
  console.warn(`[SEGURIDAD] ⚠️ ${message}`);
}

// Verificar fortaleza del JWT_SECRET
function checkSecretStrength(secret) {
  if (secret === 'desarrollo-secreto-no-usar-en-produccion') {
    logSecurityWarning('Usando JWT_SECRET de desarrollo. NO USAR EN PRODUCCIÓN.');
    return;
  }
  
  if (secret.length < 32) {
    logSecurityWarning('JWT_SECRET es demasiado corto. Debería tener al menos 32 caracteres.');
  }
  
  const hasUppercase = /[A-Z]/.test(secret);
  const hasLowercase = /[a-z]/.test(secret);
  const hasNumbers = /[0-9]/.test(secret);
  const hasSpecialChars = /[^A-Za-z0-9]/.test(secret);
  
  if (!hasUppercase || !hasLowercase || !hasNumbers || !hasSpecialChars) {
    logSecurityWarning('JWT_SECRET debería contener mayúsculas, minúsculas, números y caracteres especiales.');
  }
}

// Comprobar la fortaleza del secreto
checkSecretStrength(JWT_SECRET);

// Función para generar JWT
function generateJWT(payload) {
  // Agregar claims estándar
  const tokenPayload = {
    ...payload,
    iss: 'consalud-frontend-app',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY
  };

  // Firmar el token con el JWT_SECRET seguro
  return jwt.sign(tokenPayload, JWT_SECRET);
}

// Función para verificar JWT
function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.log('Token expirado:', error.expiredAt);
    } else {
      console.error('Error al verificar token JWT:', error.name, error.message);
    }
    return null;
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/xml' }));

// Configuración avanzada para depuración
if (DEBUG) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body) console.log('Body:', typeof req.body === 'object' ? JSON.stringify(req.body, null, 2) : req.body.substring(0, 200));
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

// Middleware para validar token JWT (opcional)
function jwtAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Se requiere token de autorización' });
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyJWT(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
  
  // Adjuntar payload decodificado a req
  req.user = decoded;
  next();
}

// Función para extraer datos del XML (código existente)
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

// Función para procesar solicitud SOAP
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
  
  try {
    const response = await axios.post(
      'http://caja.sistemastransversales.tes/consalud.Caja.servicios/SvcMandato.svc',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': 'Consalud.Caja.Servicios/SvcMandato/TraeInfoMandato'
        },
        timeout: 15000 // 15 segundos de timeout
      }
    );
    
    console.log('Estado de respuesta del servicio SOAP:', response.status);
    
    if (response.status === 200) {
      // Procesar la respuesta XML
      const xmlResponse = response.data;
      
      // Extraer los datos del XML
      const processedData = extractDataFromXml(xmlResponse);
      console.log('Datos procesados:', processedData);
      
      return processedData;
    } else {
      throw new Error(`Error en la respuesta del servicio: ${response.status}`);
    }
  } catch (error) {
    console.error('Error completo en la petición SOAP:', error);
    throw error;
  }
}

// ==================== NUEVAS RUTAS PARA APLICACIÓN EXTERNA ====================

// Endpoint para registrar una transacción externa
app.post('/api/external-app/register-transaction', (req, res) => {
  try {
    const { transactionId, params } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requiere un ID de transacción' 
      });
    }
    
    console.log(`Registrando transacción: ${transactionId}`, params);
    
    // Guardar datos de la transacción para debugging
    if (DEBUG) {
      saveDebugInfo(`transaction_${transactionId}`, {
        id: transactionId,
        params,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
    }
    
    // Generar token JWT para seguimiento
    const token = generateJWT({ 
      transactionId, 
      type: 'external-app-transaction' 
    });
    
    return res.json({ 
      success: true, 
      token,
      message: 'Transacción registrada correctamente' 
    });
  } catch (error) {
    console.error('Error al registrar transacción:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al registrar la transacción: ' + error.message 
    });
  }
});

// Endpoint para verificar el estado de una transacción
app.get('/api/external-app/transaction-status/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Se requiere un ID de transacción' 
      });
    }
    
    console.log(`Verificando estado de transacción: ${id}`);
    
    // Simulación: 80% de las transacciones son exitosas
    const success = Math.random() > 0.2;
    
    return res.json({
      success: true,
      status: success ? 'success' : 'error',
      transaction: {
        id,
        completed: success,
        timestamp: new Date().toISOString(),
        error: success ? null : 'La transacción falló o fue cancelada por el usuario'
      }
    });
  } catch (error) {
    console.error('Error al verificar estado de transacción:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al verificar el estado de la transacción: ' + error.message 
    });
  }
});

// Endpoint para generar URL para la aplicación externa
app.post('/api/external-app/generate-url', (req, res) => {
  try {
    console.log('Generando URL para aplicación externa - usando URL fija pre-configurada');
    
    // Usamos la URL fija pre-configurada que sabemos que funciona
    return res.json({ 
      success: true, 
      url: EXTERNAL_APP_URL,
      note: 'Usando URL fija para entorno de desarrollo'
    });
  } catch (error) {
    console.error('Error al generar URL para aplicación externa:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al generar URL: ' + error.message 
    });
  }
});

// Endpoint para obtener la URL directamente (método GET)
app.get('/api/external-app/url', (req, res) => {
  try {
    return res.json({ 
      success: true, 
      url: EXTERNAL_APP_URL
    });
  } catch (error) {
    console.error('Error al obtener URL de aplicación externa:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Error al obtener URL: ' + error.message 
    });
  }
});

// ==================== FIN DE NUEVAS RUTAS PARA APLICACIÓN EXTERNA ====================

// Rutas existentes para mandato
app.get('/api/mandato', async (req, res) => {
  try {
    const { rutCliente, nSecMandato = '' } = req.query;
    
    if (!rutCliente) {
      return res.status(400).json({
        mensaje: 'El RUT del cliente es requerido como parámetro de consulta'
      });
    }
    
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

app.post('/api/mandato', async (req, res) => {
  try {
    const { rutCliente, nSecMandato = '' } = req.body;
    
    if (!rutCliente) {
      return res.status(400).json({
        mensaje: 'El RUT del cliente es requerido'
      });
    }
    
    const processedData = await processSoapRequest(rutCliente, nSecMandato);
    return res.json(processedData);
    
  } catch (error) {
    console.error('Error en API proxy (POST):', error);
    
    if (error.response) {
      return res.status(error.response.status).json({
        mensaje: `Error en el servicio: ${error.response.status}`,
        error: error.message
      });
    } else if (error.request) {
      return res.status(503).json({
        mensaje: 'No se pudo conectar con el servicio',
        error: error.message
      });
    } else {
      return res.status(500).json({
        mensaje: 'Error interno al procesar la petición',
        error: error.message
      });
    }
  }
});

// Ruta para generar token JWT (para pruebas)
app.post('/api/auth', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }
  
  // NOTA: En producción, validarías contra una BD o servicio de autenticación
  if (username === 'test' && password === 'test') {
    const token = generateJWT({ 
      sub: '1234567890',
      name: 'Usuario de Prueba',
      role: 'user'
    });
    
    return res.json({ token });
  }
  
  return res.status(401).json({ error: 'Credenciales inválidas' });
});

// Endpoint para verificar token (para pruebas)
app.get('/api/verify-token', jwtAuth, (req, res) => {
  res.json({ 
    message: 'Token válido', 
    user: req.user 
  });
});

// Endpoint de prueba (para verificar si el servidor está funcionando)
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor proxy en funcionamiento',
    config: {
      debug: DEBUG,
      useMockData: useMockData,
      port: PORT,
      jwtConfigured: !!JWT_SECRET,
      externalAppConfigured: !!EXTERNAL_APP_URL
    },
    endpoints: {
      mandato: [
        { method: 'GET', url: '/api/mandato?rutCliente=12345678', description: 'Consulta de mandato por GET' },
        { method: 'POST', url: '/api/mandato', description: 'Consulta de mandato por POST' }
      ],
      externalApp: [
        { method: 'POST', url: '/api/external-app/register-transaction', description: 'Registrar una transacción externa' },
        { method: 'GET', url: '/api/external-app/transaction-status/:id', description: 'Verificar estado de una transacción' },
        { method: 'POST', url: '/api/external-app/generate-url', description: 'Generar URL para la aplicación externa' },
        { method: 'GET', url: '/api/external-app/url', description: 'Obtener URL de la aplicación externa' }
      ],
      auth: [
        { method: 'POST', url: '/api/auth', description: 'Generar token JWT' },
        { method: 'GET', url: '/api/verify-token', description: 'Verificar token JWT' }
      ]
    }
  });
});

// Manejo mejorado de errores del servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor proxy ejecutándose en http://localhost:${PORT}`);
  console.log('Configuración:');
  console.log(` - Modo debug: ${DEBUG ? 'Activado' : 'Desactivado'}`);
  console.log(` - Uso de datos simulados: ${useMockData ? 'Activado' : 'Desactivado'}`);
  console.log(' - JWT configurado correctamente');
  console.log(' - URL aplicación externa configurada');
  console.log('Endpoints disponibles:');
  console.log(' - POST /api/mandato - Para solicitudes SOAP');
  console.log(' - GET /api/mandato?rutCliente=12345678 - Para pruebas rápidas');
  console.log(' - POST /api/auth - Para generar tokens JWT de prueba');
  console.log(' - GET /api/verify-token - Para verificar tokens');
  console.log(' - POST /api/external-app/register-transaction - Registrar transacción externa');
  console.log(' - GET /api/external-app/transaction-status/:id - Verificar estado de transacción');
  console.log(' - POST /api/external-app/generate-url - Generar URL para aplicación externa');
  console.log(' - GET /api/test - Para verificar el estado del servidor');
});

// Manejar errores del servidor
server.on('error', (error) => {
  console.error('Error en el servidor:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Puerto ${PORT} ya está en uso. Intenta con otro puerto.`);
  }
});

// Capturar errores no manejados
process.on('uncaughtException', (error) => {
  console.error('Error no manejado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
});