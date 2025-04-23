/** @format */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Alias cho thư mục 'fontend'
      // Alias cho thư mục 'electron'
      "@": path.resolve(__dirname, "./src/frontend"),
    },
  },

  // build: {
  //   outDir: 'dist/renderer',
  //   emptyOutDir: true,
  // },
});
