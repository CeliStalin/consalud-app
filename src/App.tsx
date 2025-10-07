import {
  AuthProvider,
  ErrorBoundary,
  MenuCollapseProvider,
  MenuConfigProvider,
  Typography,
} from '@consalud/core';
import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes';
import './styles/anti-flash.css';
import './styles/bulma-overrides.css';
import './styles/navigation-optimizations.css';
import './styles/variables.css';

const logo = '/Logo.png';

const ErrorFallback = () => {
  if (!Typography) {
    return (
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          color: '#D8000C',
          backgroundColor: '#FFD2D2',
          border: '1px solid #D8000C',
          borderRadius: '4px',
        }}
      >
        <h2 style={{ fontSize: '1.5em', marginBottom: '10px' }}>Error Crítico</h2>
        <p>Algunos componentes esenciales no pudieron cargarse.</p>
        <p style={{ marginTop: '10px' }}>Intente recargar la página.</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px',
            fontSize: '1em',
          }}
        >
          Recargar página
        </button>
      </div>
    );
  }
  return null;
};

const App = () => {
  useEffect(() => {
    document.title = import.meta.env.VITE_NOMBRE_SISTEMA || 'Consalud App';
  }, []);

  return (
    <>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <AuthProvider>
          <MenuConfigProvider
            config={{
              enableDynamicMenu: true,
              enableBounceEffects: true,
            }}
          >
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <MenuCollapseProvider>
                <AppRoutes logo={logo} />
              </MenuCollapseProvider>
            </Router>
          </MenuConfigProvider>
        </AuthProvider>
      </ErrorBoundary>
    </>
  );
};

export default App;
