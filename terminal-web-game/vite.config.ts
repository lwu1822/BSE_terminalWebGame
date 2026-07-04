import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Note: Vitest test config lives in vitest.config.ts to avoid a type clash
// between Vite 8 (rolldown) and the Vite version bundled inside Vitest.
export default defineConfig({
  plugins: [react()],
})
