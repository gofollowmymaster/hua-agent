import type { App } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { useUserStore } from '@/stores/modules/user';
import { routes } from './routes';

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  strict: true
});

router.beforeEach((to) => {
  const userStore = useUserStore();

  if (to.meta.public) {
    if (!userStore.isLoggedIn) return true;
    const redirect =
      typeof to.query.redirect === 'string' ? to.query.redirect : '';
    return redirect.startsWith('/') && redirect !== '/login'
      ? redirect
      : '/knowledge/documents';
  }

  if (!userStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  const title = typeof to.meta.title === 'string' ? to.meta.title : '';
  const brandTitle = `${userStore.tenantDisplayName} 管理后台`;
  document.title = title ? `${title} - ${brandTitle}` : brandTitle;
  return true;
});

export function setupRouter(app: App) {
  app.use(router);
}
