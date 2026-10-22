import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { readSiteConfig } from './scripts/config.mjs';

export default defineConfig(({ mode }) => {
  const { api } = readSiteConfig({ ...loadEnv(mode, process.cwd(), ''), ...process.env });
  return {
    plugins: [react()],
    define: { 'import.meta.env.VITE_WP_API_URL': JSON.stringify(api) },
  };
});
