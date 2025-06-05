import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de @consalud/core para evitar errores de import.meta.env en tests
vi.mock('@consalud/core', () => ({
  AuthProvider: ({ children }: any) => children,
  ErrorBoundary: ({ children }: any) => children,
  MenuConfigProvider: ({ children }: any) => children,
  PageTransition: ({ children }: any) => children,
  useAuth: () => ({
    isSignedIn: true,
    isInitializing: false,
    loading: false,
    user: { name: 'Test User' },
  }),
  PublicRoute: ({ children }: any) => children,
  ProtectedRoute: ({ children }: any) => children,
  Login: () => null,
  HomePage: () => null,
  Unauthorized: () => null,
  NotFound: () => null,
  // Agrega aquí otros mocks según @consalud/core
}));

// Mock global para import.meta.env
Object.defineProperty(globalThis, 'import.meta', {
  value: {
    env: {
      VITE_APP_CLIENT_ID: 'dummy-client-id',
      VITE_APP_AUTHORITY: 'dummy-authority',
      VITE_APP_REDIRECT_URI: 'http://localhost',
      // ...agrega aquí todas app que se requiera
    }
  }
}); 