import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@border-color': '#d9d9d9',
          '@fill-bg-color': '#f5f5f5',
          '@text-primary-color': '#1f2329',
          '@text-secondary-color': '#646a73',
        },
      },
    },
  },
  test: {
    environment: 'happy-dom',
    clearMocks: true,
  },
});
