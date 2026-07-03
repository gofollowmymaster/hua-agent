import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { Prisma } from '@prisma/rag-client';
import { TenantCode } from '@src/config/tenant';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { NodeConfigService } from '@src/config/node-config.service';
import type { IngestSummary, LoadedDocument } from '../types/rag.type';
import { DocumentLoaderService } from './document-loader.service';
import { RagPrismaService } from './prisma/rag-prisma.service';

@Injectable()
export class RagIngestService {
  private readonly embeddings: OpenAIEmbeddings;
  private readonly splitter: RecursiveCharacterTextSplitter;
  private readonly embeddingBatchSize: number;

  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly loader: DocumentLoaderService,
    private readonly logger: LoggerService,
    private readonly tenantContext: TenantContext,
  ) {
    this.logger.setContext(RagIngestService.name);

    const ragConfig = NodeConfigService.get('vcHelper');
    this.embeddingBatchSize = ragConfig.embeddingBatchSize;

    this.embeddings = new OpenAIEmbeddings({
      apiKey: NodeConfigService.get('embeddingsApiKey'),
      model: NodeConfigService.get('embeddingsModelName'),
      dimensions: NodeConfigService.get('embeddingsDimensions'),
      configuration: {
        baseURL: NodeConfigService.get('embeddingsBaseUrl'),
      },
    });

    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: ragConfig.chunkSize,
      chunkOverlap: ragConfig.chunkOverlap,
      separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?', ' ', ''],
    });
  }

  async ingest(options: { force?: boolean } = {}): Promise<IngestSummary> {
    const tenantCode = this.currentTenant();
    const ingestStart = Date.now();
    this.logIngestProgress({
      stage: 'scan_start',
      tenantCode,
      force: Boolean(options.force),
    });

    const files = await this.loader.scanRawFiles(tenantCode);
    this.logIngestProgress({
      stage: 'scan_done',
      tenantCode,
      force: Boolean(options.force),
      totalFiles: files.length,
      durationMs: Date.now() - ingestStart,
    });

    const summary: IngestSummary = {
      scannedFiles: files.length,
      indexedFiles: 0,
      skippedFiles: 0,
      failedFiles: 0,
      chunks: 0,
      files: [],
    };

    for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
      const file = files[fileIndex];
      const fileStart = Date.now();
      const fileLogContext = {
        fileIndex: fileIndex + 1,
        totalFiles: files.length,
        sourcePath: file.sourcePath,
        fileName: file.fileName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        tenantCode,
      };

      this.logIngestProgress({
        stage: 'file_start',
        ...fileLogContext,
      });

      const existing = await this.findDocumentBySourcePath(
        tenantCode,
        file.sourcePath,
      );
      if (
        existing &&
        existing.file_hash === file.fileHash &&
        existing.status === 'ready' &&
        !options.force
      ) {
        summary.skippedFiles += 1;
        summary.files.push({
          sourcePath: file.sourcePath,
          status: 'skipped',
          reason: 'hash unchanged',
        });
        this.logIngestProgress({
          stage: 'file_skip',
          ...fileLogContext,
          reason: 'hash unchanged',
          durationMs: Date.now() - fileStart,
        });
        continue;
      }

      try {
        const document = await this.loader.loadDocument(file);
        this.logIngestProgress({
          stage: 'file_load_done',
          ...fileLogContext,
          segments: document.segments.length,
          durationMs: Date.now() - fileStart,
        });

        const chunks = await this.buildChunks(tenantCode, document);
        this.logIngestProgress({
          stage: 'file_chunk_done',
          ...fileLogContext,
          segments: document.segments.length,
          chunks: chunks.length,
          durationMs: Date.now() - fileStart,
        });

        if (chunks.length === 0) {
          throw new BadRequestException('no extractable text');
        }

        const documentId = await this.replaceDocumentChunks(
          tenantCode,
          document,
          chunks,
          fileLogContext,
          fileStart,
        );

        summary.indexedFiles += 1;
        summary.chunks += chunks.length;
        summary.files.push({
          sourcePath: file.sourcePath,
          status: 'indexed',
          chunks: chunks.length,
        });
        this.logIngestProgress({
          stage: 'file_indexed',
          ...fileLogContext,
          documentId,
          chunks: chunks.length,
          durationMs: Date.now() - fileStart,
        });
      } catch (error) {
        summary.failedFiles += 1;
        const message = error instanceof Error ? error.message : String(error);
        await this.markDocumentFailed(tenantCode, file, message);
        summary.files.push({
          sourcePath: file.sourcePath,
          status: 'failed',
          reason: message,
        });
        this.logger.error('RAG ingest progress', undefined, {
          stage: 'file_failed',
          ...fileLogContext,
          error: message,
          durationMs: Date.now() - fileStart,
        });
      }
    }

    this.logIngestProgress({
      stage: 'ingest_done',
      tenantCode,
      force: Boolean(options.force),
      durationMs: Date.now() - ingestStart,
      summary,
    });

    return summary;
  }

  private async buildChunks(tenantCode: TenantCode, document: LoadedDocument) {
    const chunks: Array<{
      content: string;
      metadata: Record<string, unknown>;
    }> = [];

    for (const segment of document.segments) {
      const splitTexts = await this.splitter.splitText(segment.text);
      for (const text of splitTexts) {
        const content = text.trim();
        if (!content) continue;
        chunks.push({
          content,
          metadata: {
            ...segment.metadata,
            sourcePath: document.sourcePath,
            fileName: document.fileName,
            fileType: document.fileType,
            tenantCode,
          },
        });
      }
    }

    return chunks;
  }

  private async replaceDocumentChunks(
    tenantCode: TenantCode,
    document: LoadedDocument,
    chunks: Array<{ content: string; metadata: Record<string, unknown> }>,
    logContext?: Record<string, unknown>,
    fileStart?: number,
  ): Promise<string> {
    this.logIngestProgress({
      stage: 'file_embed_start',
      ...logContext,
      chunks: chunks.length,
      batchSize: this.embeddingBatchSize,
      durationMs: fileStart ? Date.now() - fileStart : undefined,
    });

    const embeddings = await this.embedInBatches(
      chunks.map((item) => item.content),
    );

    this.logIngestProgress({
      stage: 'file_embed_done',
      ...logContext,
      chunks: chunks.length,
      batchSize: this.embeddingBatchSize,
      durationMs: fileStart ? Date.now() - fileStart : undefined,
    });

    return this.ragPrisma.$transaction(async (client) => {
      const documentId = await this.upsertProcessingDocument(
        client,
        tenantCode,
        document,
      );
      this.logIngestProgress({
        stage: 'file_write_start',
        ...logContext,
        documentId,
        chunks: chunks.length,
        durationMs: fileStart ? Date.now() - fileStart : undefined,
      });

      await client.$executeRaw`
        DELETE FROM aplus_chunks
        WHERE tenant_code = ${tenantCode}
          AND document_id = ${documentId}::bigint
      `;

      for (let index = 0; index < chunks.length; index += 1) {
        await client.$executeRaw`
          INSERT INTO aplus_chunks
            (tenant_code, document_id, chunk_index, content, metadata, embedding)
          VALUES (
            ${tenantCode},
            ${documentId}::bigint,
            ${index},
            ${chunks[index].content},
            ${JSON.stringify(chunks[index].metadata)}::jsonb,
            ${JSON.stringify(embeddings[index])}::vector
          )
        `;
      }

      await client.$executeRaw`
        UPDATE aplus_documents
        SET chunk_count = ${chunks.length},
            status = 'ready',
            error = NULL,
            updated_at = CURRENT_TIMESTAMP,
            ingested_at = CURRENT_TIMESTAMP
        WHERE id = ${documentId}::bigint
          AND tenant_code = ${tenantCode}
      `;

      this.logIngestProgress({
        stage: 'file_write_done',
        ...logContext,
        documentId,
        chunks: chunks.length,
        durationMs: fileStart ? Date.now() - fileStart : undefined,
      });

      return documentId;
    });
  }

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

  private async upsertProcessingDocument(
    client: Prisma.TransactionClient,
    tenantCode: TenantCode,
    document: LoadedDocument,
  ): Promise<string> {
    const result = await client.$queryRaw<Array<{ id: bigint }>>`
      INSERT INTO aplus_documents
        (tenant_code, source_path, file_name, file_type, file_hash, file_size, status, updated_at)
      VALUES (
        ${tenantCode},
        ${document.sourcePath},
        ${document.fileName},
        ${document.fileType},
        ${document.fileHash},
        ${document.fileSize},
        'processing',
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (tenant_code, source_path) DO UPDATE
      SET file_name = EXCLUDED.file_name,
          file_type = EXCLUDED.file_type,
          file_hash = EXCLUDED.file_hash,
          file_size = EXCLUDED.file_size,
          status = 'processing',
          error = NULL,
          updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;

    const id = result[0]?.id;
    if (!id) {
      throw new InternalServerErrorException('failed to upsert document');
    }

    return String(id);
  }

  private async markDocumentFailed(
    tenantCode: TenantCode,
    file: {
      sourcePath: string;
      fileName: string;
      fileType: string;
      fileHash: string;
      fileSize: number;
    },
    error: string,
  ) {
    await this.ragPrisma.$executeRaw`
      INSERT INTO aplus_documents
        (tenant_code, source_path, file_name, file_type, file_hash, file_size, chunk_count, status, error, updated_at)
      VALUES (
        ${tenantCode},
        ${file.sourcePath},
        ${file.fileName},
        ${file.fileType},
        ${file.fileHash},
        ${file.fileSize},
        0,
        'failed',
        ${error},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (tenant_code, source_path) DO UPDATE
      SET file_name = EXCLUDED.file_name,
          file_type = EXCLUDED.file_type,
          file_hash = EXCLUDED.file_hash,
          file_size = EXCLUDED.file_size,
          chunk_count = 0,
          status = 'failed',
          error = EXCLUDED.error,
          updated_at = CURRENT_TIMESTAMP
    `;
  }

  private async findDocumentBySourcePath(
    tenantCode: TenantCode,
    sourcePath: string,
  ) {
    const document = await this.ragPrisma.aplusDocument.findFirst({
      where: { tenantCode, sourcePath },
      select: {
        id: true,
        fileHash: true,
        status: true,
      },
    });

    if (!document) return undefined;

    return {
      id: document.id,
      file_hash: document.fileHash,
      status: document.status,
    };
  }

  private logIngestProgress(meta: Record<string, unknown>) {
    const cleanMeta = Object.fromEntries(
      Object.entries(meta).filter(([, value]) => value !== undefined),
    );
    this.logger.info('RAG ingest progress' + meta.stage, undefined, cleanMeta);
  }

  private currentTenant(): TenantCode {
    return this.tenantContext.tenant ?? NodeConfigService.get('defaultTenant');
  }
}
