import { defineConfig } from 'vitest/config'

// The engine and level tests are pure TypeScript (no DOM), so no Vite
// plugins are needed here. Keeping this separate from vite.config.ts avoids
// a type conflict between Vite 8 (rolldown) and Vitest's bundled Vite.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
