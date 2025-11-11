import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => ({
  // Allow setting base via VITE_BASE_URL env (vite convention) else fallback to '/'
  // eslint-disable-next-line no-undef
  base: (typeof process !== 'undefined' && process.env && process.env.VITE_BASE_URL) || '/',
  plugins: [
    react(),
    {
      name: 'public-path-compat',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/public/resources/')) {
            req.url = req.url.replace(/^\/public\//, '/');
          }
          if (req.url && req.url.startsWith('/resources/')) {
            try {
              res.removeHeader && res.removeHeader('ETag');
              res.setHeader('Cache-Control', 'no-store');
            } catch {
              // ignore header errors in dev server
              void 0;
            }
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.startsWith('/public/resources/')) {
            req.url = req.url.replace(/^\/public\//, '/');
          }
          if (req.url && req.url.startsWith('/resources/')) {
            try {
              res.removeHeader && res.removeHeader('ETag');
              res.setHeader('Cache-Control', 'no-store');
            } catch {
              // ignore header errors in preview server
              void 0;
            }
          }
          next();
        });
      }
    }
  ],
}))
