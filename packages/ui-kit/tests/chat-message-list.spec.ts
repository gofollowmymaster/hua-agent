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
      data: { stage: 'analyze_start', message: '开始分析问题' },
    },
    {
      type: 'data-status',
      data: {
        stage: 'tool_result',
        tool: 'search_knowledge',
        message: '检索到 1 个相关文档',
        arguments: { query: '退货流程' },
        result: JSON.stringify([{ fileName: '退货流程.md' }]),
      },
    },
    {
      type: 'data-status',
      data: { stage: 'done', message: '生成完成' },
    },
    {
      type: 'text',
      text: '最终答案',
      state: 'done',
    },
  ],
} as ChatDemoMessage;

function mountList() {
  return mount(ChatMessageList, {
    props: {
      messages: [message],
      formatStatus: (data) =>
        (data as { stage?: string; message?: string }).message ||
        (data as { stage?: string }).stage ||
        '状态更新',
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

describe('ChatMessageList', () => {
  it('renders reasoning, all data-status stages and text in original order', () => {
    const wrapper = mountList();
    const contentOrder = wrapper
      .findAll(
        '.chat-demo-reasoning-content, .chat-demo-status-card, .chat-demo-tool-output pre, .chat-demo-text',
      )
      .map((element) => element.text());

    expect(contentOrder).toEqual([
      '先检索知识库',
      '开始分析问题',
      '检索到 1 个相关文档',
      expect.stringContaining('"query"'),
      expect.stringContaining('"fileName"'),
      '生成完成',
      '最终答案',
    ]);
  });

  it('keeps tool input and output inline without folding', () => {
    const wrapper = mountList();

    expect(wrapper.find('.chat-demo-tool-output').exists()).toBe(true);
    expect(wrapper.text()).toContain('工具入参');
    expect(wrapper.text()).toContain('工具输出');
    expect(wrapper.text()).toContain('"query"');
    expect(wrapper.text()).toContain('"fileName"');
    expect(wrapper.find('.chat-demo-process').exists()).toBe(false);
    expect(wrapper.find('details').exists()).toBe(false);
  });
});
