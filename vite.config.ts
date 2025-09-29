import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Make sure environment variables are available at build time
    'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(process.env.VITE_GOOGLE_CLIENT_ID),
    'import.meta.env.VITE_GOOGLE_CLIENT_SECRET': JSON.stringify(process.env.VITE_GOOGLE_CLIENT_SECRET),
    'import.meta.env.VITE_APP_URL': JSON.stringify(process.env.VITE_APP_URL),
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://your-supabase-project.supabase.co/functions/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
