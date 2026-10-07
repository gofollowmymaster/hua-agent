import { describe, expect, it } from 'vitest';
import { toAgentUiMessages } from './adapter';

describe('agent chat adapter', () => {
  it('preserves ordered parts exactly', () => {
    const parts = [
      { type: 'reasoning' as const, text: '分析' },
      { type: 'data-status' as const, data: { stage: 'tool_result' } },
      { type: 'text' as const, text: '答案' },
    ];
    expect(
      toAgentUiMessages([
        { id: 1, role: 'assistant', content: '答案', parts, createdAt: '' },
      ])[0].parts,
    ).toEqual(parts);
  });

  it('preserves a valid A2UI card part in the visible timeline', () => {
    const parts = [
      { type: 'data-status' as const, data: { stage: 'tool_result' } },
      { type: 'text' as const, text: '请核对订单信息并完成审核。' },
      {
        type: 'data-a2ui' as const,
        data: { surfaceId: 'order-1', commands: [] },
      },
    ];
    expect(
      toAgentUiMessages([
        {
          id: 1,
          role: 'assistant',
          content: '订单已展示',
          parts,
          createdAt: '',
        },
      ])[0].parts.map((part) => part.type),
    ).toEqual(['data-status', 'text', 'data-a2ui']);
  });

  it('falls back to tool results followed by text for legacy messages', () => {
    const result = toAgentUiMessages([
      {
        id: 1,
        role: 'assistant',
        content: '答案',
        toolCalls: [{ name: 'search', arguments: { q: 'a' }, result: 'ok' }],
        createdAt: '',
      },
    ]);
    expect(result[0].parts.map((part) => part.type)).toEqual([
      'data-status',
      'text',
    ]);
  });

  it('uses the legacy fallback when any ordered part is invalid', () => {
    const result = toAgentUiMessages([
      {
        id: 1,
        role: 'assistant',
        content: 'fallback',
        parts: [{ type: 'text', text: 1 } as never],
        createdAt: '',
      },
    ]);
    expect(result[0].parts).toEqual([{ type: 'text', text: 'fallback' }]);
  });
});
