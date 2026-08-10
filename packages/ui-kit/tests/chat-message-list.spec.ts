import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import ChatMessageList from '../src/chat-demo/components/chat-message-list.vue';
import type { ChatDemoMessage } from '../src/chat-demo/types';

const message = {
  id: 'assistant-1',
  role: 'assistant',
  parts: [
    {
      type: 'reasoning',
      text: '先检索知识库',
      state: 'done',
    },
    {
      type: 'data-status',
      data: { message: '检索到 2 个文档' },
    },
    {
      type: 'text',
      text: '最终答案',
      state: 'done',
    },
  ],
} as ChatDemoMessage;

function mountList(collapseProcessAfterAnswer: boolean) {
  return mount(ChatMessageList, {
    props: {
      messages: [message],
      formatStatus: (data) =>
        (data as { message?: string }).message || '状态更新',
      collapseProcessAfterAnswer,
    },
    global: {
      stubs: {
        MdPreview: {
          props: ['modelValue'],
          template: '<div class="md-preview-stub">{{ modelValue }}</div>',
        },
      },
    },
  });
}

describe('ChatMessageList process grouping', () => {
  it('groups process parts into a collapsible block when enabled', () => {
    const wrapper = mountList(true);

    expect(wrapper.find('.chat-demo-process').exists()).toBe(true);
    expect(wrapper.find('.chat-demo-process').text()).toContain('先检索知识库');
    expect(wrapper.find('.chat-demo-process').text()).toContain(
      '检索到 2 个文档',
    );
    expect(wrapper.text()).toContain('最终答案');
  });

  it('keeps legacy rendering when disabled', () => {
    const wrapper = mountList(false);

    expect(wrapper.find('.chat-demo-process').exists()).toBe(false);
    expect(wrapper.find('.chat-demo-reasoning').exists()).toBe(true);
    expect(wrapper.find('.chat-demo-status-card').exists()).toBe(true);
    expect(wrapper.text()).toContain('最终答案');
  });
});
