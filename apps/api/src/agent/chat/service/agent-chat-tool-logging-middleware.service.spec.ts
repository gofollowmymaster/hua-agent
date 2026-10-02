import { ToolMessage } from '@langchain/core/messages';
import { AgentChatToolLoggingMiddlewareService } from './agent-chat-tool-logging-middleware.service';

describe('AgentChatToolLoggingMiddlewareService', () => {
  let logger: { info: jest.Mock; error: jest.Mock };
  let service: AgentChatToolLoggingMiddlewareService;

  beforeEach(() => {
    logger = { info: jest.fn(), error: jest.fn() };
    service = new AgentChatToolLoggingMiddlewareService(logger as any);
  });

  it('logs safe metadata and returns successful tool results unchanged', async () => {
    const middleware = service.create();
    const result = new ToolMessage({
      content: JSON.stringify([{ id: 'document-1', content: '业务正文' }]),
      tool_call_id: 'tool-call-1',
    });
    const handler = jest.fn().mockResolvedValue(result);

    const output = await middleware.wrapToolCall!(
      createRequest({ query: '包含敏感问题的查询', topK: 3 }),
      handler,
    );

    expect(output).toBe(result);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenNthCalledWith(
      1,
      'Business Agent tool call started',
      undefined,
      expect.objectContaining({
        event: 'business_agent_tool_call_started',
        toolName: 'search_knowledge',
        toolCallId: 'tool-call-1',
        tenantCode: 'yurex',
        argumentKeys: ['query', 'topK'],
      }),
    );
    expect(logger.info).toHaveBeenNthCalledWith(
      2,
      'Business Agent tool call completed',
      undefined,
      expect.objectContaining({
        event: 'business_agent_tool_call_completed',
        status: 'success',
        resultType: 'ToolMessage',
        resultCharacters: expect.any(Number),
        resultItemCount: 1,
        durationMs: expect.any(Number),
      }),
    );
    expect(JSON.stringify(logger.info.mock.calls)).not.toContain(
      '包含敏感问题的查询',
    );
    expect(JSON.stringify(logger.info.mock.calls)).not.toContain('业务正文');
  });

  it('logs structured errors without exposing the error message and rethrows', async () => {
    const middleware = service.create();
    const error = Object.assign(
      new Error('upstream response contains secret'),
      {
        code: 'UPSTREAM_FAILED',
      },
    );

    await expect(
      middleware.wrapToolCall!(
        createRequest({ expression: '1/0' }),
        async () => {
          throw error;
        },
      ),
    ).rejects.toBe(error);

    expect(logger.error).toHaveBeenCalledWith(
      'Business Agent tool call failed',
      undefined,
      expect.objectContaining({
        event: 'business_agent_tool_call_failed',
        errorName: 'Error',
        errorCode: 'UPSTREAM_FAILED',
        durationMs: expect.any(Number),
      }),
    );
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain(
      'upstream response contains secret',
    );
  });

  it('records error ToolMessage responses as failed without modifying them', async () => {
    const middleware = service.create();
    const result = new ToolMessage({
      content: '工具失败的原始结果',
      tool_call_id: 'tool-call-1',
      status: 'error',
    });

    const output = await middleware.wrapToolCall!(
      createRequest({ documentId: 1 }),
      async () => result,
    );

    expect(output).toBe(result);
    expect(logger.error).toHaveBeenCalledWith(
      'Business Agent tool call failed',
      undefined,
      expect.objectContaining({
        event: 'business_agent_tool_call_failed',
        status: 'error',
        resultCharacters: '工具失败的原始结果'.length,
      }),
    );
  });
});

function createRequest(args: Record<string, unknown>) {
  return {
    toolCall: {
      id: 'tool-call-1',
      name: 'search_knowledge',
      args,
    },
    tool: undefined,
    state: { messages: [] },
    runtime: {
      context: {
        tenantCode: 'yurex',
        channel: 'agent-web',
        conversationId: 'conversation-1',
        sessionKey: 'conversation:conversation-1:user:u1',
      },
    },
  } as any;
}
