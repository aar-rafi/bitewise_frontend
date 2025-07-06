/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // This tells Vitest to use jsdom environment for testing React components
    environment: 'jsdom',
    // Setup file to configure testing library
    setupFiles: ['./src/test/setup.ts'],
    // CSS modules support
    css: true,
    // Make test functions like describe, it, expect available globally
    globals: true,
  },
  resolve: {
    alias: {
      // This matches your existing alias in vite.config.ts
      '@': path.resolve(__dirname, './src'),
    },
  },
}) 