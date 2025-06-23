import { BrowserRouter as Router } from 'react-router-dom';
import {
  ErrorBoundary,
  AuthProvider,
  MenuConfigProvider,
  PageTransition,
  Typography,
  theme,
  Layout,
  MenuCollapseProvider
} from '@consalud/core';
import { AppRoutes } from './routes';
import './styles/variables.css';
import './styles/bulma-overrides.css';
import './styles/navigation-optimizations.css';
import TitularProvider from './features/herederos/provider/TitularProvider';
import HerederoProvider from './features/herederos/provider/HerederoProvider';
const logo = '/Logo.png';

const ErrorFallback = () => {
  if (!Typography) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#D8000C', backgroundColor: '#FFD2D2', border: '1px solid #D8000C', borderRadius: '4px' }}>
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
            fontSize: '1em'
          }}
        >
          Recargar página
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Typography variant="h2" style={{ marginBottom: '16px' }}>¡Ups! Algo salió mal</Typography>
      <Typography variant="body" style={{ marginBottom: '16px' }}>Ha ocurrido un error inesperado. Intente recargar la página.</Typography>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '8px 16px',
          backgroundColor: theme?.colors?.primary || '#04A59B',
          color: theme?.colors?.white || 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '16px'
        }}
      >
        <Typography variant="button">Recargar página</Typography>
      </button>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <AuthProvider>
        <MenuConfigProvider config={{
          enableDynamicMenu: true,
          enableBounceEffects: true
        }}>
          <Router>
            <MenuCollapseProvider>
              <TitularProvider>
                <HerederoProvider>
                  <AppRoutes logo={logo} />
                </HerederoProvider>
              </TitularProvider>
            </MenuCollapseProvider>
          </Router>
        </MenuConfigProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;