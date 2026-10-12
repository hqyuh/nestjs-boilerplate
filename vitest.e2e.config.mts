import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));
const distSrc = path.join(root, 'dist/src');

export default defineConfig({
  plugins: [],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['test/**/*.e2e-spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
    pool: 'forks',
  },
  resolve: {
    alias: {
      '@': distSrc,
      '@module': path.join(distSrc, 'module'),
      '@common': path.join(distSrc, 'common'),
      '@apis': path.join(distSrc, 'apis'),
      packageJson: path.join(root, 'package.json'),
    },
  },
});
