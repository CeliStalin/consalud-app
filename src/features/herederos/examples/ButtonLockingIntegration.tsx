import React from 'react';
import { useButtonLockingContext } from '../contexts/ButtonLockingContext';
import { useGlobalButtonLocking } from '../hooks/useGlobalButtonLocking';
import { ButtonLockingProviderWrapper } from '../provider/ButtonLockingProvider';

/**
 * Ejemplo de integración del sistema de bloqueo de botones
 * Este archivo muestra cómo usar el sistema en diferentes escenarios
 */

// Ejemplo 1: Componente que abre pestañas externas
const ExternalTabExample: React.FC = () => {
  const {
    isExternalTabOpen,
    isButtonsLocked,
    lockReason,
    openExternalTab,
    closeExternalTab,
    loading,
    error
  } = useGlobalButtonLocking();

  const handleAbrirFormulario = async () => {
    try {
      await openExternalTab('https://ejemplo.com/formulario-mandatos');
      console.log('✅ Pestaña abierta, botones bloqueados automáticamente');
    } catch (err) {
      console.error('❌ Error al abrir pestaña:', err);
    }
  };

  const handleCerrarPestana = () => {
    closeExternalTab();
    console.log('✅ Pestaña cerrada, botones desbloqueados automáticamente');
  };

  return (
    <div className="box">
      <h3 className="title is-4">Ejemplo: Pestaña Externa</h3>

      <div className="field">
        <button
          className="button is-primary"
          onClick={handleAbrirFormulario}
          disabled={isButtonsLocked || loading}
        >
          {loading ? 'Abriendo...' : 'Abrir Formulario de Mandatos'}
        </button>
      </div>

      {isExternalTabOpen && (
        <div className="field">
          <button
            className="button is-warning"
            onClick={handleCerrarPestana}
          >
            Cerrar Pestaña Externa
          </button>
        </div>
      )}

      {error && (
        <div className="notification is-danger">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isButtonsLocked && (
        <div className="notification is-info">
          <strong>Estado:</strong> {lockReason}
        </div>
      )}
    </div>
  );
};

// Ejemplo 2: Bloqueo manual de botones
const ManualLockingExample: React.FC = () => {
  const {
    isLocked,
    lockReason,
    lockButtons,
    unlockButtons,
    getLockDuration
  } = useButtonLockingContext();

  const handleProcesarDatos = async () => {
    // Bloquear botones durante el procesamiento
    lockButtons('Procesando datos del formulario...');

    try {
      // Simular procesamiento
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log('✅ Datos procesados exitosamente');
    } catch (error) {
      console.error('❌ Error al procesar datos:', error);
    } finally {
      // Desbloquear botones al finalizar
      unlockButtons();
    }
  };

  const handleOperacionLarga = async () => {
    lockButtons('Operación larga en progreso...');

    try {
      // Simular operación larga
      await new Promise(resolve => setTimeout(resolve, 10000));
      console.log('✅ Operación larga completada');
    } catch (error) {
      console.error('❌ Error en operación larga:', error);
    } finally {
      unlockButtons();
    }
  };

  const duracion = getLockDuration();
  const duracionFormateada = duracion ? `${Math.floor(duracion / 1000)}s` : '';

  return (
    <div className="box">
      <h3 className="title is-4">Ejemplo: Bloqueo Manual</h3>

      <div className="field is-grouped">
        <div className="control">
          <button
            className="button is-primary"
            onClick={handleProcesarDatos}
            disabled={isLocked}
          >
            Procesar Datos (3s)
          </button>
        </div>

        <div className="control">
          <button
            className="button is-warning"
            onClick={handleOperacionLarga}
            disabled={isLocked}
          >
            Operación Larga (10s)
          </button>
        </div>
      </div>

      {isLocked && (
        <div className="notification is-info">
          <strong>Bloqueado:</strong> {lockReason}
          {duracionFormateada && (
            <span className="ml-2">({duracionFormateada})</span>
          )}
        </div>
      )}
    </div>
  );
};

// Ejemplo 3: Bloqueo condicional
const ConditionalLockingExample: React.FC = () => {
  const { lockButtons, unlockButtons, isLocked, lockReason } = useButtonLockingContext();
  const [tipoOperacion, setTipoOperacion] = React.useState<'normal' | 'critica'>('normal');

  const handleOperacion = async () => {
    if (tipoOperacion === 'critica') {
      lockButtons('Operación crítica en progreso - No cierre la ventana');
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Operación completada');
    } catch (error) {
      console.error('❌ Error en operación:', error);
    } finally {
      if (tipoOperacion === 'critica') {
        unlockButtons();
      }
    }
  };

  return (
    <div className="box">
      <h3 className="title is-4">Ejemplo: Bloqueo Condicional</h3>

      <div className="field">
        <label className="label">Tipo de Operación:</label>
        <div className="control">
          <label className="radio">
            <input
              type="radio"
              name="tipo"
              value="normal"
              checked={tipoOperacion === 'normal'}
              onChange={(e) => setTipoOperacion(e.target.value as 'normal' | 'critica')}
            />
            Normal
          </label>
          <label className="radio ml-4">
            <input
              type="radio"
              name="tipo"
              value="critica"
              checked={tipoOperacion === 'critica'}
              onChange={(e) => setTipoOperacion(e.target.value as 'normal' | 'critica')}
            />
            Crítica
          </label>
        </div>
      </div>

      <div className="field">
        <button
          className="button is-primary"
          onClick={handleOperacion}
          disabled={isLocked}
        >
          Ejecutar Operación
        </button>
      </div>

      {isLocked && (
        <div className="notification is-warning">
          <strong>Bloqueado:</strong> {lockReason}
        </div>
      )}
    </div>
  );
};

// Componente principal de ejemplo
const ButtonLockingExamples: React.FC = () => {
  return (
    <div className="container">
      <h1 className="title is-2">Sistema de Bloqueo de Botones - Ejemplos</h1>

      <div className="columns">
        <div className="column">
          <ExternalTabExample />
        </div>
      </div>

      <div className="columns">
        <div className="column">
          <ManualLockingExample />
        </div>
      </div>

      <div className="columns">
        <div className="column">
          <ConditionalLockingExample />
        </div>
      </div>
    </div>
  );
};

// Ejemplo de integración en App.tsx
export const AppWithButtonLocking: React.FC = () => {
  return (
    <ButtonLockingProviderWrapper
      showNotification={true}
      showOverlay={true}
      showTopBar={true}
    >
      <ButtonLockingExamples />
    </ButtonLockingProviderWrapper>
  );
};

export default ButtonLockingExamples;

