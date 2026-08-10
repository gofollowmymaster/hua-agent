import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { Prisma } from '@prisma/rag-client';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';
import { NodeConfigService } from '@src/config/node-config.service';
import {
  cleanAgentKnowledgeMarkdown,
  parseAgentKnowledgeDocument,
  resolveAgentKnowledgeCategory,
} from '../agent-knowledge-document.util';
import type {
  AgentKnowledgeDocumentFile,
  AgentKnowledgeIngestSummary,
} from '../type/agent-knowledge.type';

const IGNORED_NAMES = new Set(['.DS_Store']);

/** 编排业务 Agent docs 目录的扫描、清洗、切分、向量化和独立表持久化。 */
@Injectable()
export class AgentKnowledgeIngestService {
  private readonly docsRoot: string;
  private readonly embeddings: OpenAIEmbeddings;
  private readonly splitter: RecursiveCharacterTextSplitter;
  private readonly embeddingBatchSize: number;

  /** 根据集中配置初始化 docs 根目录、向量模型和文本切分策略。 */
  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(AgentKnowledgeIngestService.name);
    const config = NodeConfigService.get('agentKnowledge');
    this.docsRoot = path.resolve(process.cwd(), config.docsDir);
    this.embeddingBatchSize = config.embeddingBatchSize;
    this.embeddings = new OpenAIEmbeddings({
      apiKey: NodeConfigService.get('embeddingsApiKey'),
      model: NodeConfigService.get('embeddingsModelName'),
      dimensions: NodeConfigService.get('embeddingsDimensions'),
      configuration: {
        baseURL: NodeConfigService.get('embeddingsBaseUrl'),
      },
    });
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap,
      separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?', ' ', ''],
    });
  }

  /** 扫描 docs 下全部或指定租户目录，并汇总各租户入库结果。 */
  async ingest(options: { force?: boolean; tenantCode?: string } = {}) {
    const force = Boolean(options.force);
    const categories = options.tenantCode
      ? [options.tenantCode]
      : await this.listCategories();
    const summaries: AgentKnowledgeIngestSummary[] = [];

    for (const category of categories) {
      const files = await this.scanCategoryFiles(category);
      summaries.push(await this.ingestFiles(files, force));
    }

    return this.mergeSummaries(summaries);
  }

  /** 返回 docs 根目录下的一级目录名，作为租户来源。 */
  private async listCategories(): Promise<string[]> {
    try {
      const entries = await fs.readdir(this.docsRoot, {
        withFileTypes: true,
      });
      return entries
        .filter(
          (entry) => entry.isDirectory() && !IGNORED_NAMES.has(entry.name),
        )
        .map((entry) => entry.name);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
  }

  /** 递归扫描单个租户目录下的 Markdown 文件并构造入库文件描述。 */
  private async scanCategoryFiles(
    category: string,
  ): Promise<AgentKnowledgeDocumentFile[]> {
    const categoryRoot = path.join(this.docsRoot, category);
    const absolutePaths = await this.walk(categoryRoot);
    const files: AgentKnowledgeDocumentFile[] = [];

    for (const absolutePath of absolutePaths) {
      const ext = path.extname(absolutePath).toLowerCase();
      if (ext !== '.md') continue;
      files.push(await this.buildDocumentFile(absolutePath, category));
    }

    return files;
  }

  /** 读取 Markdown 内容、元数据和文件信息，并返回清洗后的文档。 */
  private async buildDocumentFile(
    absolutePath: string,
    category: string,
  ): Promise<AgentKnowledgeDocumentFile> {
    const stat = await fs.stat(absolutePath);
    const raw = await fs.readFile(absolutePath, 'utf8');
    const parsed = parseAgentKnowledgeDocument(raw);
    const sourcePath = path.relative(this.docsRoot, absolutePath);
    return {
      absolutePath,
      tenantCode: category,
      category: resolveAgentKnowledgeCategory(category, sourcePath),
      sourcePath,
      fileName: path.basename(absolutePath),
      fileType: 'md',
      fileHash: await this.hashFile(absolutePath),
      fileSize: stat.size,
      metadata: parsed.metadata,
      content: cleanAgentKnowledgeMarkdown(parsed.content),
    };
  }

  /** 逐个处理文件并汇总索引、跳过和失败结果。 */
  private async ingestFiles(
    files: AgentKnowledgeDocumentFile[],
    force: boolean,
  ): Promise<AgentKnowledgeIngestSummary> {
    const summary: AgentKnowledgeIngestSummary = {
      scannedFiles: files.length,
      indexedFiles: 0,
      skippedFiles: 0,
      failedFiles: 0,
      chunks: 0,
      files: [],
    };

    for (const file of files) {
      const existing = await this.findDocumentBySourcePath(
        file.tenantCode,
        file.sourcePath,
      );
      const duplicate = await this.findDocumentByHash(
        file.tenantCode,
        file.fileHash,
      );
      if (duplicate && duplicate.id !== existing?.id) {
        summary.skippedFiles += 1;
        summary.files.push({
          sourcePath: file.sourcePath,
          status: 'skipped',
          reason: 'duplicate hash',
        });
        continue;
      }
      if (
        existing &&
        existing.fileHash === file.fileHash &&
        existing.status === 'ready' &&
        existing.category === file.category &&
        !force
      ) {
        summary.skippedFiles += 1;
        summary.files.push({
          sourcePath: file.sourcePath,
          status: 'skipped',
          reason: 'hash unchanged',
        });
        continue;
      }

      try {
        const chunks = await this.buildChunks(file);
        if (chunks.length === 0) {
          throw new Error('no extractable content');
        }
        const documentId = await this.replaceDocumentChunks(file, chunks);
        summary.indexedFiles += 1;
        summary.chunks += chunks.length;
        summary.files.push({
          sourcePath: file.sourcePath,
          status: 'indexed',
          documentId,
          chunks: chunks.length,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await this.markDocumentFailed(file, message);
        summary.failedFiles += 1;
        summary.files.push({
          sourcePath: file.sourcePath,
          status: 'failed',
          reason: message,
        });
      }
    }

    return summary;
  }

  /** 将清洗后的 Markdown 正文切成检索块并附加来源元数据。 */
  private async buildChunks(file: AgentKnowledgeDocumentFile) {
    const chunks: Array<{
      content: string;
      metadata: Record<string, string>;
    }> = [];
    const splitTexts = await this.splitter.splitText(file.content);

    for (const text of splitTexts) {
      const content = text.trim();
      if (!content) continue;
      chunks.push({
        content,
        metadata: {
          ...file.metadata,
          tenantCode: file.tenantCode,
          category: file.category,
          sourcePath: file.sourcePath,
          fileName: file.fileName,
          fileType: file.fileType,
        },
      });
    }

    return chunks;
  }

  /** 生成切片向量，并在事务中原子替换文档及其全部切片。 */
  private async replaceDocumentChunks(
    file: AgentKnowledgeDocumentFile,
    chunks: Array<{
      content: string;
      metadata: Record<string, string>;
    }>,
  ): Promise<string> {
    const embeddings = await this.embedInBatches(
      chunks.map((item) => item.content),
    );

    return this.ragPrisma.$transaction(async (client) => {
      const documentId = await this.upsertProcessingDocument(client, file);
      await client.$executeRaw`
        DELETE FROM agent_chunks
        WHERE tenant_code = ${file.tenantCode}
          AND document_id = ${documentId}::bigint
      `;

      for (let index = 0; index < chunks.length; index += 1) {
        await client.$executeRaw`
          INSERT INTO agent_chunks
            (tenant_code, document_id, chunk_index, content, metadata, embedding)
          VALUES (
            ${file.tenantCode},
            ${documentId}::bigint,
            ${index},
            ${chunks[index].content},
            ${JSON.stringify(chunks[index].metadata)}::jsonb,
            ${JSON.stringify(embeddings[index])}::vector
          )
        `;
      }

      await client.$executeRaw`
        UPDATE agent_documents
        SET chunk_count = ${chunks.length},
            status = 'ready',
            error = NULL,
            updated_at = CURRENT_TIMESTAMP,
            ingested_at = CURRENT_TIMESTAMP
        WHERE id = ${documentId}::bigint
          AND tenant_code = ${file.tenantCode}
      `;

      return documentId;
    });
  }

  /** 按配置批量生成文本向量，避免单次 embedding 请求过大。 */
  private async embedInBatches(texts: string[]) {
    const result: number[][] = [];
    for (
      let index = 0;
      index < texts.length;
      index += this.embeddingBatchSize
    ) {
      const batch = texts.slice(index, index + this.embeddingBatchSize);
      result.push(...(await this.embeddings.embedDocuments(batch)));
    }
    return result;
  }

  /** 新建或更新处理中的文档记录并返回稳定文档 ID。 */
  private async upsertProcessingDocument(
    client: Prisma.TransactionClient,
    file: AgentKnowledgeDocumentFile,
  ): Promise<string> {
    const result = await client.$queryRaw<Array<{ id: bigint }>>`
      INSERT INTO agent_documents
        (tenant_code, category, source_path, file_name, file_type, file_hash,
         file_size, status, metadata, remote_url, doc_id, wiki_node_id,
         last_modified_at, breadcrumb, source_type, current_version, updated_at)
      VALUES (
        ${file.tenantCode},
        ${file.category},
        ${file.sourcePath},
        ${file.fileName},
        ${file.fileType},
        ${file.fileHash},
        ${file.fileSize},
        'processing',
        ${JSON.stringify(file.metadata)}::jsonb,
        ${this.metadataValue(file.metadata, '远程文档')},
        ${this.metadataValue(file.metadata, '文档ID')},
        ${this.metadataValue(file.metadata, 'Wiki节点ID')},
        ${this.metadataValue(file.metadata, '最后修改时间')},
        ${this.metadataValue(file.metadata, '文档路径面包屑')},
        ${this.metadataValue(file.metadata, 'source_type')},
        ${this.metadataValue(file.metadata, '当前版本')},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (tenant_code, source_path) DO UPDATE
      SET category = EXCLUDED.category,
          file_name = EXCLUDED.file_name,
          file_type = EXCLUDED.file_type,
          file_hash = EXCLUDED.file_hash,
          file_size = EXCLUDED.file_size,
          status = 'processing',
          error = NULL,
          metadata = EXCLUDED.metadata,
          remote_url = EXCLUDED.remote_url,
          doc_id = EXCLUDED.doc_id,
          wiki_node_id = EXCLUDED.wiki_node_id,
          last_modified_at = EXCLUDED.last_modified_at,
          breadcrumb = EXCLUDED.breadcrumb,
          source_type = EXCLUDED.source_type,
          current_version = EXCLUDED.current_version,
          updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const id = result[0]?.id;
    if (!id) {
      throw new InternalServerErrorException('failed to upsert document');
    }
    return String(id);
  }

  /** 将单个文档入库失败持久化为可排查状态。 */
  private async markDocumentFailed(
    file: AgentKnowledgeDocumentFile,
    error: string,
  ) {
    await this.ragPrisma.$executeRaw`
      INSERT INTO agent_documents
        (tenant_code, category, source_path, file_name, file_type, file_hash,
         file_size, chunk_count, status, error, metadata, remote_url, doc_id,
         wiki_node_id, last_modified_at, breadcrumb, source_type,
         current_version, updated_at)
      VALUES (
        ${file.tenantCode},
        ${file.category},
        ${file.sourcePath},
        ${file.fileName},
        ${file.fileType},
        ${file.fileHash},
        ${file.fileSize},
        0,
        'failed',
        ${error},
        ${JSON.stringify(file.metadata)}::jsonb,
        ${this.metadataValue(file.metadata, '远程文档')},
        ${this.metadataValue(file.metadata, '文档ID')},
        ${this.metadataValue(file.metadata, 'Wiki节点ID')},
        ${this.metadataValue(file.metadata, '最后修改时间')},
        ${this.metadataValue(file.metadata, '文档路径面包屑')},
        ${this.metadataValue(file.metadata, 'source_type')},
        ${this.metadataValue(file.metadata, '当前版本')},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (tenant_code, source_path) DO UPDATE
      SET category = EXCLUDED.category,
          file_name = EXCLUDED.file_name,
          file_type = EXCLUDED.file_type,
          file_hash = EXCLUDED.file_hash,
          file_size = EXCLUDED.file_size,
          chunk_count = 0,
          status = 'failed',
          error = EXCLUDED.error,
          metadata = EXCLUDED.metadata,
          remote_url = EXCLUDED.remote_url,
          doc_id = EXCLUDED.doc_id,
          wiki_node_id = EXCLUDED.wiki_node_id,
          last_modified_at = EXCLUDED.last_modified_at,
          breadcrumb = EXCLUDED.breadcrumb,
          source_type = EXCLUDED.source_type,
          current_version = EXCLUDED.current_version,
          updated_at = CURRENT_TIMESTAMP
    `;
  }

  /** 按租户和来源路径查找文档当前哈希与状态。 */
  private async findDocumentBySourcePath(
    tenantCode: string,
    sourcePath: string,
  ) {
    const document = await this.ragPrisma.agentDocument.findFirst({
      where: { tenantCode, sourcePath },
      select: { id: true, fileHash: true, status: true, category: true },
    });
    if (!document) return undefined;
    return {
      id: String(document.id),
      fileHash: document.fileHash,
      status: document.status,
      category: document.category,
    };
  }

  /** 按租户和内容哈希查找文档，用于跨路径去重。 */
  private async findDocumentByHash(tenantCode: string, fileHash: string) {
    const document = await this.ragPrisma.agentDocument.findFirst({
      where: { tenantCode, fileHash },
      select: { id: true },
    });
    return document ? { id: String(document.id) } : undefined;
  }

  /** 计算文件内容 SHA-256 哈希。 */
  private async hashFile(filePath: string) {
    const buffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /** 递归收集目录下的普通文件并忽略系统文件。 */
  private async walk(dir: string): Promise<string[]> {
    let entries: Awaited<ReturnType<typeof fs.readdir>>;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }

    const files: string[] = [];
    for (const entry of entries) {
      if (IGNORED_NAMES.has(entry.name)) continue;
      const absolutePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await this.walk(absolutePath)));
      } else if (entry.isFile()) {
        files.push(absolutePath);
      }
    }
    return files;
  }

  /** 合并多个租户的入库汇总结果。 */
  private mergeSummaries(summaries: AgentKnowledgeIngestSummary[]) {
    return summaries.reduce<AgentKnowledgeIngestSummary>(
      (total, summary) => ({
        scannedFiles: total.scannedFiles + summary.scannedFiles,
        indexedFiles: total.indexedFiles + summary.indexedFiles,
        skippedFiles: total.skippedFiles + summary.skippedFiles,
        failedFiles: total.failedFiles + summary.failedFiles,
        chunks: total.chunks + summary.chunks,
        files: [...total.files, ...summary.files],
      }),
      {
        scannedFiles: 0,
        indexedFiles: 0,
        skippedFiles: 0,
        failedFiles: 0,
        chunks: 0,
        files: [],
      },
    );
  }

  /** 从元数据中读取指定键，未配置时返回空字符串。 */
  private metadataValue(metadata: Record<string, string>, key: string): string {
    return metadata[key]?.trim() ?? '';
  }
}
