import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core';
import { useFormHerederoData } from '../hooks/useFormHerederoData';
import { useTitular } from '../contexts/TitularContext';
import { Stepper } from './Stepper';
import { useStepper } from './Stepper';
import './styles/ConfirmacionFinal.css';

interface ConfirmacionFinalProps {
  onSubmitSuccess?: () => void;
}

const ConfirmacionFinal: React.FC<ConfirmacionFinalProps> = ({ onSubmitSuccess }) => {
  const navigate = useNavigate();
  const { step, setStep } = useStepper();
  const { formData, error, isDirty, handleClearForm } = useFormHerederoData();
  const { titular } = useTitular();
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Configurar el paso actual
  React.useEffect(() => {
    setStep(4);
  }, [setStep]);

  const handleSubmit = useCallback(async () => {
    if (!formData) {
      setSubmitError('No hay datos del formulario para enviar');
      return;
    }

    if (!titular) {
      setSubmitError('No hay datos del titular');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Aquí iría la llamada al endpoint BFF
      // const response = await saveHerederoData({
      //   titularId: titular.id,
      //   herederoData: formData
      // });

      // Simular llamada al endpoint
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Limpiar datos del formulario después del éxito
      handleClearForm();
      
      // Llamar callback de éxito si existe
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Navegar a la página de éxito
      navigate('/mnherederos/ingresoher/success');
    } catch (err) {
      setSubmitError('Error al guardar los datos. Por favor, inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }, [formData, titular, handleClearForm, onSubmitSuccess, navigate]);

  const handleBack = useCallback(() => {
    navigate('/mnherederos/ingresoher/cargadoc');
  }, [navigate]);

  const renderDataSection = (title: string, data: Record<string, any>) => (
    <div className="data-section">
      <h4 style={{ marginBottom: '12px', color: '#505050' }}>{title}</h4>
      <div className="data-grid">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="data-item">
            <span className="data-label">{key}:</span>
            <span className="data-value">{value || 'No especificado'}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="route-container layout-stable" style={{ overflowY: 'auto', height: '100vh', paddingBottom: 40 }}>
      {/* Header Section */}
      <div style={{ width: '100%', marginBottom: 24 }}>
        <div style={{ marginLeft: 48 }}>
          {/* Botón volver */}
          <div>
            <button
              className="back-button"
              onClick={handleBack}
              aria-label="Volver a la página anterior"
            >
              <span className="back-button-icon">←</span> Volver
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div style={{ width: '100%' }}>
        {/* Title */}
        <div className="textoTituloComponentes mb-4">
          <span className="titleComponent">
            Confirmación final
          </span>
        </div>
        
        {/* Stepper */}
        <div className="mb-5">
          <Stepper step={step} />
        </div>
        
        {/* Card */}
        <ConsaludCore.Card
          title={undefined}
          subtitle={undefined}
          variant="elevated"
          padding="large"
          className="card-elevated ingreso-card animate-fade-in-up"
        >
          <div className="textoTituloComponentes">
            <ConsaludCore.Typography
              variant="h5"
              weight="bold"
              style={{ marginBottom: '20px' }}
            >
              Revisa los datos antes de confirmar
            </ConsaludCore.Typography>
          </div>

          {error && (
            <div className="notification is-danger">
              <p>{error}</p>
            </div>
          )}

          {submitError && (
            <div className="notification is-danger">
              <p>{submitError}</p>
            </div>
          )}

          {formData ? (
            <div className="confirmation-content">
              {/* Datos del titular */}
              {titular && (
                <div className="section-container">
                  <h3 style={{ marginBottom: '16px', color: '#04A59B' }}>Datos del titular</h3>
                  {renderDataSection('Información personal', {
                    'Nombre completo': `${titular.nombre} ${titular.apellidoPat} ${titular.apellidoMat}`,
                    'RUT': titular.rut
                  })}
                </div>
              )}

              {/* Datos del heredero */}
              <div className="section-container">
                <h3 style={{ marginBottom: '16px', color: '#04A59B' }}>Datos del heredero</h3>
                {renderDataSection('Información personal', {
                  'Nombres': formData.nombres,
                  'Apellido paterno': formData.apellidoPaterno,
                  'Apellido materno': formData.apellidoMaterno,
                  'Fecha de nacimiento': formData.fechaNacimiento ? formData.fechaNacimiento.toLocaleDateString('es-CL') : 'No especificada',
                  'Sexo': formData.sexo,
                  'Parentesco': formData.parentesco
                })}
                
                {renderDataSection('Información de contacto', {
                  'Teléfono': formData.telefono,
                  'Correo electrónico': formData.correoElectronico
                })}
                
                {renderDataSection('Dirección', {
                  'Región': formData.region,
                  'Ciudad': formData.ciudad,
                  'Comuna': formData.comuna,
                  'Calle': formData.calle,
                  'Número': formData.numero,
                  'Depto/Bloque': formData.deptoBloqueOpcional,
                  'Villa': formData.villaOpcional
                })}
              </div>

              {/* Botones de acción */}
              <div className="action-buttons" style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <ConsaludCore.Button
                  variant="secondary"
                  onClick={handleBack}
                  disabled={submitting}
                  style={{ minWidth: '120px' }}
                >
                  Volver
                </ConsaludCore.Button>
                
                <ConsaludCore.Button
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={submitting || !isDirty}
                  loading={submitting}
                  style={{ 
                    minWidth: '120px',
                    backgroundColor: '#04A59B',
                    color: 'white'
                  }}
                >
                  {submitting ? 'Guardando...' : 'Confirmar y guardar'}
                </ConsaludCore.Button>
              </div>
            </div>
          ) : (
            <div className="notification is-warning">
              <p>No hay datos del formulario para mostrar. Por favor, completa el formulario en el paso anterior.</p>
            </div>
          )}
        </ConsaludCore.Card>
      </div>
    </div>
  );
};

export { ConfirmacionFinal }; 