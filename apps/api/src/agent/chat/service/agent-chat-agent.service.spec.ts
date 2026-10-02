import { AgentChatAgentService } from './agent-chat-agent.service';
import { AgentChatToolLoggingMiddlewareService } from './agent-chat-tool-logging-middleware.service';
import { AgentChatToolService } from './agent-chat-tool.service';
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

  beforeEach(() => {
    jest.clearAllMocks();
    toolService = { getTools: jest.fn().mockReturnValue([]) };
    toolLoggingMiddleware = {
      create: jest
        .fn()
        .mockReturnValue({ name: 'AgentChatToolLoggingMiddleware' }),
    };
    (createDeepAgent as jest.Mock).mockReturnValue({
      streamEvents: mockStreamEvents,
    });
    (createHarnessProfile as jest.Mock).mockImplementation(
      (options) => options,
    );
  });

  it('creates deep agent with business tools and hidden built-in tools', () => {
    new AgentChatAgentService(
      toolService as unknown as AgentChatToolService,
      toolLoggingMiddleware as unknown as AgentChatToolLoggingMiddlewareService,
    );

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
    expect(createDeepAgent).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(Object),
        tools: [],
        middleware: [{ name: 'AgentChatToolLoggingMiddleware' }],
        systemPrompt: expect.stringContaining('业务 Agent 助手'),
      }),
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

  it('streams AI text and reasoning separately from tool output', async () => {
    const toolOutput = JSON.stringify([
      { fileName: '退货流程.md', content: '完整检索内容'.repeat(500) },
    ]);
    mockStreamEvents.mockResolvedValue(
      createRun({
        messages: [
          {
            text: ['请按退货流程操作。'],
            reasoning: ['先检索知识库。'],
          },
        ],
        toolCalls: [
          {
            name: 'search_knowledge',
            input: { query: '退货流程' },
            status: 'finished',
            output: toolOutput,
          },
        ],
      }),
    );

    const service = new AgentChatAgentService(
      toolService as unknown as AgentChatToolService,
      toolLoggingMiddleware as unknown as AgentChatToolLoggingMiddlewareService,
    );
    const events = await collectEvents(service);

    expect(mockStreamEvents).toHaveBeenCalledWith(
      { messages: [] },
      {
        version: 'v3',
        context: {
          tenantCode: 'yurex',
          channel: 'agent-web',
          conversationId: 'conversation-1',
          sessionKey: 'conversation:conversation-1:user:u1',
        },
      },
    );
    expect(events).toEqual(
      expect.arrayContaining([
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
      ]),
    );
    expect(events).not.toContainEqual({
      type: 'text_delta',
      delta: toolOutput,
    });
  });

  it('records failed tool calls as tool_end results', async () => {
    mockStreamEvents.mockResolvedValue(
      createRun({
        toolCalls: [
          {
            name: 'calculate',
            input: { expression: '1/0' },
            status: 'error',
            error: 'division by zero',
          },
        ],
      }),
    );

    const service = new AgentChatAgentService(
      toolService as unknown as AgentChatToolService,
      toolLoggingMiddleware as unknown as AgentChatToolLoggingMiddlewareService,
    );
    const events = await collectEvents(service);

    expect(events).toContainEqual({
      type: 'tool_end',
      name: 'calculate',
      arguments: { expression: '1/0' },
      result: 'division by zero',
    });
  });
});

function createRun({
  messages = [],
  toolCalls = [],
}: {
  messages?: Array<{ text: string[]; reasoning: string[] }>;
  toolCalls?: Array<{
    name: string;
    input: unknown;
    status: 'finished' | 'error';
    output?: unknown;
    error?: string;
  }>;
}) {
  return {
    messages: toAsyncIterable(
      messages.map((message) => ({
        text: toAsyncIterable(message.text),
        reasoning: toAsyncIterable(message.reasoning),
      })),
    ),
    toolCalls: toAsyncIterable(
      toolCalls.map((call) => ({
        name: call.name,
        input: call.input,
        status: Promise.resolve(call.status),
        output:
          call.status === 'error'
            ? Promise.reject(new Error(call.error))
            : Promise.resolve(call.output),
        error: Promise.resolve(call.error),
      })),
    ),
  };
}

function toAsyncIterable<T>(values: T[]): AsyncIterable<T> {
  return (async function* () {
    yield* values;
  })();
}

async function collectEvents(service: AgentChatAgentService) {
  const events = [];
  for await (const event of service.stream([], {
    tenantCode: 'yurex',
    channel: 'agent-web',
    conversationId: 'conversation-1',
    sessionKey: 'conversation:conversation-1:user:u1',
  })) {
    events.push(event);
  }
  return events;
}
