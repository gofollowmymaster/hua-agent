import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { UIMessage } from 'ai';
import { beforeEach, vi } from 'vitest';
import type { ChatAdapter } from '../src/types';

const chatRuntime = vi.hoisted(() => ({
  messages: [] as UIMessage[],
  setMessages: vi.fn(),
  sendMessage: vi.fn(async () => undefined),
  stop: vi.fn(async () => undefined),
  status: 'ready',
  error: undefined as Error | undefined,
  clearError: vi.fn(),
}));

vi.mock('@ai-sdk/react', () => ({
  useChat: () => chatRuntime,
}));

import { ChatWorkspace } from '../src/chat-workspace';

const session = {
  id: 9,
  conversationId: 'conversation-9',
  latestMessage: {
    role: 'user',
    content: '历史问题',
    createdAt: '2026-10-07T08:00:00Z',
  },
  messageCount: 2,
  lastActiveAt: '2026-10-07T08:00:00Z',
};

function createAdapter() {
  return {
    channel: 'web',
    conversationType: 'rag-chat',
    createTransport: vi.fn(() => ({})),
    pageSessions: vi.fn(async () => ({
      list: [session],
      total: 1,
      page: 1,
      pageSize: 20,
    })),
    listMessages: vi.fn(async () => [{ id: 1 }]),
    toUiMessages: vi.fn(() => [
      {
        id: 'history-1',
        role: 'assistant',
        parts: [{ type: 'text', text: '历史回答' }],
      },
    ]),
    formatStatus: () => '状态更新',
    formatTime: () => '10-07 16:00',
  } as unknown as ChatAdapter;
}

describe('ChatWorkspace', () => {
  beforeEach(() => {
    chatRuntime.messages = [];
    chatRuntime.status = 'ready';
    chatRuntime.error = undefined;
  });

  it('loads and selects history through the adapter', async () => {
    const adapter = createAdapter();
    render(<ChatWorkspace adapter={adapter} participantId="user-1" />);

    await screen.findByText('历史问题');
    expect(adapter.pageSessions).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      channel: 'web',
      conversationType: 'rag-chat',
      userId: 'user-1',
    });

    fireEvent.click(screen.getByText('历史问题'));
    await waitFor(() => expect(adapter.listMessages).toHaveBeenCalledWith(9));
    await waitFor(() =>
      expect(chatRuntime.setMessages).toHaveBeenCalledWith([
        expect.objectContaining({ id: 'history-1' }),
      ]),
    );
  });

  it('sends, refreshes, clears, and creates sessions', async () => {
    const adapter = createAdapter();
    render(<ChatWorkspace adapter={adapter} participantId="user-1" />);
    await screen.findByText('历史问题');

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '新的问题' },
    });
    fireEvent.keyDown(screen.getByRole('textbox'), {
      key: 'Enter',
      code: 'Enter',
    });
    await waitFor(() =>
      expect(chatRuntime.sendMessage).toHaveBeenCalledWith({
        text: '新的问题',
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: '清空当前消息' }));
    fireEvent.click(screen.getByText('新建会话'));
    await waitFor(() =>
      expect(chatRuntime.setMessages).toHaveBeenCalledWith([]),
    );
    expect(chatRuntime.clearError).toHaveBeenCalled();
    expect(adapter.pageSessions).toHaveBeenCalledTimes(2);
  });

  it('stops streaming and exposes adapter failures', async () => {
    const adapter = createAdapter();
    adapter.pageSessions = vi
      .fn()
      .mockRejectedValueOnce(new Error('会话加载失败'))
      .mockResolvedValue({
        list: [session],
        total: 1,
        page: 1,
        pageSize: 20,
      });
    chatRuntime.status = 'streaming';
    render(<ChatWorkspace adapter={adapter} participantId="user-1" />);

    expect(await screen.findByText('会话加载失败')).toBeVisible();
    expect(screen.getByText('出错')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Stop loading' }));
    await waitFor(() => expect(chatRuntime.stop).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: '刷新会话' }));
    await screen.findByText('历史问题');
    await waitFor(() =>
      expect(screen.queryByText('会话加载失败')).not.toBeInTheDocument(),
    );
  });
});
