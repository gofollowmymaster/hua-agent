import { describe, expect, it } from 'vitest';
import { resolveChatStatusTone } from './chat-status';

describe('resolveChatStatusTone', () => {
  it.each([
    ['analyze_start', 'neutral'],
    ['tool_call', 'warning'],
    ['tool_result', 'success'],
    ['generate_start', 'info'],
    ['done', 'success'],
    ['error', 'error'],
    ['tool_error', 'error'],
  ])('maps %s to %s', (stage, tone) => {
    expect(resolveChatStatusTone(stage)).toBe(tone);
  });

  it('falls back to the neutral tone for unknown events', () => {
    expect(resolveChatStatusTone('future_stage')).toBe('neutral');
    expect(resolveChatStatusTone(undefined)).toBe('neutral');
  });
});
