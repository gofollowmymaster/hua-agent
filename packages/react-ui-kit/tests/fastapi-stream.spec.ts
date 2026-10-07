import { DefaultChatTransport } from 'ai';
import { describe, expect, it } from 'vitest';

function createFastApiResponse(
  events: Record<string, unknown>[],
  options: { done?: boolean } = {},
) {
  const data = events
    .map((event) => `data: ${JSON.stringify(event)}\n\n`)
    .join('');
  return new Response(
    options.done === false ? data : `${data}data: [DONE]\n\n`,
    {
      headers: {
        'cache-control': 'no-cache, no-transform',
        'content-type': 'text/event-stream',
        'x-vercel-ai-ui-message-stream': 'v1',
      },
    },
  );
}

async function readFastApiChunks(response: Response) {
  const transport = new DefaultChatTransport({
    api: '/agent/chat',
    fetch: async () => response,
  });
  const stream = await transport.sendMessages({
    trigger: 'submit-message',
    chatId: 'chat-1',
    messageId: undefined,
    messages: [],
    abortSignal: undefined,
  });
  const chunks = [];
  const reader = stream.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return chunks;
}

describe('FastAPI AI SDK 7 stream compatibility', () => {
  it('consumes ordered reasoning and text events with the normal terminator', async () => {
    const chunks = await readFastApiChunks(
      createFastApiResponse([
        { type: 'reasoning-start', id: 'reasoning-1' },
        {
          type: 'reasoning-delta',
          id: 'reasoning-1',
          delta: '先检索知识库',
        },
        { type: 'reasoning-end', id: 'reasoning-1' },
        { type: 'text-start', id: 'text-1' },
        { type: 'text-delta', id: 'text-1', delta: '最终答案' },
        { type: 'text-end', id: 'text-1' },
      ]),
    );

    expect(chunks.map((chunk) => chunk.type)).toEqual([
      'reasoning-start',
      'reasoning-delta',
      'reasoning-end',
      'text-start',
      'text-delta',
      'text-end',
    ]);
  });

  it('consumes the FastAPI error event without requiring a done marker', async () => {
    const chunks = await readFastApiChunks(
      createFastApiResponse(
        [{ type: 'error', errorText: '生成失败，请稍后重试' }],
        { done: false },
      ),
    );

    expect(chunks).toEqual([
      { type: 'error', errorText: '生成失败，请稍后重试' },
    ]);
  });
});
