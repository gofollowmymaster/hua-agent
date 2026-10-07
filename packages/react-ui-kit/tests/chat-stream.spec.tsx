import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { DefaultChatTransport } from 'ai';
import { vi } from 'vitest';
import { ChatWorkspace } from '../src/chat-workspace';
import type { ChatAdapter } from '../src/types';

function createControlledStream() {
  const encoder = new TextEncoder();
  let controller: ReadableStreamDefaultController<Uint8Array> | undefined;
  const fetch = vi.fn(
    async () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(nextController) {
            controller = nextController;
          },
        }),
        {
          headers: {
            'content-type': 'text/event-stream',
            'x-vercel-ai-ui-message-stream': 'v1',
          },
        },
      ),
  );

  return {
    fetch,
    emit(event: Record<string, unknown>) {
      controller?.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
    },
    finish() {
      controller?.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller?.close();
    },
  };
}

function createAdapter(stream: ReturnType<typeof createControlledStream>) {
  return {
    channel: 'agent-web',
    conversationType: 'agent-chat',
    createTransport: () =>
      new DefaultChatTransport({
        api: '/agent/chat',
        fetch: stream.fetch as unknown as typeof globalThis.fetch,
      }),
    pageSessions: vi.fn(async () => ({
      list: [],
      total: 0,
      page: 1,
      pageSize: 20,
    })),
    listMessages: vi.fn(async () => []),
    toUiMessages: vi.fn(() => []),
    formatStatus: (data: unknown) =>
      (data as { message?: string }).message || '状态更新',
    formatTime: () => '-',
  } as ChatAdapter;
}

describe('ChatWorkspace AI SDK stream', () => {
  it('shows reasoning before text and keeps it after completion', async () => {
    const stream = createControlledStream();
    render(
      <ChatWorkspace adapter={createAdapter(stream)} participantId="user-1" />,
    );

    const sender = screen.getByRole('textbox');
    fireEvent.change(sender, { target: { value: '查询库存' } });
    fireEvent.keyDown(sender, { key: 'Enter', code: 'Enter' });
    await waitFor(() => expect(stream.fetch).toHaveBeenCalledTimes(1));

    await act(async () => {
      stream.emit({
        type: 'data-status',
        data: { stage: 'analyze_start', message: '开始分析问题' },
      });
      stream.emit({ type: 'reasoning-start', id: 'reasoning-1' });
      stream.emit({
        type: 'reasoning-delta',
        id: 'reasoning-1',
        delta: '先检查实时库存',
      });
    });

    const reasoning = await screen.findByText('先检查实时库存');
    expect(reasoning).toBeVisible();
    expect(screen.getByText('思考过程')).toBeVisible();
    expect(screen.queryByText('库存充足')).not.toBeInTheDocument();

    await act(async () => {
      stream.emit({ type: 'reasoning-end', id: 'reasoning-1' });
      stream.emit({
        type: 'data-status',
        data: { stage: 'tool_result', message: '库存查询完成' },
      });
      stream.emit({ type: 'text-start', id: 'text-1' });
      stream.emit({
        type: 'text-delta',
        id: 'text-1',
        delta: '库存充足',
      });
      stream.emit({ type: 'text-end', id: 'text-1' });
      stream.finish();
    });

    await screen.findByText('库存充足');
    expect(screen.getByText('先检查实时库存')).toBeVisible();
    expect(screen.getByTestId('chat-message-list')).toHaveTextContent(
      /开始分析问题.*思考过程.*先检查实时库存.*库存查询完成.*库存充足/s,
    );
  });
});
