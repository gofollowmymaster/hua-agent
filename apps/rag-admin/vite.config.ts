import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3000';

  return {
    base: '/public/rag-admin/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      outDir: '../api/public/rag-admin',
      emptyOutDir: true,
    },
    server: {
      port: 5174,
      proxy: {
        '/ai': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
