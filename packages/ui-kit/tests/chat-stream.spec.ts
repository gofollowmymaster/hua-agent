import { Chat } from '@ai-sdk/vue';
import { DefaultChatTransport } from 'ai';
import { describe, expect, it, vi } from 'vitest';
import type { ChatDemoMessage } from '../src/chat-demo/types';

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
    close() {
      controller?.close();
    },
  };
}

function createChat(stream: ReturnType<typeof createControlledStream>) {
  return new Chat<ChatDemoMessage>({
    id: 'chat-1',
    transport: new DefaultChatTransport({
      api: '/agent/chat',
      fetch: stream.fetch as unknown as typeof globalThis.fetch,
    }),
  });
}

describe('Vue AI SDK stream', () => {
  it('keeps realtime reasoning in the ordered message parts', async () => {
    const stream = createControlledStream();
    const chat = createChat(stream);
    const send = chat.sendMessage({ text: '查询库存' });
    await vi.waitFor(() => expect(stream.fetch).toHaveBeenCalledTimes(1));

    stream.emit({ type: 'reasoning-start', id: 'reasoning-1' });
    stream.emit({
      type: 'reasoning-delta',
      id: 'reasoning-1',
      delta: '先检查库存',
    });

    await vi.waitFor(() =>
      expect(chat.messages.at(-1)?.parts).toEqual([
        expect.objectContaining({
          type: 'reasoning',
          text: '先检查库存',
          state: 'streaming',
        }),
      ]),
    );

    stream.emit({ type: 'reasoning-end', id: 'reasoning-1' });
    stream.emit({ type: 'text-start', id: 'text-1' });
    stream.emit({ type: 'text-delta', id: 'text-1', delta: '库存充足' });
    stream.emit({ type: 'text-end', id: 'text-1' });
    stream.finish();
    await send;

    expect(chat.messages.at(-1)?.parts).toEqual([
      expect.objectContaining({
        type: 'reasoning',
        text: '先检查库存',
        state: 'done',
      }),
      expect.objectContaining({
        type: 'text',
        text: '库存充足',
        state: 'done',
      }),
    ]);
  });

  it('maps a backend error event to chat error state', async () => {
    const stream = createControlledStream();
    const chat = createChat(stream);
    const send = chat.sendMessage({ text: '触发错误' });
    await vi.waitFor(() => expect(stream.fetch).toHaveBeenCalledTimes(1));

    stream.emit({ type: 'error', errorText: '生成失败，请稍后重试' });
    stream.close();
    await send;

    expect(chat.status).toBe('error');
    expect(chat.error?.message).toBe('生成失败，请稍后重试');
  });
});
