import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/src/**/*.js'],
    threads: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.js'],
      exclude: ['test/**', 'node_modules/**', 'coverage/**', 'cjs/**', '@types/**']
    }
  }
});
