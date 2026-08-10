import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'AplusAgentChat',
      formats: ['es', 'umd'],
      fileName: (format) =>
        format === 'es' ? 'aplus-agent-chat.js' : 'aplus-agent-chat.umd.cjs',
    },
    rollupOptions: {
      output: {
        assetFileNames: 'aplus-agent-chat.[ext]',
      },
    },
  },
});
