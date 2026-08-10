import { defineComponent, h, nextTick } from 'vue';
import { flushPromises, mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { useChatDemo } from '../src/chat-demo/use-chat-demo';
import type {
  ChatDemoAdapter,
  ChatDemoMessage,
  ChatDemoSessionItem,
} from '../src/chat-demo/types';

function buildChatMock() {
  return {
    messages: [] as ChatDemoMessage[],
    status: 'ready',
    error: null,
    sendMessage: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn().mockResolvedValue(undefined),
    clearError: vi.fn(),
  };
}

function buildAdapter() {
  const pageSessions = vi.fn().mockResolvedValue({
    list: [
      {
        id: '1',
        conversationId: 'conv-1',
        latestMessage: { role: 'assistant', content: 'answer', createdAt: '' },
        messageCount: 2,
        lastActiveAt: '2026-01-01T00:00:00.000Z',
      } satisfies ChatDemoSessionItem,
    ],
    total: 1,
    page: 1,
    pageSize: 20,
  });
  const listMessages = vi.fn().mockResolvedValue([
    {
      id: '1',
      role: 'user',
      content: 'hello',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ]);
  const createSession = vi.fn().mockImplementation(() => buildChatMock());
  const adapter: ChatDemoAdapter = {
    chatApi: '/agent/chat',
    channel: 'agent-web',
    conversationType: 'agent-chat',
    getParticipantId: () => 'user-1',
    createSession: createSession as never,
    pageSessions,
    listMessages,
    toUiMessages: (messages) =>
      messages.map((message) => ({
        id: String(message.id),
        role: message.role as 'user' | 'assistant',
        parts: [{ type: 'text' as const, text: message.content }],
      })) as ChatDemoMessage[],
    formatStatus: (data) => String(data),
  };
  return { adapter, pageSessions, listMessages };
}

describe('useChatDemo', () => {
  it('loads sessions on mount', async () => {
    const { adapter, pageSessions } = buildAdapter();
    const wrapper = mount(
      defineComponent({
        setup() {
          const demo = useChatDemo(adapter);
          return () => h('div', String(demo.sessions.value.length));
        },
      }),
    );
    await flushPromises();

    expect(pageSessions).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: 'agent-web',
        conversationType: 'agent-chat',
      }),
    );
    expect(wrapper.text()).toBe('1');
  });

  it('loads messages when selecting a session', async () => {
    const { adapter, listMessages } = buildAdapter();
    let demo!: ReturnType<typeof useChatDemo>;
    mount(
      defineComponent({
        setup() {
          demo = useChatDemo(adapter);
          return () => h('div');
        },
      }),
    );
    await flushPromises();

    await demo.selectSession({
      id: '1',
      conversationId: 'conv-1',
      messageCount: 2,
      lastActiveAt: '2026-01-01T00:00:00.000Z',
    });
    await nextTick();

    expect(listMessages).toHaveBeenCalledWith('1');
    expect(demo.selectedSessionId.value).toBe('1');
  });

  it('sends current input and refreshes sessions', async () => {
    const { adapter, pageSessions } = buildAdapter();
    let demo!: ReturnType<typeof useChatDemo>;
    mount(
      defineComponent({
        setup() {
          demo = useChatDemo(adapter);
          return () => h('div');
        },
      }),
    );
    await flushPromises();

    demo.input.value = 'hello';
    await demo.send();

    expect(adapter.createSession).toHaveBeenCalled();
    expect(pageSessions).toHaveBeenCalledTimes(2);
  });

  it('starts a new session and clears chat state', async () => {
    const { adapter } = buildAdapter();
    let demo!: ReturnType<typeof useChatDemo>;
    mount(
      defineComponent({
        setup() {
          demo = useChatDemo(adapter);
          return () => h('div');
        },
      }),
    );
    await flushPromises();

    demo.clearChat();

    expect(demo.messages.value).toEqual([]);
    await demo.startNewSession();
    expect(demo.selectedSessionId.value).toBe('');
  });
});
