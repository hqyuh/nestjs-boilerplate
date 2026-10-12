import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    fileParallelism: false,
    coverage: {
      include: ['src/**/*.service.ts', 'src/**/*.handler.ts'],
      exclude: ['**/mocks/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.join(root, 'src'),
      '@module': path.join(root, 'src/module'),
      '@common': path.join(root, 'src/common'),
      '@apis': path.join(root, 'src/apis'),
      packageJson: path.join(root, 'package.json'),
      pg: require.resolve('pg'),
    },
  },
  ssr: {
    external: ['pg', 'typeorm', 'ioredis', 'argon2'],
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
});
