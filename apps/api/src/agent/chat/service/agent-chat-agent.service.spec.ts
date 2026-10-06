import { ToolMessage } from '@langchain/core/messages';
import { toolCallLimitMiddleware } from 'langchain';
import { AgentChatAgentService } from './agent-chat-agent.service';
import { AgentChatToolLoggingMiddlewareService } from './agent-chat-tool-logging-middleware.service';
import { AgentChatToolService } from './agent-chat-tool.service';
import { AgentSkillService } from '../../skill/agent-skill.service';
import {
  createDeepAgent,
  createHarnessProfile,
  registerHarnessProfile,
} from 'deepagents';

const mockStreamEvents = jest.fn();

jest.mock('deepagents', () => ({
  createDeepAgent: jest.fn(),
  createHarnessProfile: jest.fn(),
  registerHarnessProfile: jest.fn(),
}));

jest.mock('langchain', () => ({
  toolCallLimitMiddleware: jest.fn(),
}));

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      const values: Record<string, unknown> = {
        modelName: 'test-model',
        openAiApiKey: 'test-key',
        openAiBaseUrl: 'http://localhost',
      };
      return values[key];
    }),
  },
}));

describe('AgentChatAgentService', () => {
  let toolService: { getTools: jest.Mock };
  let toolLoggingMiddleware: { create: jest.Mock };
  let skillService: { listEnabledInstructions: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    toolService = { getTools: jest.fn().mockReturnValue([]) };
    toolLoggingMiddleware = {
      create: jest
        .fn()
        .mockReturnValue({ name: 'AgentChatToolLoggingMiddleware' }),
    };
    skillService = {
      listEnabledInstructions: jest.fn().mockResolvedValue([
        {
          key: 'business-knowledge',
          type: 'system',
          name: '业务知识检索',
          instruction: '优先检索业务知识库。',
        },
      ]),
    };
    (toolCallLimitMiddleware as jest.Mock).mockReturnValue({
      name: 'ToolCallLimitMiddleware',
    });
    (createDeepAgent as jest.Mock).mockReturnValue({
      streamEvents: mockStreamEvents,
    });
    (createHarnessProfile as jest.Mock).mockImplementation(
      (options) => options,
    );
  });

  it('creates deep agent with dynamic skills and hidden built-in tools', async () => {
    mockStreamEvents.mockResolvedValue(createRun([]));
    await collectEvents(createService());

    expect(registerHarnessProfile).toHaveBeenCalledWith(
      'openai',
      expect.objectContaining({
        excludedTools: [
          'ls',
          'read_file',
          'write_file',
          'edit_file',
          'glob',
          'grep',
          'execute',
          'task',
        ],
        generalPurposeSubagent: { enabled: false },
      }),
    );
    expect(toolCallLimitMiddleware).toHaveBeenCalledWith({
      runLimit: 5,
      exitBehavior: 'continue',
    });
    expect(createDeepAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(Object),
        tools: [],
        middleware: [
          { name: 'ToolCallLimitMiddleware' },
          { name: 'AgentChatToolLoggingMiddleware' },
        ],
        systemPrompt: expect.stringContaining('业务 Agent 助手'),
      }),
    );
    expect(createDeepAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        systemPrompt: expect.stringContaining('优先检索业务知识库。'),
      }),
    );
    expect(skillService.listEnabledInstructions).toHaveBeenCalledWith(
      'yurex',
      7,
    );
    expect(createDeepAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        systemPrompt: expect.stringContaining(
          '当系统输出用户可见的思考过程时，仅使用简体中文。',
        ),
      }),
    );
    expect(createDeepAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        systemPrompt: expect.stringContaining(
          '不得用 XML、Markdown 或文本模拟工具调用。',
        ),
      }),
    );
  });

  it('streams reasoning, tool lifecycle, and text in raw protocol order', async () => {
    const toolOutput = JSON.stringify([
      { fileName: '退货流程.md', content: '完整检索内容'.repeat(500) },
    ]);
    mockStreamEvents.mockResolvedValue(
      createRun([
        messageDelta({
          type: 'reasoning-delta',
          reasoning: '先检索知识库。',
        }),
        toolStarted('call-1', 'search_knowledge', { query: '退货流程' }),
        toolFinished('call-1', toolOutput),
        messageDelta({ type: 'text-delta', text: '请按退货流程操作。' }),
      ]),
    );

    const events = await collectEvents(createService());

    expect(mockStreamEvents).toHaveBeenCalledWith(
      { messages: [] },
      {
        version: 'v3',
        context: {
          tenantCode: 'yurex',
          userId: 7,
          channel: 'agent-web',
          conversationId: 'conversation-1',
          sessionKey: 'conversation:conversation-1:user:u1',
        },
      },
    );
    expect(events).toEqual([
      { type: 'reasoning_delta', delta: '先检索知识库。' },
      {
        type: 'tool_start',
        name: 'search_knowledge',
        arguments: { query: '退货流程' },
      },
      {
        type: 'tool_end',
        name: 'search_knowledge',
        arguments: { query: '退货流程' },
        result: toolOutput,
      },
      { type: 'text_delta', delta: '请按退货流程操作。' },
      {
        type: 'done',
        answer: '请按退货流程操作。',
        toolCalls: [
          {
            name: 'search_knowledge',
            arguments: { query: '退货流程' },
            result: toolOutput,
          },
        ],
      },
    ]);
  });

  it('normalizes ToolMessage and serialized ToolMessage outputs', async () => {
    const toolMessage = new ToolMessage({
      content: '实时工具结果',
      tool_call_id: 'call-1',
    });
    const serializedToolMessage = {
      lc: 1,
      type: 'constructor',
      id: ['langchain_core', 'messages', 'ToolMessage'],
      kwargs: { content: '序列化工具结果', tool_call_id: 'call-2' },
    };
    mockStreamEvents.mockResolvedValue(
      createRun([
        toolStarted('call-1', 'calculate', { expression: '1+1' }),
        toolStarted('call-2', 'get_document', { id: 'document-1' }),
        toolFinished('call-2', serializedToolMessage),
        toolFinished('call-1', toolMessage),
      ]),
    );

    const events = await collectEvents(createService());

    expect(events).toContainEqual({
      type: 'tool_end',
      name: 'calculate',
      arguments: { expression: '1+1' },
      result: '实时工具结果',
    });
    expect(events).toContainEqual({
      type: 'tool_end',
      name: 'get_document',
      arguments: { id: 'document-1' },
      result: '序列化工具结果',
    });
  });

  it('records tool errors using the matching tool call', async () => {
    mockStreamEvents.mockResolvedValue(
      createRun([
        toolStarted('call-1', 'calculate', { expression: '1/0' }),
        toolError('call-1', 'division by zero'),
      ]),
    );

    const events = await collectEvents(createService());

    expect(events).toContainEqual({
      type: 'tool_end',
      name: 'calculate',
      arguments: { expression: '1/0' },
      result: 'division by zero',
    });
  });

  it('reports a successful tool event with missing output explicitly', async () => {
    mockStreamEvents.mockResolvedValue(
      createRun([
        toolStarted('call-1', 'search_knowledge', { query: '退款' }),
        toolFinished('call-1', undefined),
      ]),
    );

    const events = await collectEvents(createService());

    expect(events).toContainEqual({
      type: 'tool_end',
      name: 'search_knowledge',
      arguments: { query: '退款' },
      result: '工具执行完成，但未返回可展示结果',
    });
  });

  it('awaits run.output before emitting done', async () => {
    const output = Promise.resolve({ messages: [] });
    const outputThen = jest.fn(output.then.bind(output));
    mockStreamEvents.mockResolvedValue(
      createRun([], { then: outputThen } as unknown as PromiseLike<unknown>),
    );

    const events = await collectEvents(createService());

    expect(outputThen).toHaveBeenCalledTimes(1);
    expect(events).toEqual([{ type: 'done', answer: '', toolCalls: [] }]);
  });

  it('propagates a rejected final run output', async () => {
    mockStreamEvents.mockResolvedValue(
      createRun([], Promise.reject(new Error('agent failed'))),
    );

    await expect(collectEvents(createService())).rejects.toThrow(
      'agent failed',
    );
  });

  function createService() {
    return new AgentChatAgentService(
      toolService as unknown as AgentChatToolService,
      toolLoggingMiddleware as unknown as AgentChatToolLoggingMiddlewareService,
      skillService as unknown as AgentSkillService,
    );
  }
});

