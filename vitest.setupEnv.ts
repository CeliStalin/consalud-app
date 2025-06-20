import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// Mock para fetch global
global.fetch = vi.fn() as unknown as typeof fetch;

// Mock para localStorage
const createStorageMock = () => {
  const storage: Partial<Storage> = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0
  };
  return storage as Storage;
};

// Asignar mocks a localStorage y sessionStorage
global.localStorage = createStorageMock();
global.sessionStorage = createStorageMock();

// Limpiar todos los mocks después de cada prueba
afterEach(() => {
  vi.clearAllMocks();
});

// Configuración de variables de entorno para pruebas
process.env.VITE_APP_AMBIENTE = 'test';
process.env.VITE_APP_SISTEMA = 'test-system';
process.env.VITE_APP_NOMBRE_SISTEMA = 'Test System';
process.env.VITE_APP_API_EXPLOTACION_URL = 'http://test-api.com';
process.env.VITE_APP_API_ARQUITECTURA_URL = 'http://test-arch-api.com';

vi.stubGlobal('import.meta', {
  env: {
    VITE_APP_CLIENT_ID: 'dummy-client-id',
    VITE_APP_AUTHORITY: 'dummy-authority',
    VITE_APP_REDIRECT_URI: 'http://localhost',
    // ...agregar aquí todas las app que se requiera
  }
}); 