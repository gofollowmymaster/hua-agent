import { BadRequestException } from '@nestjs/common';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { RagAdminService } from './rag-admin.service';

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      if (key === 'defaultTenant') return 'aplus';
      if (key === 'vcHelper') return { rawDir: 'raw' };
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
      update: jest.Mock;
      delete: jest.Mock;
    };
    aplusChunk: {
      count: jest.Mock;
      findMany: jest.Mock;
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
            type: 'policy',
            tag: '重点',
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
        update: jest.fn().mockResolvedValue({
          id: BigInt(1),
          tenantCode: 'aplus',
          type: 'policy',
          tag: '重点',
          updatedAt: new Date('2026-01-03T00:00:00.000Z'),
        }),
        delete: jest.fn().mockResolvedValue({}),
      },
      aplusChunk: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          {
            id: BigInt(101),
            tenantCode: 'aplus',
            documentId: BigInt(1),
            chunkIndex: 0,
            content: 'chunk content',
            metadata: { page: 1, sourcePath: 'a.md' },
            createdAt: new Date('2026-01-02T00:00:00.000Z'),
          },
        ]),
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
      id: '1',
      tenantCode: 'aplus',
      fileName: 'a.md',
      type: 'policy',
      tag: '重点',
      fileSize: '12',
      actualChunkCount: 2,
    });
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  it('updates document metadata for current tenant and trims input', async () => {
    ragPrisma.aplusDocument.findUnique.mockResolvedValue({
      id: BigInt(1),
      tenantCode: 'aplus',
    });

    const result = await service.updateDocumentMetadata(1, {
      type: ' policy ',
      tag: ' 重点 ',
    });

    expect(ragPrisma.aplusDocument.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        type: 'policy',
        tag: '重点',
        updatedAt: expect.any(Date),
      },
      select: {
        id: true,
        tenantCode: true,
        type: true,
        tag: true,
        updatedAt: true,
      },
    });
    expect(result).toMatchObject({
      id: '1',
      tenantCode: 'aplus',
      type: 'policy',
      tag: '重点',
    });
  });

  it('blocks cross tenant document metadata update', async () => {
    ragPrisma.aplusDocument.findUnique.mockResolvedValue({
      id: BigInt(1),
      tenantCode: 'boat',
    });

    await expect(
      service.updateDocumentMetadata(1, { type: 'policy', tag: '重点' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(ragPrisma.aplusDocument.update).not.toHaveBeenCalled();
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

  it('deletes a current tenant document and returns its existing response', async () => {
    ragPrisma.aplusDocument.findUnique.mockResolvedValue({
      id: BigInt(1),
      tenantCode: 'aplus',
      sourcePath: 'policy/a.md',
    });

    const result = await service.deleteDocument(1);

    expect(ragPrisma.aplusDocument.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual({
      deleted: {
        id: '1',
        tenantCode: 'aplus',
        sourcePath: 'policy/a.md',
      },
    });
  });

  it('blocks deletion when the document does not exist', async () => {
    ragPrisma.aplusDocument.findUnique.mockResolvedValue(undefined);

    await expect(service.deleteDocument(999)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(ragPrisma.aplusDocument.delete).not.toHaveBeenCalled();
  });

  it('pages document chunks for current tenant document', async () => {
    ragPrisma.aplusDocument.findUnique.mockResolvedValue({
      id: BigInt(1),
      tenantCode: 'aplus',
    });

    const result = await service.pageDocumentChunks(1, {
      page: 2,
      pageSize: 10,
    });

    expect(ragPrisma.aplusChunk.count).toHaveBeenCalledWith({
      where: {
        tenantCode: 'aplus',
        documentId: 1,
      },
    });
    expect(ragPrisma.aplusChunk.findMany).toHaveBeenCalledWith({
      where: {
        tenantCode: 'aplus',
        documentId: 1,
      },
      orderBy: { chunkIndex: 'asc' },
      skip: 10,
      take: 10,
    });
    expect(result).toMatchObject({
      total: 1,
      page: 2,
      pageSize: 10,
      list: [
        {
          id: '101',
          tenantCode: 'aplus',
          documentId: '1',
          chunkIndex: 0,
          content: 'chunk content',
          metadata: { page: 1, sourcePath: 'a.md' },
        },
      ],
    });
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  it('blocks cross tenant document chunk paging', async () => {
    ragPrisma.aplusDocument.findUnique.mockResolvedValue({
      id: BigInt(1),
      tenantCode: 'boat',
    });

    await expect(service.pageDocumentChunks(1, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(ragPrisma.aplusChunk.findMany).not.toHaveBeenCalled();
  });

  it('resolves preview file for current tenant document', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'rag-admin-'));
    const originalCwd = process.cwd();
    try {
      process.chdir(root);
      await fs.mkdir(path.join(root, 'raw', 'aplus'), { recursive: true });
      await fs.writeFile(path.join(root, 'raw', 'aplus', 'a.md'), '# demo');
      ragPrisma.aplusDocument.findUnique.mockResolvedValue({
        id: BigInt(1),
        tenantCode: 'aplus',
        sourcePath: 'a.md',
        fileName: 'a.md',
        fileType: 'md',
        fileSize: BigInt(0),
      });

      const result = await service.getDocumentPreviewFile(1);

      const expectedPath = await fs.realpath(
        path.join(root, 'raw', 'aplus', 'a.md'),
      );
      expect(result).toMatchObject({
        absolutePath: expectedPath,
        fileName: 'a.md',
        fileType: 'md',
        fileSize: 6,
      });
    } finally {
      process.chdir(originalCwd);
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it('blocks preview files outside current tenant raw directory', async () => {
    ragPrisma.aplusDocument.findUnique.mockResolvedValue({
      id: BigInt(1),
      tenantCode: 'aplus',
      sourcePath: '../boat/a.md',
      fileName: 'a.md',
      fileType: 'md',
      fileSize: BigInt(6),
    });

    await expect(service.getDocumentPreviewFile(1)).rejects.toBeInstanceOf(
      BadRequestException,
    );
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
      conversationType: 'rag-chat',
      keyword: 'refund',
    });

    expect(ragPrisma.aplusRagSession.count).toHaveBeenCalledWith({
      where: {
        tenantCode: 'aplus',
        channel: 'wecom',
        conversationType: 'rag-chat',
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
      id: '10',
      channel: 'wecom',
      messageCount: 2,
      latestMessage: expect.objectContaining({
        id: '99',
        role: 'assistant',
      }),
    });
    expect(() => JSON.stringify(result)).not.toThrow();
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
    expect(result[0]).toMatchObject({
      id: '1',
      sessionId: '10',
      role: 'user',
      content: 'hello',
    });
    expect(() => JSON.stringify(result)).not.toThrow();
  });
});