function createRun(
  events: unknown[],
  output: PromiseLike<unknown> = Promise.resolve({ messages: [] }),
) {
  return {
    output,
    async *[Symbol.asyncIterator]() {
      yield* events;
    },
  };
}

function messageDelta(delta: Record<string, unknown>) {
  return protocolEvent('messages', {
    event: 'content-block-delta',
    index: 0,
    delta,
  });
}

function toolStarted(id: string, name: string, input: unknown) {
  return protocolEvent('tools', {
    event: 'tool-started',
    tool_call_id: id,
    tool_name: name,
    input,
  });
}

function toolFinished(id: string, output: unknown) {
  return protocolEvent('tools', {
    event: 'tool-finished',
    tool_call_id: id,
    output,
  });
}

function toolError(id: string, message: string) {
  return protocolEvent('tools', {
    event: 'tool-error',
    tool_call_id: id,
    message,
  });
}

function protocolEvent(method: 'messages' | 'tools', data: object) {
  return {
    method,
    params: {
      namespace: [],
      timestamp: '2026-10-02T00:00:00.000Z',
      data,
    },
  };
}

async function collectEvents(service: AgentChatAgentService) {
  const events = [];
  for await (const event of service.stream([], {
    tenantCode: 'yurex',
    userId: 7,
    channel: 'agent-web',
    conversationId: 'conversation-1',
    sessionKey: 'conversation:conversation-1:user:u1',
  })) {
    events.push(event);
  }
  return events;
}
