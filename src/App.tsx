import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, ErrorBoundary, MenuConfigProvider ,} from '@consalud/core';
import { AppRoutes } from './routes';
import './styles/variables.css'; // Si existe
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
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
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