import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@aplus-frontend/ui', () => ({
  ApBatchAction: defineComponent({
    setup(_, { slots }) {
      return () => h('div', [slots.prefix?.(), slots.suffix?.()]);
    },
  }),
  ApTable: {
    Setting: defineComponent({
      setup() {
        return () => h('span', { class: 'setting' });
      },
    }),
  },
}));

import TableTopActionBar from '../src/components/table-top-action-bar/index.vue';

const requiredProps = {
  selectedRowKeys: [],
  clearAll: vi.fn(),
};

describe('TableTopActionBar', () => {
  it('does not render a refresh button without refreshConfig', () => {
    const wrapper = mount(TableTopActionBar, { props: requiredProps });
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('calls the explicit refresh callback', async () => {
    const refresh = vi.fn();
    const wrapper = mount(TableTopActionBar, {
      props: {
        ...requiredProps,
        refreshConfig: { refresh },
      },
    });

    await wrapper.get('button').trigger('click');
    expect(refresh).toHaveBeenCalledOnce();
  });
});
