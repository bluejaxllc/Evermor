import { defineConfig } from 'vite';

export default defineConfig({
  base: '/app/',
  server: {
    port: 5175,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
