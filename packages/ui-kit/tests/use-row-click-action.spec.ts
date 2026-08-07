import { defineComponent, h, nextTick, ref } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { createMemoryHistory, createRouter } from 'vue-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@aplus-frontend/ui', () => ({
  useGetDerivedNamespace: () => ref('ap'),
}));

import {
  DETAIL_ACTION_CLASS,
  useRowClickAction,
} from '../src/hooks/use-row-click-action';

afterEach(() => {
  vi.restoreAllMocks();
});

async function setup(routerName = 'detail') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      {
        path: '/detail',
        name: 'detail',
        component: { template: '<div />' },
      },
    ],
  });
  await router.push('/');
  await router.isReady();

  let action: ReturnType<typeof useRowClickAction>;
  const wrapper = mount(
    defineComponent({
      setup() {
        action = useRowClickAction(routerName);
        return () => h('div');
      },
    }),
    { global: { plugins: [router] } },
  );

  return { action: action!, router, wrapper };
}

describe('useRowClickAction', () => {
  it('navigates when a grid cell is clicked', async () => {
    const { action, router, wrapper } = await setup();
    const target = document.createElement('span');
    target.className = 'ag-cell';
    vi.spyOn(window, 'getSelection').mockReturnValue(null);

    action.onRowClick({ target } as unknown as Event, { query: { id: '1' } });
    await flushPromises();
    await nextTick();

    expect(router.currentRoute.value.name).toBe('detail');
    expect(router.currentRoute.value.query.id).toBe('1');
    wrapper.unmount();
  });

  it('hides the action when the route or permission is unavailable', async () => {
    const { action, wrapper } = await setup('missing');

    expect(action.routerHasPermission()).toBe(false);
    expect(action.clickAction().visible).toBe(false);
    expect(action.getPointerRowClassName()).toBe('');
    expect(DETAIL_ACTION_CLASS).toBe('custom-details-action-btn');
    wrapper.unmount();
  });
});
