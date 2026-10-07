import { fireEvent, render, screen, within } from '@testing-library/react';
import type { UIMessage } from 'ai';
import { vi } from 'vitest';
import { ChatBox } from '../src/chat-box';
import type { ChatAdapter } from '../src/types';

const adapter = {
  channel: 'agent-web',
  conversationType: 'agent-chat',
  createTransport: vi.fn(),
  pageSessions: vi.fn(),
  listMessages: vi.fn(),
  toUiMessages: vi.fn(),
  formatStatus: (data: unknown) =>
    (data as { message?: string }).message || '状态更新',
  formatTime: () => '-',
  resolvePreview: (href: string, label: string) =>
    href === '/document/1'
      ? { id: '1', fileName: label, fileType: 'pdf' }
      : null,
} as unknown as ChatAdapter;

const messages = [
  {
    id: 'assistant-1',
    role: 'assistant',
    parts: [
      { type: 'reasoning', text: '先查库存' },
      {
        type: 'data-status',
        data: {
          stage: 'tool_result',
          message: '库存查询完成',
          arguments: { sku: 'A-1' },
          result: '{"stock":12}',
        },
      },
      {
        type: 'text',
        text: '库存充足，[查看文档](/document/1)。',
      },
    ],
  },
] as UIMessage[];

describe('ChatBox', () => {
  it('keeps visible message parts in their original order', () => {
    const onPreview = vi.fn();
    render(
      <ChatBox
        messages={messages}
        adapter={adapter}
        value=""
        statusText="就绪"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onStop={vi.fn()}
        onClear={vi.fn()}
        onClearError={vi.fn()}
        onPreview={onPreview}
      />,
    );

    const list = screen.getByTestId('chat-message-list');
    expect(
      list.querySelector('.react-ui-kit-bubble-scroll'),
    ).toBeInTheDocument();
    expect(list).toHaveTextContent(
      /思考过程.*先查库存.*库存查询完成.*工具入参.*A-1.*工具输出.*12.*库存充足/s,
    );
    expect(
      within(list).getByText('库存查询完成').closest('[data-stage]'),
    ).toHaveAttribute('data-stage', 'tool_result');

    fireEvent.click(screen.getByRole('link', { name: '查看文档' }));
    expect(onPreview).toHaveBeenCalledWith({
      id: '1',
      fileName: '查看文档',
      fileType: 'pdf',
    });
  });

  it('delegates sender, stop, clear, and error actions', () => {
    const onChange = vi.fn();
    const onStop = vi.fn();
    const onClear = vi.fn();
    const onClearError = vi.fn();
    render(
      <ChatBox
        messages={[]}
        adapter={adapter}
        value="待发送"
        busy
        error={new Error('请求失败')}
        statusText="生成中"
        onChange={onChange}
        onSubmit={vi.fn()}
        onStop={onStop}
        onClear={onClear}
        onClearError={onClearError}
      />,
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '新问题' },
    });
    fireEvent.click(screen.getByRole('button', { name: '清空当前消息' }));
    fireEvent.click(screen.getByRole('button', { name: 'Stop loading' }));
    fireEvent.click(screen.getByRole('button', { name: 'close' }));

    expect(onChange).toHaveBeenCalledWith('新问题');
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onStop).toHaveBeenCalledTimes(1);
    expect(onClearError).toHaveBeenCalledTimes(1);
  });
});
