import { AgentChatAgentService } from './agent-chat-agent.service';
import { AgentChatToolService } from './agent-chat-tool.service';
import {
  createDeepAgent,
  createHarnessProfile,
  registerHarnessProfile,
} from 'deepagents';

const mockStream = jest.fn();

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

  beforeEach(() => {
    jest.clearAllMocks();
    toolService = { getTools: jest.fn().mockReturnValue([]) };
    (createDeepAgent as jest.Mock).mockReturnValue({ stream: mockStream });
    (createHarnessProfile as jest.Mock).mockImplementation(
      (options) => options,
    );
  });

  it('creates deep agent with business tools and hidden built-in tools', () => {
    new AgentChatAgentService(toolService as unknown as AgentChatToolService);

    expect(registerHarnessProfile).toHaveBeenCalledWith(
      'openai:test-model',
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
  });

  it('maps messages and tools stream events in order', async () => {
    mockStream.mockResolvedValue(
      (async function* () {
        yield ['messages', [{ content: '结果' }, {}]];
        yield [
          'tools',
          {
            event: 'on_tool_start',
            name: 'calculate',
            toolCallId: 'call-1',
            input: { expression: '1+2*3' },
          },
        ];
        yield [
          'tools',
          {
            event: 'on_tool_end',
            name: 'calculate',
            toolCallId: 'call-1',
            output: '7',
          },
        ];
        yield ['messages', [{ content: [{ type: 'text', text: '是 7' }] }, {}]];
      })(),
    );

    const service = new AgentChatAgentService(
      toolService as unknown as AgentChatToolService,
    );
    const events: unknown[] = [];
    for await (const event of service.stream([])) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: 'text_delta', delta: '结果' },
      {
        type: 'tool_start',
        name: 'calculate',
        arguments: { expression: '1+2*3' },
      },
      {
        type: 'tool_end',
        name: 'calculate',
        arguments: { expression: '1+2*3' },
        result: '7',
      },
      { type: 'text_delta', delta: '是 7' },
      {
        type: 'done',
        answer: '结果是 7',
        toolCalls: [
          {
            name: 'calculate',
            arguments: { expression: '1+2*3' },
            result: '7',
          },
        ],
      },
    ]);
  });

  it('extracts reasoning content as reasoning_delta before text', async () => {
    mockStream.mockResolvedValue(
      (async function* () {
        yield [
          'messages',
          [
            {
              content: [{ type: 'text', text: '结果是 7' }],
              additional_kwargs: { reasoning_content: '先计算表达式' },
            },
            {},
          ],
        ];
      })(),
    );

    const service = new AgentChatAgentService(
      toolService as unknown as AgentChatToolService,
    );
    const events: unknown[] = [];
    for await (const event of service.stream([])) {
      events.push(event);
    }

    expect(events).toEqual([
      { type: 'reasoning_delta', delta: '先计算表达式' },
      { type: 'text_delta', delta: '结果是 7' },
      {
        type: 'done',
        answer: '结果是 7',
        toolCalls: [],
      },
    ]);
  });

  it('normalizes JSON string inputs and LangChain serialized outputs', async () => {
    mockStream.mockResolvedValue(
      (async function* () {
        yield [
          'tools',
          {
            event: 'on_tool_start',
            name: 'search_knowledge',
            toolCallId: 'call-1',
            input: JSON.stringify({ query: '退货流程' }),
          },
        ];
        yield [
          'tools',
          {
            event: 'on_tool_end',
            name: 'search_knowledge',
            toolCallId: 'call-1',
            output: {
              lc: 1,
              type: 'constructor',
              id: ['langchain_core', 'messages', 'ToolMessage'],
              kwargs: {
                content: JSON.stringify([{ fileName: '退货流程.md' }]),
              },
            },
          },
        ];
      })(),
    );

    const service = new AgentChatAgentService(
      toolService as unknown as AgentChatToolService,
    );
    const events: unknown[] = [];
    for await (const event of service.stream([])) {
      events.push(event);
    }

    expect(events[0]).toMatchObject({
      type: 'tool_start',
      arguments: { query: '退货流程' },
    });
    expect(events[1]).toMatchObject({
      type: 'tool_end',
      arguments: { query: '退货流程' },
      result: '[{"fileName":"退货流程.md"}]',
    });
  });

  it('keeps tool args captured from tool_call_chunks', async () => {
    mockStream.mockResolvedValue(
      (async function* () {
        yield [
          'messages',
          [
            {
              tool_call_chunks: [
                { id: 'call-1', args: '{"query":"退货流程"}' },
              ],
              content: '',
            },
            {},
          ],
        ];
        yield [
          'tools',
          {
            event: 'on_tool_start',
            name: 'search_knowledge',
            toolCallId: 'call-1',
          },
        ];
        yield [
          'tools',
          {
            event: 'on_tool_end',
            name: 'search_knowledge',
            toolCallId: 'call-1',
            output: '[{"fileName":"退货流程.md"}]',
          },
        ];
      })(),
    );

    const service = new AgentChatAgentService(
      toolService as unknown as AgentChatToolService,
    );
    const events: unknown[] = [];
    for await (const event of service.stream([])) {
      events.push(event);
    }

    expect(events[0]).toMatchObject({
      type: 'tool_start',
      arguments: { query: '退货流程' },
    });
    expect(events[1]).toMatchObject({
      type: 'tool_end',
      arguments: { query: '退货流程' },
      result: '[{"fileName":"退货流程.md"}]',
    });
  });

  it('records tool errors as tool_end results', async () => {
    mockStream.mockResolvedValue(
      (async function* () {
        yield [
          'tools',
          {
            event: 'on_tool_start',
            name: 'calculate',
            toolCallId: 'call-1',
            input: { expression: '1/0' },
          },
        ];
        yield [
          'tools',
          {
            event: 'on_tool_error',
            name: 'calculate',
            toolCallId: 'call-1',
            error: 'division by zero',
          },
        ];
      })(),
    );

    const service = new AgentChatAgentService(
      toolService as unknown as AgentChatToolService,
    );
    const events: unknown[] = [];
    for await (const event of service.stream([])) {
      events.push(event);
    }

    expect(events[1]).toMatchObject({
      type: 'tool_end',
      result: 'division by zero',
    });
  });
});
