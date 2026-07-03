import { RedisKeys } from '@src/common/const/redis-key.enum';
import { RagMemoryService } from './rag-memory.service';

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => (key === 'defaultTenant' ? 'aplus' : undefined)),
  },
}));

describe('RagMemoryService', () => {
  let redisClient: {
    lrange: jest.Mock;
    rpush: jest.Mock;
    ltrim: jest.Mock;
    expire: jest.Mock;
  };
  let redisService: {
    getClient: jest.Mock;
    buildCacheKeyWithTemplates: jest.Mock;
  };
  let ragPrisma: {
    aplusRagSession: { upsert: jest.Mock };
    aplusRagMessage: { createMany: jest.Mock };
  };
  let tenantContext: { tenant?: string };
  let logger: {
    setContext: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
  };
  let service: RagMemoryService;

  beforeEach(() => {
    redisClient = {
      lrange: jest.fn().mockResolvedValue([]),
      rpush: jest.fn().mockResolvedValue(2),
      ltrim: jest.fn().mockResolvedValue('OK'),
      expire: jest.fn().mockResolvedValue(1),
    };
    redisService = {
      getClient: jest.fn(() => redisClient),
      buildCacheKeyWithTemplates: jest.fn((_key, templates) => {
        return `frontend-node:aplus:rag:memory:${templates.channel}:${templates.sessionKey}`;
      }),
    };
    ragPrisma = {
      aplusRagSession: {
        upsert: jest.fn().mockResolvedValue({ id: BigInt(100) }),
      },
      aplusRagMessage: {
        createMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };
    tenantContext = { tenant: 'aplus' };
    logger = {
      setContext: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    service = new RagMemoryService(
      redisService as any,
      ragPrisma as any,
      tenantContext as any,
      logger as any,
    );
  });

  it('resolves tenant scoped session from channel conversation and participant', () => {
    const session = service.resolveSession({
      session: {
        channel: 'wecom',
        conversationType: 'group',
        conversationId: 'chat-id',
        participantId: 'user-id',
        messageId: 'msg-id',
      },
    });

    expect(session).toMatchObject({
      tenantCode: 'aplus',
      channel: 'wecom',
      sessionKey: 'group:chat-id:user-id',
      encodedSessionKey: Buffer.from('group:chat-id:user-id').toString(
        'base64url',
      ),
    });
  });

  it('loads short term memory from Redis list', async () => {
    redisClient.lrange.mockResolvedValue([
      JSON.stringify({
        role: 'user',
        content: '上一问',
        createdAt: '2026-07-03T00:00:00.000Z',
      }),
      'invalid-json',
      JSON.stringify({
        role: 'assistant',
        content: '上一答',
        createdAt: '2026-07-03T00:00:01.000Z',
      }),
    ]);

    const session = service.resolveSession({
      session: { channel: 'http', conversationId: 'conv-1' },
    });
    const messages = await service.loadShortTermMemory(session);

    expect(messages.map((item) => item.content)).toEqual(['上一问', '上一答']);
    expect(redisService.buildCacheKeyWithTemplates).toHaveBeenCalledWith(
      RedisKeys.RAG_SESSION_MEMORY,
      expect.objectContaining({ channel: 'http' }),
    );
    expect(logger.warn).toHaveBeenCalledWith(
      'Failed to parse RAG memory message',
      undefined,
      expect.any(Object),
    );
  });

  it('appends redis queue with max length and ttl and writes long term history', async () => {
    const session = service.resolveSession({
      session: {
        channel: 'wecom',
        conversationType: 'group',
        conversationId: 'chat-id',
        participantId: 'user-id',
        messageId: 'msg-id',
      },
    });

    await service.appendTurn(session, '问题', '答案');

    expect(redisClient.rpush).toHaveBeenCalledWith(
      expect.stringContaining('frontend-node:aplus:rag:memory:wecom:'),
      expect.any(String),
      expect.any(String),
    );
    expect(redisClient.ltrim).toHaveBeenCalledWith(expect.any(String), -20, -1);
    expect(redisClient.expire).toHaveBeenCalledWith(expect.any(String), 172800);
    expect(ragPrisma.aplusRagSession.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantCode_channel_sessionKey: {
            tenantCode: 'aplus',
            channel: 'wecom',
            sessionKey: 'group:chat-id:user-id',
          },
        },
      }),
    );
    expect(ragPrisma.aplusRagMessage.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          tenantCode: 'aplus',
          sessionId: BigInt(100),
          role: 'user',
          senderId: 'user-id',
          externalMessageId: 'msg-id',
        }),
        expect.objectContaining({
          tenantCode: 'aplus',
          sessionId: BigInt(100),
          role: 'assistant',
          senderId: 'rag-assistant',
          replyToMessageId: 'msg-id',
          metadata: expect.objectContaining({
            answeredParticipantId: 'user-id',
          }),
        }),
      ],
    });
  });

  it('does not throw when redis or database writes fail', async () => {
    redisClient.rpush.mockRejectedValue(new Error('redis failed'));
    ragPrisma.aplusRagSession.upsert.mockRejectedValue(new Error('db failed'));
    const session = service.resolveSession({
      session: { channel: 'http', conversationId: 'conv-1' },
    });

    await expect(service.appendTurn(session, '问题', '答案')).resolves.toBeUndefined();

    expect(logger.warn).toHaveBeenCalledWith(
      'Failed to append RAG short-term memory',
      undefined,
      expect.any(Object),
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to append RAG long-term history',
      undefined,
      expect.any(Object),
    );
  });
});
