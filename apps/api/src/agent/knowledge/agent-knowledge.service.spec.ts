import { BadRequestException } from '@nestjs/common';
import { AgentKnowledgeService } from './agent-knowledge.service';

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      if (key === 'defaultTenant') return 'aplus';
      return undefined;
    }),
  },
}));

describe('AgentKnowledgeService', () => {
  let ragPrisma: {
    agentDocument: {
      count: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };
  let ingestService: { ingest: jest.Mock };
  let searchService: { search: jest.Mock };
  let tenantContext: { tenant?: string };
  let service: AgentKnowledgeService;

  beforeEach(() => {
    ragPrisma = {
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
