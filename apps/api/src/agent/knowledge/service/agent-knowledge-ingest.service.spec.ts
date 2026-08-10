import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { AgentKnowledgeIngestService } from './agent-knowledge-ingest.service';

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
      if (key === 'agentKnowledge') {
        return {
          docsDir:
            (global as any).__agentKnowledgeDocsRoot ??
            '/tmp/agent-knowledge-docs',
          chunkSize: 800,
          chunkOverlap: 120,
          embeddingBatchSize: 10,
        };
      }
      if (key === 'embeddingsApiKey') return 'test-key';
      if (key === 'embeddingsModelName') return 'test-model';
      if (key === 'embeddingsDimensions') return 2;
      if (key === 'embeddingsBaseUrl') return 'http://localhost';
      return undefined;
    }),
  },
}));

describe('AgentKnowledgeIngestService', () => {
  let docsRoot: string;

  beforeEach(async () => {
    docsRoot = await fs.mkdtemp(
      path.join(os.tmpdir(), 'agent-knowledge-ingest-'),
    );
    (global as any).__agentKnowledgeDocsRoot = docsRoot;
  });

  afterEach(async () => {
    await fs.rm(docsRoot, { recursive: true, force: true });
  });

  it('only ingests Markdown files and ignores other file types', async () => {
    const categoryRoot = path.join(docsRoot, 'yurex');
    await fs.mkdir(categoryRoot, { recursive: true });
    await fs.writeFile(
      path.join(categoryRoot, 'guide.md'),
      '---\n远程文档: "https://example.com"\n---\n\n# 指南\n\n正文',
      'utf8',
    );
    await fs.writeFile(
      path.join(categoryRoot, '原始数据.xlsx'),
      'binary-data',
      'binary',
    );
    const service = buildService();

    const result = await service.ingest({ tenantCode: 'yurex' });

    expect(result).toMatchObject({
      scannedFiles: 1,
      indexedFiles: 1,
      failedFiles: 0,
    });
    expect(result.files[0]).toMatchObject({
      sourcePath: path.join('yurex', 'guide.md'),
      status: 'indexed',
    });
  });

  it('skips unchanged documents when force is false', async () => {
    const categoryRoot = path.join(docsRoot, 'yurex');
    await fs.mkdir(categoryRoot, { recursive: true });
    const content = '# 指南\n\n正文';
    await fs.mkdir(path.join(categoryRoot, 'Yurex业务流程'), {
      recursive: true,
    });
    await fs.writeFile(
      path.join(categoryRoot, 'Yurex业务流程', 'guide.md'),
      content,
      'utf8',
    );
    const fileHash = crypto.createHash('sha256').update(content).digest('hex');
    const findFirst = jest.fn().mockResolvedValue({
      id: BigInt(1),
      fileHash,
      status: 'ready',
      category: '业务流程',
    });
    const service = new AgentKnowledgeIngestService(
      { agentDocument: { findFirst } } as any,
      {
        setContext: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
      } as any,
    );

    const result = await service.ingest({ tenantCode: 'yurex' });

    expect(result).toMatchObject({
      scannedFiles: 1,
      indexedFiles: 0,
      skippedFiles: 1,
    });
    expect(result.files[0]).toMatchObject({
      status: 'skipped',
      reason: 'hash unchanged',
    });
  });
});

function buildService() {
  const client = {
    $queryRaw: jest.fn().mockResolvedValue([{ id: BigInt(1) }]),
    $executeRaw: jest.fn().mockResolvedValue(undefined),
  };
  const ragPrisma = {
    agentDocument: {
      findFirst: jest.fn().mockResolvedValue(undefined),
    },
    $transaction: jest.fn(
      async (callback: (transaction: unknown) => Promise<unknown>) =>
        callback(client),
    ),
  };
  return new AgentKnowledgeIngestService(
    ragPrisma as any,
    {
      setContext: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
    } as any,
  );
}
