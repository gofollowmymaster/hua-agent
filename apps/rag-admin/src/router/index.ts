import type { App } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import { useUserStore } from '@/stores/modules/user';
import { routes } from './routes';

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
  strict: true,
});

router.beforeEach(async (to) => {
  const userStore = useUserStore();

  try {
    await userStore.ensureLogin();
  } catch (err) {
    userStore.setLoginError(err instanceof Error ? err.message : String(err));
    return false;
  }

  const title = typeof to.meta.title === 'string' ? to.meta.title : '';
  document.title = title ? `${title} - RAG 管理后台` : 'RAG 管理后台';
  return true;
});

export function setupRouter(app: App) {
  app.use(router);
}
