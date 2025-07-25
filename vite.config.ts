import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Only proxy in development - production nginx handles this
    ...(mode === 'development' && {
      proxy: {
        '/api': {
          target: 'https://bitewise.twiggle.tech',
          // target: 'http://localhost:8000',
          // target: 'http://4.240.113.91:8000',
          changeOrigin: true,
          secure: true,
          // secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        }
      }
    })
  },
  plugins: [
    react(),
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      'recharts',
      'date-fns',
      'clsx',
      'tailwind-merge'
    ],
    force: mode === 'development', // Force re-optimization in development
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunk for React and related libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separate chunk for UI components
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select'],
          // Separate chunk for utility libraries
          'utils-vendor': ['clsx', 'tailwind-merge', 'date-fns'],
          // Separate chunk for data fetching
          'query-vendor': ['@tanstack/react-query'],
          // Separate chunk for charts/animations
          'visual-vendor': ['recharts', 'framer-motion'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000kb
  },
}));
