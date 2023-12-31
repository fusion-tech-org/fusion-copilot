import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import svgr from 'vite-plugin-svgr';

const srcDir = resolve(__dirname, 'src');

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), svgr()],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    cors: true,
  },
  resolve: {
    alias: {
      src: srcDir,
      assets: `${srcDir}/assets`,
      pages: `${srcDir}/pages`,
      components: `${srcDir}/components`,
      constants: `${srcDir}/constants`,
      store: `${srcDir}/store`,
      hooks: `${srcDir}/hooks`,
      utils: `${srcDir}/utils`,
    },
  },
  // 3. to make use of `TAURI_DEBUG` and other env variables
  // https://tauri.studio/v1/api/config#buildconfig.beforedevcommand
  envPrefix: ['VITE_', 'TAURI_'],
}));
