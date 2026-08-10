import { describe, expect, it } from 'vitest';
import { defineAplusAgentChatElement } from '../src/web-component';

describe('AplusAgentChatElement', () => {
  it('registers aplus-agent-chat custom element', () => {
    defineAplusAgentChatElement();
    expect(customElements.get('aplus-agent-chat')).toBeDefined();
  });
});
