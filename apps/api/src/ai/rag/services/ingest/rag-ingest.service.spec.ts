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

  it('skips a same-tenant document with an existing file hash', async () => {
    const findFirst = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        id: BigInt(9),
        fileName: 'existing.md',
        sourcePath: 'existing.md',
        status: 'ready',
      });
    service = new RagIngestService(
      { aplusDocument: { findFirst } } as any,
      { loadDocument: jest.fn() } as any,
      {
        setContext: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
      } as any,
      { tenant: 'aplus' } as any,
    );

    const result = await service.ingestFiles([
      {
        absolutePath: '/raw/aplus/new.md',
        sourcePath: 'new.md',
        fileName: 'new.md',
        fileType: 'md',
        documentType: '',
        fileHash: 'same-hash',
        fileSize: 12,
      },
    ]);

    expect(result.skippedFiles).toBe(1);
    expect(result.files[0]).toMatchObject({
      status: 'skipped',
      reason: 'duplicate hash',
      duplicateOf: { documentId: '9', fileName: 'existing.md' },
    });
  });

  it('maps a concurrent file-hash unique conflict to duplicate', async () => {
    const findFirst = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        id: BigInt(11),
        fileName: 'winner.md',
        sourcePath: 'winner.md',
        status: 'ready',
      });
    const ragPrisma = {
      aplusDocument: { findFirst },
      $transaction: jest.fn().mockRejectedValue({
        code: 'P2010',
        meta: {
          code: '23505',
          message:
            'duplicate key violates unique constraint aplus_documents_tenant_code_file_hash_key',
        },
      }),
    };
    service = new RagIngestService(
      ragPrisma as any,
      {
        loadDocument: jest.fn().mockResolvedValue({
          sourcePath: 'new.md',
          fileName: 'new.md',
          fileType: 'md',
          documentType: '',
          fileHash: 'same-hash',
          fileSize: 12,
          segments: [{ text: 'content', metadata: {} }],
        }),
      } as any,
      {
        setContext: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
      } as any,
      { tenant: 'aplus' } as any,
    );

    const result = await service.ingestFiles([
      {
        absolutePath: '/raw/aplus/new.md',
        sourcePath: 'new.md',
        fileName: 'new.md',
        fileType: 'md',
        documentType: '',
        fileHash: 'same-hash',
        fileSize: 12,
      },
    ]);

    expect(result).toMatchObject({
      indexedFiles: 0,
      skippedFiles: 1,
      failedFiles: 0,
    });
    expect(result.files[0]).toMatchObject({
      status: 'skipped',
      reason: 'duplicate hash',
      duplicateOf: { documentId: '11', fileName: 'winner.md' },
    });
  });
});
