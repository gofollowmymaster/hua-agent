import { defineComponent } from 'vue';
import {
  createMemoryHistory,
  createRouter,
  type RouteRecordRaw
} from 'vue-router';
import { describe, expect, it, vi } from 'vitest';
import { adminMenus, routes } from './routes';

vi.mock('@/layouts/admin-layout.vue', () => ({ default: {} }));

const EmptyRoute = defineComponent({ template: '<div />' });

function withoutLazyComponents(route: RouteRecordRaw): RouteRecordRaw {
  return {
    ...route,
    component: route.component ? EmptyRoute : undefined,
    children: route.children?.map(withoutLazyComponents)
  } as RouteRecordRaw;
}

describe('rag admin route boundary', () => {
  it('only exposes knowledge Q&A and the five business agent pages', () => {
    expect(adminMenus.map(({ name }) => name)).toEqual([
      'knowledge-qa',
      'business-agent'
    ]);
    expect(adminMenus[1]?.children.map(({ name }) => name)).toEqual([
      'agent-knowledge',
      'agent-skills',
      'agent-sessions',
      'agent-config',
      'agent-demo'
    ]);
  });

  it('redirects unknown routes to the login page', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: routes.map(withoutLazyComponents)
    });

    await router.push('/removed-module');

    expect(router.currentRoute.value.path).toBe('/login');
  });
});
