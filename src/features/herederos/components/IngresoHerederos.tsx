import React, { useState } from 'react';
// import RutSearchForm from './RutSearchForm';
import * as ConsaludCore from '@consalud/core';

interface SearchResult {
  rut: string;
  nombre: string;
  fechaNacimiento: string;
}

const IngresoHerederos: React.FC = () => {
  const [searchResult] = useState<SearchResult | null>(null);

  return (
    <ConsaludCore.Layout pageTitle="Ingreso Herederos" logoSrc="/Logo.png">
      <div style={{ padding: '20px' }}>
        <div className="columns is-centered">
          <div className="column is-narrow">
            {/* <RutSearchForm onSearch={handleSearch} loading={loading} /> */}
            
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
    </ConsaludCore.Layout>
  );
};

export default IngresoHerederos;