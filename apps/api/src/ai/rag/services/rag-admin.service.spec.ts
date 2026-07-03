import { BadRequestException } from '@nestjs/common';
import { RagAdminService } from './rag-admin.service';

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      if (key === 'defaultTenant') return 'aplus';
      return undefined;
    }),
  },
}));

describe('RagAdminService', () => {
  let ragPrisma: {
    aplusDocument: {
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
    aplusRagSession: {
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    aplusRagMessage: {
      findMany: jest.Mock;
    };
  };
  let ragIngestService: { ingest: jest.Mock };
  let tenantContext: { tenant?: string };
  let service: RagAdminService;

  beforeEach(() => {
    ragPrisma = {
      aplusDocument: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          {
            id: BigInt(1),
            tenantCode: 'aplus',
            sourcePath: 'raw/aplus/a.md',
            fileName: 'a.md',
            fileType: 'md',
            fileHash: 'hash',
            fileSize: BigInt(12),
            chunkCount: 2,
            status: 'ready',
            error: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-02T00:00:00.000Z'),
            ingestedAt: new Date('2026-01-02T00:00:00.000Z'),
            _count: { chunks: 2 },
          },
        ]),
        findUnique: jest.fn(),
        delete: jest.fn().mockResolvedValue({}),
      },
      aplusRagSession: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          {
            id: BigInt(10),
            tenantCode: 'aplus',
            channel: 'wecom',
            sessionKey: 'group:chat:user',
            userId: 'user',
            conversationId: 'chat',
            conversationType: 'group',
            metadata: {},
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-02T00:00:00.000Z'),
            lastActiveAt: new Date('2026-01-03T00:00:00.000Z'),
            _count: { messages: 2 },
            messages: [
              {
                id: BigInt(99),
                role: 'assistant',
                content: 'answer',
                createdAt: new Date('2026-01-03T00:00:00.000Z'),
              },
            ],
          },
        ]),
        findUnique: jest.fn(),
      },
      aplusRagMessage: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: BigInt(1),
            tenantCode: 'aplus',
            sessionId: BigInt(10),
            role: 'user',
            content: 'hello',
            senderId: 'user',
            externalMessageId: 'msg',
            replyToMessageId: null,
            metadata: {},
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        ]),
      },
    };
    ragIngestService = { ingest: jest.fn().mockResolvedValue({ ok: true }) };
    tenantContext = { tenant: 'aplus' };
    service = new RagAdminService(
      ragPrisma as any,
      ragIngestService as any,
      tenantContext as any,
    );
  });

  it('pages documents within current tenant and keyword filter', async () => {
    const result = await service.pageDocuments({
      page: 2,
      pageSize: 10,
      keyword: 'guide',
      status: 'ready',
    });

    expect(ragPrisma.aplusDocument.count).toHaveBeenCalledWith({
      where: {
        tenantCode: 'aplus',
        OR: [
          { fileName: { contains: 'guide', mode: 'insensitive' } },
          { sourcePath: { contains: 'guide', mode: 'insensitive' } },
        ],
        status: 'ready',
      },
    });
    expect(ragPrisma.aplusDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
    expect(result.total).toBe(1);
    expect(result.list[0]).toMatchObject({
      tenantCode: 'aplus',
      fileName: 'a.md',
      actualChunkCount: 2,
    });
  });

  it('blocks cross tenant document deletion', async () => {
    ragPrisma.aplusDocument.findUnique.mockResolvedValue({
      id: BigInt(1),
      tenantCode: 'boat',
      sourcePath: 'raw/boat/a.md',
    });

    await expect(service.deleteDocument(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(ragPrisma.aplusDocument.delete).not.toHaveBeenCalled();
  });

  it('forwards force ingest option', async () => {
    await service.ingest({ force: true });

    expect(ragIngestService.ingest).toHaveBeenCalledWith({ force: true });
  });

  it('pages sessions with message keyword filter', async () => {
    const result = await service.pageSessions({
      page: 1,
      pageSize: 20,
      channel: 'wecom',
      keyword: 'refund',
    });

    expect(ragPrisma.aplusRagSession.count).toHaveBeenCalledWith({
      where: {
        tenantCode: 'aplus',
        channel: 'wecom',
        OR: expect.arrayContaining([
          { sessionKey: { contains: 'refund', mode: 'insensitive' } },
          {
            messages: {
              some: {
                content: { contains: 'refund', mode: 'insensitive' },
              },
            },
          },
        ]),
      },
    });
    expect(result.list[0]).toMatchObject({
      channel: 'wecom',
      messageCount: 2,
    });
  });

  it('lists messages only for current tenant session', async () => {
    ragPrisma.aplusRagSession.findUnique.mockResolvedValue({
      id: BigInt(10),
      tenantCode: 'aplus',
    });

    const result = await service.listSessionMessages(10);

    expect(ragPrisma.aplusRagMessage.findMany).toHaveBeenCalledWith({
      where: {
        tenantCode: 'aplus',
        sessionId: 10,
      },
      orderBy: { createdAt: 'asc' },
    });
    expect(result[0]).toMatchObject({ role: 'user', content: 'hello' });
  });
});
