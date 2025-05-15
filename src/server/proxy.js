const express = require('express');
const axios = require('axios');
const cors = require('cors');
const xml2js = require('xml2js');
const { DOMParser } = require('xmldom');
const parser = new xml2js.Parser({ explicitArray: false });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Habilitar CORS para todas las rutas
app.use(express.json());

// Función para extraer datos del XML
function extractDataFromXml(xmlString) {
  try {
    // Parsear el XML a un DOM
    const domParser = new DOMParser();
    const xmlDoc = domParser.parseFromString(xmlString, 'text/xml');
    
    // Buscar nodos específicos - ajustar según la estructura real de tu XML
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
    return {
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
  } catch (error) {
    console.error('Error al extraer datos del XML:', error);
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

// Ruta para consultar mandato
app.post('/api/mandato', async (req, res) => {
  try {
    const { rutCliente, nSecMandato = '' } = req.body;
    
    if (!rutCliente) {
      return res.status(400).json({
        mensaje: 'El RUT del cliente es requerido'
      });
    }
    
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
    
    console.log(`Consultando mandato para RUT: ${rutCliente}, Mandato: ${nSecMandato || 'No especificado'}`);
    
    // Realizar petición SOAP con axios
    const response = await axios.post(
      'http://caja.sistemastransversales.tes/consalud.Caja.servicios/SvcMandato.svc',
      soapEnvelope,
      {
        headers: {
          'Content-Type': 'text/xml;charset=UTF-8',
          'SOAPAction': 'Consalud.Caja.Servicios/ISvcMandato/TraeInfoMandato'
        }
      }
    );
    
    if (response.status === 200) {
      // Procesar la respuesta XML
      const xmlResponse = response.data;
      console.log('Respuesta XML recibida:', xmlResponse);
      
      // Extraer los datos del XML
      const processedData = extractDataFromXml(xmlResponse);
      
      // Enviar respuesta procesada
      return res.json(processedData);
    } else {
      return res.status(response.status).json({
        mensaje: `Error en la respuesta del servicio: ${response.status}`
      });
    }
  } catch (error) {
    console.error('Error en API proxy:', error);
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Respuesta de error:', error.response.data);
      
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor proxy corriendo en http://localhost:${PORT}`);
});