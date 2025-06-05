import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [
      './vitest.setupEnv.ts',
      './src/setupTests.ts',
    ],
    deps: {
      inline: ['@consalud/core'],
    },
  },
}); 