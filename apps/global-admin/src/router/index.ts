import type { App } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { useUserStore } from '@/stores/modules/user';
import { prepareGlobalAdminRoute } from './route-auth';
import { routes } from './routes';

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  strict: true
});

router.beforeEach(async (to) => {
  const userStore = useUserStore();
  const allowed = await prepareGlobalAdminRoute(userStore);
  if (!allowed) return false;

  const title = typeof to.meta.title === 'string' ? to.meta.title : '';
  document.title = title
    ? `${title} - Global Admin 总控台`
    : 'Global Admin 总控台';
  return true;
});

export function setupRouter(app: App) {
  app.use(router);
}
