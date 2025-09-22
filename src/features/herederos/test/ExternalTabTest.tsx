import React from 'react';
import { useButtonLocking } from '../hooks/useButtonLocking';
import { useExternalTab } from '../hooks/useExternalTab';

/**
 * Componente de prueba para verificar la funcionalidad de pestañas externas
 * y bloqueo de botones
 */
const ExternalTabTest: React.FC = () => {
  const {
    isExternalTabOpen,
    loading,
    error,
    tabUrl,
    openExternalTab,
    closeExternalTab,
    checkTabStatus
  } = useExternalTab();

  const {
    isLocked,
    lockReason,
    lockButtons,
    unlockButtons
  } = useButtonLocking();

  const handleTestOpenTab = async () => {
    try {
      await openExternalTab('https://www.google.com');
      lockButtons('Pestaña de prueba abierta');
    } catch (err) {
      console.error('Error al abrir pestaña:', err);
    }
  };

  const handleTestCloseTab = () => {
    closeExternalTab();
    unlockButtons();
  };

  return (
    <div className="container mt-6">
      <h2 className="title is-4">Prueba de Pestañas Externas</h2>

      <div className="box">
        <h3 className="subtitle is-5">Estado de la Pestaña Externa</h3>
        <p><strong>Abierta:</strong> {isExternalTabOpen ? 'Sí' : 'No'}</p>
        <p><strong>Cargando:</strong> {loading ? 'Sí' : 'No'}</p>
        <p><strong>URL:</strong> {tabUrl || 'N/A'}</p>
        {error && <p className="has-text-danger"><strong>Error:</strong> {error}</p>}
      </div>

      <div className="box">
        <h3 className="subtitle is-5">Estado de Bloqueo de Botones</h3>
        <p><strong>Bloqueado:</strong> {isLocked ? 'Sí' : 'No'}</p>
        <p><strong>Razón:</strong> {lockReason || 'N/A'}</p>
      </div>

      <div className="buttons">
        <button
          className="button is-primary"
          onClick={handleTestOpenTab}
          disabled={loading || isExternalTabOpen}
        >
          {loading ? 'Cargando...' : 'Abrir Pestaña de Prueba'}
        </button>

        <button
          className="button is-warning"
          onClick={handleTestCloseTab}
          disabled={!isExternalTabOpen}
        >
          Cerrar Pestaña
        </button>

        <button
          className="button is-info"
          onClick={() => checkTabStatus()}
        >
          Verificar Estado
        </button>
      </div>

      <div className="box mt-4">
        <h3 className="subtitle is-5">Botones de Prueba</h3>
        <div className="buttons">
          <button
            className="button is-success"
            disabled={isLocked}
            title={isLocked ? `Bloqueado: ${lockReason}` : ''}
          >
            Botón 1 {isLocked ? '(Bloqueado)' : ''}
          </button>

          <button
            className="button is-info"
            disabled={isLocked}
            title={isLocked ? `Bloqueado: ${lockReason}` : ''}
          >
            Botón 2 {isLocked ? '(Bloqueado)' : ''}
          </button>

          <button
            className="button is-danger"
            disabled={isLocked}
            title={isLocked ? `Bloqueado: ${lockReason}` : ''}
          >
            Botón 3 {isLocked ? '(Bloqueado)' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExternalTabTest;
