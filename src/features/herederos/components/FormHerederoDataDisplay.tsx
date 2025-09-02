import React, { useEffect, useState } from 'react';
import { useFormHerederoStorage } from '../hooks/useFormHerederoStorage';
import { FormHerederoData } from '../interfaces/FormData';

interface FormHerederoDataDisplayProps {
  rut: string;
  showDebugInfo?: boolean;
}

/**
 * Componente para mostrar la nueva estructura del session storage
 * Útil para debugging y verificación de datos
 */
export const FormHerederoDataDisplay: React.FC<FormHerederoDataDisplayProps> = ({
  rut,
  showDebugInfo = false
}) => {
  const { getFormHerederoData, migrateToNewStructure } = useFormHerederoStorage(rut);
  const [formHerederoData, setFormHerederoData] = useState<FormHerederoData | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    const data = getFormHerederoData();
    setFormHerederoData(data);
  }, [getFormHerederoData]);

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const success = await migrateToNewStructure();
      if (success) {
        const data = getFormHerederoData();
        setFormHerederoData(data);
      }
    } finally {
      setIsMigrating(false);
    }
  };

  if (!showDebugInfo) {
    return null;
  }

  return (
    <div className="notification is-info is-light" style={{ margin: '1rem 0' }}>
      <h4 className="title is-6">Session Storage - Nueva Estructura</h4>

      {formHerederoData ? (
        <div>
          <p><strong>RUT:</strong> {formHerederoData.RutCompleto}</p>
          <p><strong>Nombre:</strong> {formHerederoData.NombrePersona}</p>
          <p><strong>Apellidos:</strong> {formHerederoData.ApellidoPaterno} {formHerederoData.ApellidoMaterno}</p>
          <p><strong>Sexo:</strong> {formHerederoData.CodigoSexo}</p>
          <p><strong>Fecha Nacimiento:</strong> {formHerederoData.FechaNacimiento}</p>
          <p><strong>Parentesco:</strong> {formHerederoData.IdParentesco}</p>
          <p><strong>Teléfono:</strong> {formHerederoData.NumTelef}</p>
          <p><strong>Email:</strong> {formHerederoData.Mail}</p>
          <p><strong>Región:</strong> {formHerederoData.DesRegion} (ID: {formHerederoData.IdRegion})</p>
          <p><strong>Ciudad:</strong> {formHerederoData.DesCiudad} (ID: {formHerederoData.IdCiudad})</p>
          <p><strong>Comuna:</strong> {formHerederoData.DesComuna} (ID: {formHerederoData.IdComuna})</p>
          <p><strong>Dirección:</strong> {formHerederoData.Calle} {formHerederoData.NumCalle}</p>
          <p><strong>Villa:</strong> {formHerederoData.villa}</p>
          <p><strong>Depto/Block:</strong> {formHerederoData.DepBlock}</p>
          <p><strong>Usuario:</strong> {formHerederoData.Usuario}</p>
          <p><strong>Estado:</strong> {formHerederoData.EstadoRegistro}</p>

          <details style={{ marginTop: '1rem' }}>
            <summary>JSON Completo</summary>
            <pre style={{
              background: '#f5f5f5',
              padding: '1rem',
              overflow: 'auto',
              fontSize: '0.8rem'
            }}>
              {JSON.stringify(formHerederoData, null, 2)}
            </pre>
          </details>
        </div>
      ) : (
        <div>
          <p>No hay datos en el session storage para el RUT: {rut}</p>
          <button
            className="button is-small is-primary"
            onClick={handleMigrate}
            disabled={isMigrating}
          >
            {isMigrating ? 'Migrando...' : 'Migrar a Nueva Estructura'}
          </button>
        </div>
      )}
    </div>
  );
};
