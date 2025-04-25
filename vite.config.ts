import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to avoid CORS issues
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Add specific proxies for services causing errors
      '/tracking-api': {
        target: 'https://autotrack.studyquicks.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tracking-api/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (_proxyRes, req, _res) => {
            console.log('Received Response:', req.method, req.url);
          });
        },
      },
    },
    cors: true, // Enable CORS for all requests
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add global error handler for network requests
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __DEV_MODE__: mode === 'development',
  },
}));
