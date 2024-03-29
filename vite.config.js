/* eslint-disable no-undef */
import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        default: resolve(__dirname, 'index.html'),
        v01: resolve(__dirname, 'example/day01/index.html'),
        v02: resolve(__dirname, 'example/day02/index.html'),
        v03: resolve(__dirname, 'example/day03/index.html'),
      },
      outDir: 'dist',
    },
  },
  publicDir: 'public',
})
