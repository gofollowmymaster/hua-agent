import { BadRequestException } from '@nestjs/common';
import { AgentKnowledgeService } from './agent-knowledge.service';

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      if (key === 'defaultTenant') return 'aplus';
      if (key === 'agentKnowledge') return { docsDir: 'src/agent/docs' };
      return undefined;
    }),
  },
}));

describe('AgentKnowledgeService', () => {
  let ragPrisma: {
    $queryRaw: jest.Mock;
    agentDocument: {
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
    agentChunk: {
      count: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let ingestService: { ingest: jest.Mock };
  let searchService: { search: jest.Mock };
  let tenantContext: { tenant?: string };
  let service: AgentKnowledgeService;

  beforeEach(() => {
    ragPrisma = {
      $queryRaw: jest.fn(),
      agentDocument: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          {
            id: BigInt(1),
            tenantCode: 'yurex',
            category: 'yurex',
            sourcePath: 'yurex/guide.md',
            fileName: 'guide.md',
            fileType: 'md',
            fileHash: 'hash',
            fileSize: BigInt(12),
            chunkCount: 2,
            status: 'ready',
            error: null,
            metadata: {},
            remoteUrl: null,
            docId: null,
            wikiNodeId: null,
            lastModifiedAt: null,
            breadcrumb: null,
            sourceType: null,
            currentVersion: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-02T00:00:00.000Z'),
            ingestedAt: new Date('2026-01-02T00:00:00.000Z'),
            _count: { chunks: 2 },
          },
        ]),
        findUnique: jest.fn(),
        delete: jest.fn().mockResolvedValue({}),
      },
      agentChunk: {
        count: jest.fn().mockResolvedValue(1),
        findMany: jest.fn().mockResolvedValue([
          {
            id: BigInt(101),
            tenantCode: 'yurex',
            documentId: BigInt(1),
            chunkIndex: 0,
            content: 'chunk content',
            metadata: {},
            createdAt: new Date('2026-01-02T00:00:00.000Z'),
          },
        ]),
      },
    };
    ingestService = { ingest: jest.fn().mockResolvedValue({ ok: true }) };
    searchService = { search: jest.fn().mockResolvedValue([]) };
    tenantContext = { tenant: 'yurex' };
    service = new AgentKnowledgeService(
      ragPrisma as any,
      ingestService as any,
      searchService as any,
      tenantContext as any,
    );
  });

  it('ingests only the current tenant docs', async () => {
    await service.ingest({ force: true });

    expect(ingestService.ingest).toHaveBeenCalledWith({
      force: true,
      tenantCode: 'yurex',
    });
  });

  it('searches within the current tenant with requested mode', async () => {
    await service.search({
      query: '报销',
      mode: 'hybrid',
      category: 'yurex',
      topK: 10,
    });

    expect(searchService.search).toHaveBeenCalledWith('报销', {
      tenantCode: 'yurex',
      mode: 'hybrid',
      category: 'yurex',
      topK: 10,
    });
  });

  it('returns paginated documents with serialized ids', async () => {
    const result = await service.pageDocuments({
      page: 1,
      pageSize: 20,
      category: 'yurex',
    });

    expect(ragPrisma.agentDocument.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantCode: 'yurex', category: 'yurex' },
        skip: 0,
        take: 20,
      }),
    );
    expect(result.list[0]).toMatchObject({
      id: '1',
      tenantCode: 'yurex',
      actualChunkCount: 2,
    });
  });

  it('matches document content with zhparser full-text search', async () => {
    ragPrisma.$queryRaw
      .mockResolvedValueOnce([{ count: BigInt(1) }])
      .mockResolvedValueOnce([{ id: BigInt(1) }]);

    const result = await service.pageDocuments({
      keyword: '报销流程',
      category: 'yurex',
      status: 'ready',
      page: 1,
      pageSize: 10,
    });

    expect(ragPrisma.$queryRaw).toHaveBeenCalledTimes(2);
    const countQuery = ragPrisma.$queryRaw.mock.calls[0][0];
    expect(countQuery.strings.join(' ')).toContain(
      "to_tsvector('zhparser', c.content)",
    );
    expect(countQuery.values).toEqual(
      expect.arrayContaining(['报销流程', 'yurex', 'ready']),
    );
    expect(ragPrisma.agentDocument.findMany).toHaveBeenCalledWith({
      where: { id: { in: [BigInt(1)] } },
      include: {
        _count: { select: { chunks: true } },
      },
    });
    expect(result).toMatchObject({
      total: 1,
      page: 1,
      pageSize: 10,
      list: [{ id: '1', tenantCode: 'yurex' }],
    });
  });

  it('does not load documents when keyword search has no matches', async () => {
    ragPrisma.$queryRaw
      .mockResolvedValueOnce([{ count: BigInt(0) }])
      .mockResolvedValueOnce([]);

    const result = await service.pageDocuments({
      keyword: '不存在的内容',
      page: 2,
      pageSize: 10,
    });

    expect(ragPrisma.agentDocument.findMany).not.toHaveBeenCalled();
    expect(result).toEqual({
      list: [],
      total: 0,
      page: 2,
      pageSize: 10,
    });
  });

  it('returns document detail for current tenant', async () => {
    ragPrisma.agentDocument.findUnique.mockResolvedValue({
      id: BigInt(1),
      tenantCode: 'yurex',
      category: '业务流程',
      sourcePath: 'yurex/Yurex业务流程/guide.md',
      fileName: 'guide.md',
      fileType: 'md',
      fileHash: 'hash',
      fileSize: BigInt(12),
      chunkCount: 2,
      status: 'ready',
      error: null,
      metadata: {},
      remoteUrl: null,
      docId: null,
      wikiNodeId: null,
      lastModifiedAt: null,
      breadcrumb: null,
      sourceType: null,
      currentVersion: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      ingestedAt: new Date('2026-01-02T00:00:00.000Z'),
      _count: { chunks: 2 },
    });

    const result = await service.getDocument(1);

    expect(result).toMatchObject({
      id: '1',
      tenantCode: 'yurex',
      category: '业务流程',
      actualChunkCount: 2,
    });
  });

  it('rejects document detail for another tenant', async () => {
    ragPrisma.agentDocument.findUnique.mockResolvedValue({
      id: BigInt(9),
      tenantCode: 'aplus',
    });

    await expect(service.getDocument(9)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('returns paginated chunks for current tenant document', async () => {
    ragPrisma.agentDocument.findUnique.mockResolvedValue({
      id: BigInt(1),
      tenantCode: 'yurex',
    });

    const result = await service.pageDocumentChunks(1, {
      page: 1,
      pageSize: 20,
    });

    expect(ragPrisma.agentChunk.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantCode: 'yurex', documentId: 1 },
        skip: 0,
        take: 20,
      }),
    );
    expect(result.list[0]).toMatchObject({
      id: '101',
      tenantCode: 'yurex',
      chunkIndex: 0,
    });
  });

  it('rejects preview when source path escapes docs root', async () => {
    ragPrisma.agentDocument.findUnique.mockResolvedValue({
      id: BigInt(9),
      tenantCode: 'yurex',
      sourcePath: '../../outside.md',
      fileName: 'outside.md',
      fileType: 'md',
      fileSize: BigInt(12),
    });

    await expect(service.getDocumentPreviewFile(9)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects deletion of documents belonging to another tenant', async () => {
    ragPrisma.agentDocument.findUnique.mockResolvedValue({
      id: BigInt(9),
      tenantCode: 'aplus',
      sourcePath: 'aplus/other.md',
    });

    await expect(service.deleteDocument(9)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(ragPrisma.agentDocument.delete).not.toHaveBeenCalled();
  });
});
