// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
const proxy = { '/api': { target: 'http://127.0.0.1:3001', changeOrigin: true } };
export default defineConfig({
 devToolbar: { enabled: false },
 integrations: [react()],
 server: { port: 4321, host: '127.0.0.1' },
 vite: { server: { strictPort: true, proxy }, preview: { proxy } }
});
