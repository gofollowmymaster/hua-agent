import { defineConfig } from '@umijs/max';
import routes from './config/routes';

const apiTarget =
  process.env.UMI_APP_API_PROXY_TARGET || 'http://localhost:3000';
const apiBaseUrl =
  process.env.UMI_APP_API_BASE_URL ||
  (process.env.NODE_ENV === 'development' ? '/api' : '');
const apiProxyPath = apiBaseUrl || '/api';

export default defineConfig({
  antd: {},
  model: {},
  title: process.env.UMI_APP_TITLE || 'RAG React 管理后台',
  history: { type: 'hash' },
  hash: true,
  esbuildMinifyIIFE: true,
  npmClient: 'pnpm',
  mfsu: {
    exclude: ['@aplus-sql/react-ui-kit'],
  },
  publicPath: '/public/react-admin/',
  outputPath: '../api/public/react-admin',
  define: {
    'process.env.UMI_APP_API_BASE_URL': apiBaseUrl,
  },
  routes,
  proxy: {
    [apiProxyPath]: {
      target: apiTarget,
      changeOrigin: true,
      ...(apiProxyPath === '/api' ? { pathRewrite: { '^/api': '' } } : {}),
    },
  },
});
