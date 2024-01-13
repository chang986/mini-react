/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        default: resolve(__dirname, 'index.html'),
        v01: resolve(__dirname, 'example/day01/index.html'),
      },
      outDir: 'dist',
    },
  },
  publicDir: 'public',
})
