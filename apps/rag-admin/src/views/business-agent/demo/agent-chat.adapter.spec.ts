import { describe, expect, it } from 'vitest';
import { toUiMessages } from './agent-chat.adapter';

describe('toUiMessages', () => {
  it('keeps persisted agent parts in their original order', () => {
    const [message] = toUiMessages([
      {
        id: '1',
        role: 'assistant',
        content: '第一段第二段',
        tenantCode: 'yurex',
        sessionId: '1',
        metadata: {},
        createdAt: '2026-10-02T00:00:00.000Z',
        parts: [
          { type: 'text', text: '第一段' },
          {
            type: 'data-status',
            data: { stage: 'tool_result', tool: 'calculate', result: '7' },
          },
          { type: 'reasoning', text: '整理结果' },
          { type: 'text', text: '第二段' },
        ],
      },
    ]);

    expect(message.parts).toMatchObject([
      { type: 'text', text: '第一段' },
      { type: 'data-status', data: { tool: 'calculate' } },
      { type: 'reasoning', text: '整理结果' },
      { type: 'text', text: '第二段' },
    ]);
  });

  it('uses the legacy tool-calls then text fallback without parts', () => {
    const [message] = toUiMessages([
      {
        id: '2',
        role: 'assistant',
        content: '历史答案',
        tenantCode: 'yurex',
        sessionId: '1',
        metadata: {},
        createdAt: '2026-10-02T00:00:00.000Z',
        toolCalls: [{ name: 'calculate', arguments: {}, result: '7' }],
      },
    ]);

    expect(message.parts).toMatchObject([
      { type: 'data-status', data: { stage: 'tool_result', tool: 'calculate' } },
      { type: 'text', text: '历史答案' },
    ]);
  });
});
