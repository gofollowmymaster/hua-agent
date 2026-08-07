import type { App } from 'vue';
import { createPinia } from 'pinia';

export const pinia = createPinia();

export function setupStore(app: App) {
  app.use(pinia);
}
