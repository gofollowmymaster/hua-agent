import { createUIMessageStream } from 'ai';
import { AgentChatService } from './agent-chat.service';

jest.mock('ai', () => ({
  createUIMessageStream: jest.fn(),
}));

describe('AgentChatService', () => {
  let logger: { setContext: jest.Mock; warn: jest.Mock };
  let memoryService: {
    resolveSession: jest.Mock;
    loadRecentMessages: jest.Mock;
    appendUserMessage: jest.Mock;
    appendAssistantMessage: jest.Mock;
  };
  let agentService: { stream: jest.Mock };
  let service: AgentChatService;
  let executeHandler: (params: { writer: unknown }) => Promise<void>;

  beforeEach(() => {
    jest.clearAllMocks();
    logger = { setContext: jest.fn(), warn: jest.fn() };
    memoryService = {
      resolveSession: jest.fn().mockReturnValue({
        channel: 'agent-web',
        tenantCode: 'yurex',
        sessionKey: 'session',
        conversationId: 'conversation',
      }),
      loadRecentMessages: jest.fn().mockResolvedValue([]),
      appendUserMessage: jest.fn().mockResolvedValue(undefined),
      appendAssistantMessage: jest.fn().mockResolvedValue(undefined),
    };
    agentService = {
      stream: jest.fn().mockImplementation(async function* () {
        yield { type: 'text_delta', delta: '结果' };
        yield { type: 'text_delta', delta: '是 7' };
        yield {
          type: 'done',
          answer: '结果是 7',
          toolCalls: [
            {
              name: 'calculate',
              arguments: { expression: '1+2*3' },
              result: '7',
            },
          ],
        };
      }),
    };
    service = new AgentChatService(
      logger as any,
      memoryService as any,
      agentService as any,
    );

    (createUIMessageStream as jest.Mock).mockImplementation(
      ({
        execute,
      }: {
        execute: (params: { writer: unknown }) => Promise<void>;
      }) => {
        executeHandler = execute;
        return {};
      },
    );
  });

  it('streams agent events and persists messages', async () => {
    agentService.stream.mockImplementation(async function* () {
      yield {
        type: 'tool_start',
        name: 'calculate',
        arguments: { expression: '1+2*3' },
      };
      yield {
        type: 'tool_end',
        name: 'calculate',
        arguments: { expression: '1+2*3' },
        result: '7',
      };
      yield { type: 'text_delta', delta: '结果' };
      yield { type: 'text_delta', delta: '是 7' };
      yield {
        type: 'done',
        answer: '结果是 7',
        toolCalls: [
          {
            name: 'calculate',
            arguments: { expression: '1+2*3' },
            result: '7',
          },
        ],
      };
    });

    const writer = { write: jest.fn() };
    service.createChatStream({
      messages: [
        {
          role: 'user',
          id: 'q-1',
          parts: [{ type: 'text', text: '1+2*3' }],
        },
      ],
    });
    await executeHandler({ writer });

    expect(agentService.stream).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({})]),
    );
    const parts = writer.write.mock.calls.map(([part]) => part);
    expect(parts.map((part) => part.type)).toEqual([
      'data-status',
      'data-status',
      'data-status',
      'text-start',
      'text-delta',
      'text-delta',
      'text-end',
      'data-status',
    ]);
    expect(parts[1]).toMatchObject({
      type: 'data-status',
      data: { stage: 'tool_call', tool: 'calculate' },
    });
    expect(parts[2]).toMatchObject({
      type: 'data-status',
      data: { stage: 'generate_start' },
    });
    expect(memoryService.appendUserMessage).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'agent-web' }),
      '1+2*3',
      'q-1',
    );
    expect(memoryService.appendAssistantMessage).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'agent-web' }),
      '结果是 7',
      [
        {
          name: 'calculate',
          arguments: { expression: '1+2*3' },
          result: '7',
        },
      ],
    );
  });

  it('falls back when agent returns no answer', async () => {
    agentService.stream.mockImplementation(async function* () {
      yield { type: 'done', answer: '', toolCalls: [] };
    });

    const writer = { write: jest.fn() };
    service.createChatStream({
      messages: [
        {
          role: 'user',
          id: 'q-2',
          parts: [{ type: 'text', text: 'hello' }],
        },
      ],
    });
    await executeHandler({ writer });

    const parts = writer.write.mock.calls.map(([part]) => part);
    expect(parts.some((part) => part.type === 'text-delta')).toBe(true);
    expect(memoryService.appendAssistantMessage).toHaveBeenCalledWith(
      expect.objectContaining({ channel: 'agent-web' }),
      '抱歉，我暂时无法生成回答，请稍后重试。',
      [],
    );
  });
});
