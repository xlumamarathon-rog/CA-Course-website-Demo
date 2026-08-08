import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
  resolve: { alias: { '@': path.resolve('.') } },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.jsx'],
    restoreMocks: true
  }
});
