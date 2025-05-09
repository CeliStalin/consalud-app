import React, { useState } from 'react';
import RutSearchForm from './RutSearchForm';
import SecureLayout from '../../../core/components/SecureLayout/SecureLayout';

const IngresoHerederos: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  const handleSearch = async (rut: string) => {
    setLoading(true);
    try {

      await new Promise(resolve => setTimeout(resolve, 1500));

      setSearchResult({
        rut,
        nombre: 'Juan Pérez',
        fechaNacimiento: '01/01/1980',
      });
    } catch (error) {
      console.error('Error en la búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SecureLayout pageTitle="Ingreso Herederos">
      <div style={{ padding: '20px' }}>
        <div className="columns is-centered">
          <div className="column is-narrow">
            <RutSearchForm onSearch={handleSearch} loading={loading} />
            
            {searchResult && (
              <div className="box mt-5" style={{ width: '367px', margin: '20px auto' }}>
                <h3 className="title is-5">Resultados de la búsqueda</h3>
                <div className="content">
                  <p><strong>RUT:</strong> {searchResult.rut}</p>
                  <p><strong>Nombre:</strong> {searchResult.nombre}</p>
                  <p><strong>Fecha de Nacimiento:</strong> {searchResult.fechaNacimiento}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </SecureLayout>
  );
};

export default IngresoHerederos;