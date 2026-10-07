export default [
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
      {
        path: '/digital-avatar',
        redirect: '/digital-avatar/documents',
      },
      {
        path: '/digital-avatar/documents',
        component: '@/pages/digital-avatar/documents',
      },
      { path: '/documents', redirect: '/knowledge/documents' },
      { path: '/sessions', redirect: '/knowledge/sessions' },
      { path: '/assistant', redirect: '/knowledge/assistant' },
    ],
  },
  { path: '*', redirect: '/login' },
];
