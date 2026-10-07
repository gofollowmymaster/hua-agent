import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ConversationList } from '../src/conversation-list';

const sessions = [
  {
    id: 7,
    conversationId: 'conversation-7',
    latestMessage: {
      role: 'user',
      content: '查询库存',
      createdAt: '2026-10-07T08:00:00Z',
    },
    messageCount: 3,
    lastActiveAt: '2026-10-07T08:00:00Z',
  },
];

describe('ConversationList', () => {
  it('delegates selection, refresh, and creation', () => {
    const onSelect = vi.fn();
    const onReload = vi.fn();
    const onCreate = vi.fn();
    render(
      <ConversationList
        sessions={sessions}
        activeKey="7"
        onSelect={onSelect}
        onReload={onReload}
        onCreate={onCreate}
        formatTime={() => '10-07 16:00'}
      />,
    );

    fireEvent.click(screen.getByText('查询库存'));
    fireEvent.click(screen.getByRole('button', { name: '刷新会话' }));
    fireEvent.click(screen.getByText('新建会话'));

    expect(onSelect).toHaveBeenCalledWith(sessions[0]);
    expect(onReload).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(screen.getByText('3 条 · 10-07 16:00')).toBeVisible();
  });

  it('renders the empty state', () => {
    render(
      <ConversationList
        sessions={[]}
        onSelect={vi.fn()}
        onReload={vi.fn()}
        onCreate={vi.fn()}
        formatTime={() => '-'}
      />,
    );

    expect(screen.getByText('暂无历史会话')).toBeVisible();
    expect(screen.getByText('新建会话')).toBeVisible();
  });
});
