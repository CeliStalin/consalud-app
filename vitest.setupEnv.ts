import { vi } from 'vitest';

vi.stubGlobal('import.meta', {
  env: {
    VITE_APP_CLIENT_ID: 'dummy-client-id',
    VITE_APP_AUTHORITY: 'dummy-authority',
    VITE_APP_REDIRECT_URI: 'http://localhost',
    // ...agrega aquí todas las app que se requiera
  }
}); 