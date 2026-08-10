import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ChatProcessBlock from '../src/chat-demo/components/chat-process-block.vue';
import type { ChatDemoMessage } from '../src/chat-demo/types';

const processParts: ChatDemoMessage['parts'] = [
  {
    type: 'reasoning',
    text: '先检索知识库',
    state: 'done',
  },
  {
    type: 'data-status',
    data: { message: '检索到 2 个文档' },
  },
] as ChatDemoMessage['parts'];

function mountBlock(open: boolean) {
  return mount(ChatProcessBlock, {
    props: {
      parts: processParts,
      formatStatus: (data) =>
        (data as { message?: string }).message || '状态更新',
      open,
    },
  });
}

describe('ChatProcessBlock', () => {
  it('renders reasoning and status content while open', () => {
    const wrapper = mountBlock(true);

    expect(wrapper.find('details').attributes('open')).toBeDefined();
    expect(wrapper.text()).toContain('先检索知识库');
    expect(wrapper.text()).toContain('检索到 2 个文档');
  });

  it('starts collapsed and expands on summary click', async () => {
    const wrapper = mountBlock(false);
    const details = wrapper.find('details');

    expect(details.attributes('open')).toBeUndefined();
    await wrapper.find('summary').trigger('click');
    expect((details.element as HTMLDetailsElement).open).toBe(true);
  });
});
