import { AgentChatMemoryService } from './agent-chat-memory.service';

describe('AgentChatMemoryService', () => {
  let ragPrisma: {
    agentChatSession: {
      upsert: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    agentChatMessage: {
      findMany: jest.Mock;
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let tenantContext: { tenant?: string };
  let service: AgentChatMemoryService;

  beforeEach(() => {
    ragPrisma = {
      agentChatSession: {
        upsert: jest.fn().mockResolvedValue({ id: BigInt(1) }),
        update: jest.fn().mockResolvedValue({}),
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          {
            id: BigInt(10),
            tenantCode: 'yurex',
            channel: 'agent-web',
            sessionKey: 'conversation:demo:user:u1',
            userId: 'u1',
            conversationId: 'demo',
            conversationType: 'agent-chat',
            metadata: {},
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
            lastActiveAt: new Date('2026-01-01T00:00:00.000Z'),
            _count: { messages: 2 },
            messages: [
              {
                id: BigInt(2),
                role: 'assistant',
                content: 'answer',
                createdAt: new Date('2026-01-01T00:00:00.000Z'),
              },
            ],
          },
        ]),
        findUnique: jest.fn().mockResolvedValue({
          id: BigInt(10),
          tenantCode: 'yurex',
        }),
      },
      agentChatMessage: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: BigInt(1),
            tenantCode: 'yurex',
            sessionId: BigInt(10),
            role: 'user',
            content: 'hello',
            toolCalls: {},
            senderId: 'u1',
            externalMessageId: null,
            replyToMessageId: null,
            metadata: {},
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ]),
        create: jest.fn().mockResolvedValue({}),
      },
      $transaction: jest.fn().mockImplementation(async (items) => items),
    };
    tenantContext = { tenant: 'yurex' };
    service = new AgentChatMemoryService(
      ragPrisma as any,
      tenantContext as any,
    );
  });

  it('resolves a stable tenant-scoped session', () => {
    const session = service.resolveSession({
      channel: 'agent-web',
      conversationId: 'demo',
      participantId: 'u1',
    });

    expect(session).toMatchObject({
      tenantCode: 'yurex',
      channel: 'agent-web',
      sessionKey: 'conversation:demo:user:u1',
    });
  });

  it('persists user and assistant messages with tool calls', async () => {
    const session = service.resolveSession({
      channel: 'agent-web',
      conversationId: 'demo',
      participantId: 'u1',
      messageId: 'msg-1',
    });

    await service.appendUserMessage(session, 'question', 'msg-1');
    await service.appendAssistantMessage(session, 'answer', [
      { name: 'calculate', arguments: { expression: '1+1' }, result: '2' },
    ]);

    expect(ragPrisma.$transaction).toHaveBeenCalledTimes(2);
    expect(ragPrisma.agentChatMessage.create).toHaveBeenCalledTimes(2);
  });

  it('pages sessions with latest message', async () => {
    const result = await service.pageSessions({
      page: 1,
      pageSize: 20,
      channel: 'agent-web',
    });

    expect(result.list[0]).toMatchObject({
      id: '10',
      tenantCode: 'yurex',
      messageCount: 2,
      latestMessage: { role: 'assistant', content: 'answer' },
    });
  });

  it('returns messages for current tenant session', async () => {
    const result = await service.listSessionMessages(10);

    expect(result[0]).toMatchObject({
      id: '1',
      role: 'user',
      content: 'hello',
    });
  });
});
