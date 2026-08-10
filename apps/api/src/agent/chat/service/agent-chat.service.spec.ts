import { HumanMessage } from '@langchain/core/messages';
import { AgentChatService } from './agent-chat.service';

const mockInvoke = jest.fn();
const mockStream = jest.fn();

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    bindTools: jest.fn().mockReturnThis(),
    invoke: mockInvoke,
    stream: mockStream,
  })),
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

describe('AgentChatService', () => {
  let logger: { setContext: jest.Mock; warn: jest.Mock };
  let memoryService: { loadRecentMessages: jest.Mock };
  let toolService: { getTools: jest.Mock; execute: jest.Mock };
  let service: AgentChatService;

  beforeEach(() => {
    jest.clearAllMocks();
    logger = { setContext: jest.fn(), warn: jest.fn() };
    memoryService = { loadRecentMessages: jest.fn().mockResolvedValue([]) };
    toolService = {
      getTools: jest.fn().mockReturnValue([]),
      execute: jest.fn().mockResolvedValue('7'),
    };
    service = new AgentChatService(
      logger as any,
      memoryService as any,
      toolService as any,
    );

    mockInvoke
      .mockResolvedValueOnce({
        tool_calls: [
          {
            id: 'call-1',
            name: 'calculate',
            args: { expression: '1+2*3' },
          },
        ],
      })
      .mockResolvedValueOnce({ content: '结果是 7' });
    mockStream.mockImplementation(async function* () {
      yield { content: '结果' };
      yield { content: '是 7' };
    });
  });

  it('runs tool loop and streams final answer', async () => {
    const writer = {
      write: jest.fn(),
    };
    const result = await (service as any).runToolLoop(
      [new HumanMessage('1+2*3')],
      writer,
      'text-1',
    );

    expect(toolService.execute).toHaveBeenCalledWith('calculate', {
      expression: '1+2*3',
    });
    expect(result.answer).toBe('结果是 7');
    expect(result.toolCalls).toHaveLength(1);
    expect(writer.write).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'text-end', id: 'text-1' }),
    );
  });
});
