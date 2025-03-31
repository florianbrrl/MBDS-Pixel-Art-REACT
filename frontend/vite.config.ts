import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets")
    },
  },
  build: {
    sourcemap: false, // Mettre à true pour debug, false en production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Supprimer les console.log en production
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'charting': ['recharts'],
          'http': ['axios'],
          'utils': ['lodash'],
          'ui-components': [
            '@/components/common/LoadingSpinner',
            '@/components/common/ErrorMessage',
            '@/components/common/ThemeToggle',
            '@/components/common/ThemeSelector'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 800, // Augmenter la limite d'avertissement
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
