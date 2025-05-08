import React, { useEffect } from 'react'; // Añadimos la importación de useEffect
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, ErrorBoundary, MenuConfigProvider } from '@consalud/core';
import { AppRoutes } from './routes';
import './styles/variables.css';
import './index.css';

// Componente para manejar errores
const ErrorFallback = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>¡Ups! Algo salió mal</h2>
    <p>Ha ocurrido un error inesperado. Intente recargar la página.</p>
    <button 
      onClick={() => window.location.reload()}
      style={{
        padding: '8px 16px',
        backgroundColor: '#04A59B',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginTop: '16px'
      }}
    >
      Recargar página
    </button>
  </div>
);

const App = () => {
  // Ahora useEffect está disponible
  useEffect(() => {
    const msalConfig = (window as any).MSAL_CONFIG;
    if (!msalConfig || !msalConfig.clientId || !msalConfig.authority) {
      console.error('MSAL Config no está disponible globalmente o está incompleto:', msalConfig);
    } else {
      console.log('MSAL Config disponible en App.tsx:', msalConfig);
    }
  }, []);

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      {/* Quitamos la prop config que no es aceptada */}
      <AuthProvider>
        <MenuConfigProvider config={{ enableDynamicMenu: true }}>
          <Router>
            <AppRoutes />
          </Router>
        </MenuConfigProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;