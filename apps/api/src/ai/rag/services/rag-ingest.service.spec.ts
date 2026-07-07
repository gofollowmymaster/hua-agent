jest.mock('@langchain/openai', () => ({
  OpenAIEmbeddings: jest.fn().mockImplementation(() => ({
    embedDocuments: jest.fn().mockResolvedValue([[0.1, 0.2]]),
  })),
}));

jest.mock('@langchain/textsplitters', () => ({
  RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => ({
    splitText: jest.fn(async (text: string) => [text]),
  })),
}));

jest.mock('@src/config/node-config.service', () => ({
  NodeConfigService: {
    get: jest.fn((key: string) => {
      if (key === 'vcHelper') {
        return {
          embeddingBatchSize: 10,
          chunkSize: 1000,
          chunkOverlap: 100,
        };
      }
      if (key === 'defaultTenant') return 'aplus';
      if (key === 'embeddingsApiKey') return 'test-key';
      if (key === 'embeddingsModelName') return 'test-model';
      if (key === 'embeddingsDimensions') return 2;
      if (key === 'embeddingsBaseUrl') return 'http://localhost';
      return undefined;
    }),
  },
}));

import { RagIngestService } from './rag-ingest.service';

describe('RagIngestService', () => {
  let service: RagIngestService;
  let client: { $queryRaw: jest.Mock; $executeRaw: jest.Mock };

  beforeEach(() => {
    client = {
      $queryRaw: jest.fn().mockResolvedValue([{ id: BigInt(1) }]),
      $executeRaw: jest.fn().mockResolvedValue(undefined),
    };
    service = new RagIngestService(
      { $executeRaw: jest.fn() } as any,
      {} as any,
      {
        setContext: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
      } as any,
      { tenant: 'aplus' } as any,
    );
  });

  it('inserts default document type and empty tag without overriding metadata on conflict', async () => {
    await (service as any).upsertProcessingDocument(client, 'aplus', {
      sourcePath: 'policy/a.md',
      fileName: 'a.md',
      fileType: 'md',
      documentType: 'policy',
      fileHash: 'hash',
      fileSize: 12,
      absolutePath: '/raw/aplus/policy/a.md',
      segments: [],
    });

    const query = client.$queryRaw.mock.calls[0][0];
    const sql = Array.isArray(query) ? query.join('') : String(query);
    const values = client.$queryRaw.mock.calls[0].slice(1);

    expect(sql).toContain('"type", tag');
    expect(sql).toContain('ON CONFLICT (tenant_code, source_path) DO UPDATE');
    expect(sql).not.toContain('"type" = EXCLUDED');
    expect(sql).not.toContain('tag = EXCLUDED');
    expect(values).toContain('policy');
  });

  it('marks failed new documents with default document type and empty tag', async () => {
    const ragPrisma = { $executeRaw: jest.fn().mockResolvedValue(undefined) };
    service = new RagIngestService(
      ragPrisma as any,
      {} as any,
      {
        setContext: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
      } as any,
      { tenant: 'aplus' } as any,
    );

    await (service as any).markDocumentFailed(
      'aplus',
      {
        sourcePath: 'policy/a.md',
        fileName: 'a.md',
        fileType: 'md',
        documentType: 'policy',
        fileHash: 'hash',
        fileSize: 12,
      },
      'failed',
    );

    const query = ragPrisma.$executeRaw.mock.calls[0][0];
    const sql = Array.isArray(query) ? query.join('') : String(query);
    const values = ragPrisma.$executeRaw.mock.calls[0].slice(1);

    expect(sql).toContain('"type", tag');
    expect(sql).not.toContain('"type" = EXCLUDED');
    expect(sql).not.toContain('tag = EXCLUDED');
    expect(values).toContain('policy');
  });
});
