import { defineConfig } from '@umijs/max';

const apiTarget =
  process.env.UMI_APP_API_PROXY_TARGET || 'http://localhost:3000';
const apiBaseUrl =
  process.env.UMI_APP_API_BASE_URL ||
  (process.env.NODE_ENV === 'development' ? '/api' : '');

export default defineConfig({
  antd: {},
  model: {},
  title: process.env.UMI_APP_TITLE || 'RAG React 管理后台',
  history: { type: 'hash' },
  hash: true,
  esbuildMinifyIIFE: true,
  npmClient: 'pnpm',
  publicPath: '/public/react-admin/',
  outputPath: '../api/public/react-admin',
  define: {
    'process.env.UMI_APP_API_BASE_URL': apiBaseUrl,
  },
  routes: [
    { path: '/login', component: '@/pages/login' },
    {
      path: '/',
      component: '@/layouts/admin-layout',
      wrappers: ['@/wrappers/auth'],
      routes: [
        { path: '/', redirect: '/knowledge/documents' },
        { path: '/knowledge', redirect: '/knowledge/documents' },
        {
          path: '/knowledge/documents',
          component: '@/pages/knowledge/documents',
        },
        {
          path: '/knowledge/sessions',
          component: '@/pages/knowledge/sessions',
        },
        {
          path: '/knowledge/assistant',
          component: '@/pages/knowledge/assistant',
        },
        {
          path: '/business-agent',
          redirect: '/business-agent/knowledge',
        },
        {
          path: '/business-agent/knowledge',
          component: '@/pages/business-agent/knowledge',
        },
        {
          path: '/business-agent/skills',
          component: '@/pages/business-agent/skills',
        },
        {
          path: '/business-agent/sessions',
          component: '@/pages/business-agent/sessions',
        },
        {
          path: '/business-agent/config',
          component: '@/pages/business-agent/config',
        },
        {
          path: '/business-agent/demo',
          component: '@/pages/business-agent/demo',
        },
        { path: '/documents', redirect: '/knowledge/documents' },
        { path: '/sessions', redirect: '/knowledge/sessions' },
        { path: '/assistant', redirect: '/knowledge/assistant' },
      ],
    },
    { path: '*', redirect: '/login' },
  ],
  proxy: {
    '/api': {
      target: apiTarget,
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
});
