import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
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
      /思考过程.*先查库存.*库存查询完成.*工具调用详情.*库存充足/s,
    );
    expect(screen.queryByText('工具入参')).not.toBeInTheDocument();
    expect(screen.queryByText('工具输出')).not.toBeInTheDocument();
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

  it('expands and collapses tool arguments and output together', async () => {
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
      />,
    );

    const toggle = screen.getByRole('button', { name: '工具调用详情' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(screen.getByText('工具入参')).toBeVisible());
    expect(screen.getByText('工具输出')).toBeVisible();
    expect(screen.getByText(/"sku": "A-1"/)).toBeVisible();
    expect(screen.getByText(/"stock": 12/)).toBeVisible();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() =>
      expect(screen.queryByText('工具入参')).not.toBeInTheDocument(),
    );
    expect(screen.queryByText('工具输出')).not.toBeInTheDocument();
  });

  it('renders only available tool details and omits empty cards', async () => {
    const partialMessages = [
      {
        id: 'assistant-partial',
        role: 'assistant',
        parts: [
          {
            type: 'data-status',
            data: {
              stage: 'tool_result',
              message: '仅有入参',
              arguments: { sku: 'B-2' },
            },
          },
          {
            type: 'data-status',
            data: {
              stage: 'tool_result',
              message: '仅有输出',
              result: 'completed',
            },
          },
          {
            type: 'data-status',
            data: { stage: 'tool_result', message: '没有详情' },
          },
        ],
      },
    ] as UIMessage[];

    render(
      <ChatBox
        messages={partialMessages}
        adapter={adapter}
        value=""
        statusText="就绪"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        onStop={vi.fn()}
        onClear={vi.fn()}
        onClearError={vi.fn()}
      />,
    );

    const toggles = screen.getAllByRole('button', {
      name: '工具调用详情',
    });
    expect(toggles).toHaveLength(2);

    fireEvent.click(toggles[0]);
    await waitFor(() => expect(screen.getByText('工具入参')).toBeVisible());
    expect(screen.queryByText('工具输出')).not.toBeInTheDocument();

    fireEvent.click(toggles[1]);
    await waitFor(() => expect(screen.getByText('工具输出')).toBeVisible());
    expect(screen.getByText('completed')).toBeVisible();
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
