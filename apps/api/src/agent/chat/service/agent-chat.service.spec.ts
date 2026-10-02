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
      yield { type: 'text_delta', delta: '计算前的说明。' };
      yield {
        type: 'tool_start',
        name: 'calculate',
        arguments: { expression: '1+2*3' },
      };
      yield {
        type: 'reasoning_delta',
        delta: '根据计算结果整理答案。',
      };
      yield {
        type: 'tool_end',
        name: 'calculate',
        arguments: { expression: '1+2*3' },
        result: '7',
      };
      yield { type: 'text_delta', delta: '结果是 7' };
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
    const firstTextDeltaIndex = parts.findIndex(
      (part) => part.type === 'text-delta' && part.delta === '计算前的说明。',
    );
    const toolCallIndex = parts.findIndex(
      (part) => part.type === 'data-status' && part.data.stage === 'tool_call',
    );
    const secondTextDeltaIndex = parts.findIndex(
      (part) => part.type === 'text-delta' && part.delta === '结果是 7',
    );
    const textStarts = parts.filter((part) => part.type === 'text-start');

    expect(firstTextDeltaIndex).toBeLessThan(toolCallIndex);
    expect(toolCallIndex).toBeLessThan(secondTextDeltaIndex);
    expect(textStarts).toHaveLength(2);
    expect(textStarts[0].id).not.toEqual(textStarts[1].id);
    expect(parts[toolCallIndex]).toMatchObject({
      type: 'data-status',
      data: { stage: 'tool_call', tool: 'calculate' },
    });
    expect(parts).toContainEqual({
      type: 'data-status',
      data: {
        stage: 'tool_result',
        tool: 'calculate',
        message: '工具执行完成：calculate',
        arguments: { expression: '1+2*3' },
        result: '7',
      },
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
      expect.arrayContaining([
        { type: 'text', text: '计算前的说明。' },
        {
          type: 'data-status',
          data: {
            stage: 'tool_call',
            tool: 'calculate',
            message: '调用工具：calculate',
          },
        },
        { type: 'text', text: '结果是 7' },
      ]),
    );
  });

  it('streams reasoning parts and search result summary', async () => {
    agentService.stream.mockImplementation(async function* () {
      yield {
        type: 'tool_start',
        name: 'search_knowledge',
        arguments: { query: '退货流程' },
      };
      yield {
        type: 'tool_end',
        name: 'search_knowledge',
        arguments: { query: '退货流程' },
        result: JSON.stringify([
          { fileName: '退货流程.md' },
          { fileName: '售后指南.md' },
          { fileName: '退款说明.md' },
          { fileName: '客户服务.md' },
        ]),
      };
      yield { type: 'reasoning_delta', delta: '先检索知识库' };
      yield { type: 'text_delta', delta: '根据资料' };
      yield { type: 'text_delta', delta: '，请按流程操作。' };
      yield {
        type: 'done',
        answer: '根据资料，请按流程操作。',
        toolCalls: [],
      };
    });

    const writer = { write: jest.fn() };
    service.createChatStream({
      messages: [
        {
          role: 'user',
          id: 'q-3',
          parts: [{ type: 'text', text: '退货流程是什么？' }],
        },
      ],
    });
    await executeHandler({ writer });

    const parts = writer.write.mock.calls.map(([part]) => part);
    expect(parts).toContainEqual({
      type: 'data-status',
      data: {
        stage: 'tool_result',
        tool: 'search_knowledge',
        message:
          '检索到 4 个相关文档：退货流程.md、售后指南.md、退款说明.md 等',
        arguments: { query: '退货流程' },
        result: JSON.stringify([
          { fileName: '退货流程.md' },
          { fileName: '售后指南.md' },
          { fileName: '退款说明.md' },
          { fileName: '客户服务.md' },
        ]),
      },
    });
    expect(parts).toContainEqual({
      type: 'reasoning-start',
      id: expect.any(String),
    });
    expect(parts).toContainEqual({
      type: 'reasoning-delta',
      id: expect.any(String),
      delta: '先检索知识库',
    });
    expect(parts).toContainEqual({
      type: 'reasoning-end',
      id: expect.any(String),
    });
    expect(
      parts.findIndex((part) => part.type === 'reasoning-start'),
    ).toBeLessThan(parts.findIndex((part) => part.type === 'text-start'));
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
      expect.arrayContaining([
        {
          type: 'text',
          text: '抱歉，我暂时无法生成回答，请稍后重试。',
        },
      ]),
    );
  });
});
