import * as ConsaludCore from '@consalud/core';
import React, { useEffect, useState } from 'react';
import { MandatoResult, mandatoSoapService } from '../../documentos/services/MandatoSoapService';
import { useStepper } from './Stepper';
import './styles/DetalleMandatoModal.css';

interface DetalleMandatoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const DetalleMandatoModal: React.FC<DetalleMandatoModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [mandatoInfo, setMandatoInfo] = useState<MandatoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { setStep } = useStepper();

  // Obtener datos del mandato cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      // Avanzar al paso 4 del stepper cuando se abre el modal
      setStep(4);

      const fetchMandatoData = async () => {
        setLoading(true);
        try {
          // Buscar en localStorage
          const rutCliente = localStorage.getItem('currentRutCliente') || '17175966';
          const mandatoId = localStorage.getItem('currentMandatoId') || '';

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
    }
  }, [isOpen, setStep]);

  // Restaurar al paso 3 cuando se cierre el modal
  useEffect(() => {
    if (!isOpen) {
      setStep(3);
    }
  }, [isOpen, setStep]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="modal-header">
          <h2 className="modal-title">Mandatos</h2>
          <button className="modal-close-button" onClick={onClose} aria-label="Cerrar modal">
            ×
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="modal-body">
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
              <ConsaludCore.Button
                variant="primary"
                onClick={onClose}
                className="mt-4"
              >
                Cerrar
              </ConsaludCore.Button>
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
            </div>
          ) : (
            <div className="has-text-centered p-5">
              <p>No se encontró información de la cuenta bancaria</p>
              <ConsaludCore.Button
                variant="primary"
                onClick={onClose}
                className="mt-4"
              >
                Cerrar
              </ConsaludCore.Button>
            </div>
          )}
        </div>

        {/* Footer del modal con botones */}
        <div className="modal-footer">
          <ConsaludCore.Button
            variant="secondary"
            onClick={onClose}
            className="mr-3"
          >
            Cancelar
          </ConsaludCore.Button>
          <ConsaludCore.Button
            variant="primary"
            onClick={onSave}
            disabled={!mandatoInfo}
          >
            Guardar
          </ConsaludCore.Button>
        </div>
      </div>
    </div>
  );
};

export { DetalleMandatoModal };
