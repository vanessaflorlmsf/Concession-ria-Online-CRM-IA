
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Concession-ria-Online-CRM-IA/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
