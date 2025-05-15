import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SecureLayout, Card, Button } from '@consalud/core';
import { mandatoSoapService, MandatoResult } from '../features/documentos/services/MandatoSoapService';
import './styles/DetalleMandatoPage.css';

const DetalleMandatoPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [mandatoInfo, setMandatoInfo] = useState<MandatoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Obtener el mandatoId o rutCliente del estado de la navegación o localStorage
  useEffect(() => {
    const fetchMandatoData = async () => {
      setLoading(true);
      try {
        // Intentar obtener datos del estado de navegación
        const stateData = location.state as { rutCliente?: string, mandatoId?: string } | null;
        
        // Si no hay datos en el estado, buscar en localStorage
        const rutCliente = stateData?.rutCliente || localStorage.getItem('currentRutCliente') || '17175966';
        const mandatoId = stateData?.mandatoId || localStorage.getItem('currentMandatoId') || '';
        
        console.log(`Obteniendo detalles para RUT: ${rutCliente}, Mandato: ${mandatoId}`);
        
        // Llamar al servicio
        const resultado = await mandatoSoapService.getMandatoInfo(rutCliente, mandatoId);
        setMandatoInfo(resultado);
      } catch (err) {
        console.error('Error al cargar detalles del mandato:', err);
        setError('No se pudo cargar la información del mandato');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMandatoData();
  }, [location]);
  
  const handleVolver = () => {
    navigate('/mnherederos/ingresoher');
  };
  
  const handleSiguiente = () => {
    navigate('/mnherederos/ingresoher/success');
  };
  
  return (
    <SecureLayout pageTitle="Detalle de Mandato" allowedRoles={['USER', 'ADMIN', 'Developers']}>
      <div className="content-container" style={{ minHeight: '400px' }}>
        <Card 
          title="Información de la Cuenta Bancaria" 
          subtitle="Detalles de la cuenta bancaria registrada para la devolución"
          variant="elevated"
          padding="large"
        >
          {loading ? (
            <div className="has-text-centered p-6">
              <div className="loader-container">
                <div className="loader"></div>
              </div>
              <p className="mt-4">Cargando información...</p>
            </div>
          ) : error ? (
            <div className="notification is-danger">
              <p>{error}</p>
              <Button 
                variant="primary"
                onClick={handleVolver}
                className="mt-4"
              >
                Volver al inicio
              </Button>
            </div>
          ) : mandatoInfo ? (
              <div className="mandato-detalle">
              <div className="columns">
                <div className="column">
                  <div className="field-group">
                    <h4 className="subtitle is-6">Información de la cuenta</h4>
                    <div className="field">
                      <label className="label">Banco</label>
                      <p className="field-value">{mandatoInfo.banco}</p>
                    </div>
                    <div className="field">
                      <label className="label">Tipo de cuenta</label>
                      <p className="field-value">{mandatoInfo.tipoCuenta}</p>
                    </div>
                    <div className="field">
                      <label className="label">Número de cuenta</label>
                      <p className="field-value">{mandatoInfo.numeroCuenta}</p>
                    </div>
                    <div className="field">
                      <label className="label">ID de mandato</label>
                      <p className="field-value">{mandatoInfo.mandatoId}</p>
                    </div>
                    {mandatoInfo.Sindtipo && (
                      <div className="field">
                        <label className="label">Tipo</label>
                        <p className="field-value">{mandatoInfo.Sindtipo === '1' ? 'Cuenta Corriente' : 
                                                   mandatoInfo.Sindtipo === '2' ? 'Cuenta Vista' :
                                                   mandatoInfo.Sindtipo === '3' ? 'Cuenta de Ahorro' : 
                                                   mandatoInfo.Sindtipo}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="column">
                  <div className="field-group">
                    <h4 className="subtitle is-6">Información del titular</h4>
                    <div className="field">
                      <label className="label">Nombre</label>
                      <p className="field-value">{mandatoInfo.nombreCliente}</p>
                    </div>
                    <div className="field">
                      <label className="label">Apellido Paterno</label>
                      <p className="field-value">{mandatoInfo.apellidoPaterno || '-'}</p>
                    </div>
                    <div className="field">
                      <label className="label">Apellido Materno</label>
                      <p className="field-value">{mandatoInfo.apellido}</p>
                    </div>
                    <div className="field">
                      <label className="label">RUT</label>
                      <p className="field-value">{mandatoInfo.rutCliente}-{mandatoInfo.digitoVerificador}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Mostrar campos adicionales del servicio SOAP en un acordeón */}
              <div className="box mt-4">
                <details>
                  <summary className="has-text-primary has-text-weight-medium">Información adicional del mandato</summary>
                  <div className="columns is-multiline mt-3">
                    {Object.entries(mandatoInfo)
                      .filter(([key]) => !['mandatoId', 'banco', 'tipoCuenta', 'numeroCuenta', 
                                          'nombreCliente', 'apellido', 'apellidoPaterno', 'rutCliente', 
                                          'digitoVerificador', 'mensaje', 'Sindtipo'].includes(key))
                      .map(([key, value]) => (
                        <div className="column is-half" key={key}>
                          <div className="field">
                            <label className="label is-small">{key}</label>
                            <p className="field-value">{String(value || '-')}</p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </details>
              </div>
              
              <div className="notification is-info is-light mt-4">
                <p>Esta información bancaria será utilizada para realizar la devolución de los fondos correspondientes.</p>
                <p className="mt-2 is-size-7">Si los datos no son correctos, por favor vuelva al paso anterior y modifique la información.</p>
              </div>
              
              <div className="has-text-centered buttons-container mt-5">
                <Button 
                  variant="secondary"
                  onClick={handleVolver}
                  className="mr-3"
                >
                  Volver
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleSiguiente}
                >
                  Continuar
                </Button>
              </div>
            </div>
          ) : (
            <div className="has-text-centered p-5">
              <p>No se encontró información de la cuenta bancaria</p>
              <Button 
                variant="primary"
                onClick={handleVolver}
                className="mt-4"
              >
                Volver al inicio
              </Button>
            </div>
          )}
        </Card>
      </div>
    </SecureLayout>
  );
};

export default DetalleMandatoPage;