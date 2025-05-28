import { BrowserRouter as Router } from 'react-router-dom';
import * as ConsaludCore from '@consalud/core'; 
import { AppRoutes } from './routes'; // Correcta importación nombrada
import './styles/variables.css';
import './styles/bulma-overrides.css'; 
import TitularProvider from './features/herederos/provider/TitularProvider';
import HerederoProvider from './features/herederos/provider/HerederoProvider';

// Componente para manejar errores
const ErrorFallback = () => {
  // Asumimos que ConsaludCore.Typography ahora está siempre disponible y es el componente correcto.
  // Si ConsaludCore o ConsaludCore.Typography pudieran ser undefined por otras razones, 
  // se necesitaría un chequeo más robusto aquí.
  if (!ConsaludCore || !ConsaludCore.Typography) {
    // Fallback muy simple si los componentes principales no están disponibles
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
      <ConsaludCore.Typography variant="h2" gutterBottom>¡Ups! Algo salió mal</ConsaludCore.Typography>
      <ConsaludCore.Typography variant="body1" gutterBottom>Ha ocurrido un error inesperado. Intente recargar la página.</ConsaludCore.Typography>
      <button 
        onClick={() => window.location.reload()}
        style={{
          padding: '8px 16px',
          backgroundColor: ConsaludCore.theme?.colors?.primary || '#04A59B', 
          color: ConsaludCore.theme?.textColors?.white || 'white', 
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '16px'
        }}
      >
        <ConsaludCore.Typography variant="button">Recargar página</ConsaludCore.Typography>
      </button>
    </div>
  );
};

const App = () => {
  return (
    <ConsaludCore.ErrorBoundary fallback={<ErrorFallback />}>
      <ConsaludCore.AuthProvider>
        <ConsaludCore.MenuConfigProvider config={{ enableDynamicMenu: true }}>
          <Router>
            <div className="app-layout-wrapper">
              <TitularProvider>
                <HerederoProvider>
                  <AppRoutes />
                </HerederoProvider>
              </TitularProvider>
            </div>
          </Router>
        </ConsaludCore.MenuConfigProvider>
      </ConsaludCore.AuthProvider>
    </ConsaludCore.ErrorBoundary>
  );
};

export default App;