import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type pg from 'pg';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { getRagConfig } from './rag.config';
import { DocumentLoaderService } from './services/document-loader.service';
import { RagDatabaseService } from './services/rag-database.service';
import type { IngestSummary, LoadedDocument, RetrievedChunk } from './types';

type RagStreamEvent =
  | {
      type: 'status';
      data: {
        stage: string;
        message: string;
        topK?: number;
        chunks?: number;
      };
    }
  | { type: 'answer'; data: string }
  | { type: 'done'; data: { stage: string; message: string } };

@Injectable()
export class RagService {
  private readonly embeddings: OpenAIEmbeddings;
  private readonly model: ChatOpenAI;
  private readonly splitter: RecursiveCharacterTextSplitter;
  private readonly embeddingBatchSize: number;
  private readonly defaultTopK: number;

  constructor(
    private readonly db: RagDatabaseService,
    private readonly loader: DocumentLoaderService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(RagService.name);

    const config = getRagConfig();
    this.embeddingBatchSize = config.embeddingBatchSize;
    this.defaultTopK = config.defaultTopK;

    this.embeddings = new OpenAIEmbeddings({
      apiKey: config.embeddingsApiKey,
      model: config.embeddingsModelName,
      dimensions: config.embeddingsDimensions,
      configuration: {
        baseURL: config.embeddingsBaseUrl,
      },
    });

    this.model = new ChatOpenAI({
      temperature: 0,
      model: config.modelName,
      apiKey: config.openAiApiKey,
      configuration: {
        baseURL: config.openAiBaseUrl,
      },
    });

    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap,
      separators: ['\n\n', '\n', '。', '！', '？', '.', '!', '?', ' ', ''],
    });
  }

  async ingest(options: { force?: boolean } = {}): Promise<IngestSummary> {
    const ingestStart = Date.now();
    this.logIngestProgress({
      stage: 'scan_start',
      force: Boolean(options.force),
    });

    const files = await this.loader.scanRawFiles();
    this.logIngestProgress({
      stage: 'scan_done',
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
      };

      this.logIngestProgress({
        stage: 'file_start',
        ...fileLogContext,
      });

      const existing = await this.findDocumentBySourcePath(file.sourcePath);
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

        const chunks = await this.buildChunks(document);
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
        await this.markDocumentFailed(file, message);
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
      force: Boolean(options.force),
      durationMs: Date.now() - ingestStart,
      summary,
    });

    return summary;
  }

  async answerQuestion(question: string, topK?: number) {
    this.assertQuestion(question);
    const chunks = await this.retrieve(question, topK);
    const answer = await this.generateAnswer(question, chunks);

    return {
      answer,
      sources: this.buildSources(chunks),
      chunks,
    };
  }

  async *streamAnswer(
    question: string,
    topK?: number,
  ): AsyncGenerator<RagStreamEvent> {
    this.assertQuestion(question);
    yield {
      type: 'status',
      data: {
        stage: 'retrieve_start',
        message: '开始检索知识库',
        topK,
      },
    };

    const chunks = await this.retrieve(question, topK);
    yield {
      type: 'status',
      data: {
        stage: 'retrieve_done',
        message: `检索完成，命中 ${chunks.length} 个片段`,
        topK,
        chunks: chunks.length,
      },
    };

    const prompt = await this.buildPrompt(question, chunks);
    yield {
      type: 'status',
      data: {
        stage: 'generate_start',
        message: '开始生成答案',
        topK,
        chunks: chunks.length,
      },
    };

    const stream = await this.model.stream(prompt);
    let hasText = false;

    for await (const chunk of stream) {
      const text = this.extractContentText(chunk.content);
      if (text) {
        hasText = true;
        yield { type: 'answer', data: text };
      }
    }

    if (!hasText) {
      this.logger.warn('RAG stream returned no text, fallback to invoke', undefined, {
        stage: 'rag_stream_empty_fallback',
        topK,
        chunks: chunks.length,
      });
      yield {
        type: 'status',
        data: {
          stage: 'fallback_start',
          message: '流式生成未返回文本，切换为普通生成',
          topK,
          chunks: chunks.length,
        },
      };

      const response = await this.model.invoke(prompt);
      const text =
        this.extractContentText(response.content) || JSON.stringify(response.content);
      if (text) yield { type: 'answer', data: text };
    }

    yield {
      type: 'done',
      data: {
        stage: 'done',
        message: '生成完成',
      },
    };
  }

  async listDocuments() {
    const result = await this.db.query(
      `SELECT d.id,
              d.source_path,
              d.file_name,
              d.file_type,
              d.file_hash,
              d.file_size,
              d.chunk_count,
              d.status,
              d.error,
              d.created_at,
              d.updated_at,
              d.ingested_at,
              COUNT(c.id)::int AS actual_chunk_count
       FROM aplus_documents d
       LEFT JOIN aplus_chunks c ON c.document_id = d.id
       GROUP BY d.id
       ORDER BY d.updated_at DESC`,
    );

    return result.rows;
  }

  async deleteDocument(id: number) {
    const result = await this.db.query(
      'DELETE FROM aplus_documents WHERE id = $1 RETURNING id, source_path',
      [id],
    );

    if (result.rowCount === 0) {
      throw new BadRequestException(`Document #${id} not found`);
    }

    return { deleted: result.rows[0] };
  }

  private async retrieve(
    question: string,
    topK = this.defaultTopK,
  ): Promise<RetrievedChunk[]> {
    const limit = Math.min(Math.max(Number(topK) || this.defaultTopK, 1), 20);
    const vector = await this.embeddings.embedQuery(question);
    const result = await this.db.query(
      `SELECT c.id,
              c.document_id,
              c.chunk_index,
              c.content,
              c.metadata,
              d.file_name,
              d.source_path,
              1 - (c.embedding <=> $1::vector) AS similarity
       FROM aplus_chunks c
       JOIN aplus_documents d ON d.id = c.document_id
       WHERE c.embedding IS NOT NULL
       ORDER BY c.embedding <=> $1::vector
       LIMIT $2`,
      [JSON.stringify(vector), limit],
    );

    return result.rows.map((row) => ({
      id: String(row.id),
      documentId: String(row.document_id),
      fileName: row.file_name,
      sourcePath: row.source_path,
      chunkIndex: Number(row.chunk_index),
      content: row.content,
      metadata: row.metadata ?? {},
      similarity: Number(row.similarity),
    }));
  }

  private async generateAnswer(question: string, chunks: RetrievedChunk[]) {
    const prompt = await this.buildPrompt(question, chunks);
    const response = await this.model.invoke(prompt);

    return (
      this.extractContentText(response.content) || JSON.stringify(response.content)
    );
  }

  private extractContentText(content: unknown): string {
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return '';

    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (!part || typeof part !== 'object') return '';

        const item = part as Record<string, unknown>;
        if (typeof item.text === 'string') return item.text;
        if (typeof item.content === 'string') return item.content;

        return '';
      })
      .join('');
  }

  private async buildPrompt(question: string, chunks: RetrievedChunk[]) {
    const prompt =
      PromptTemplate.fromTemplate(`你是企业知识库 RAG 问答助手。请只基于给定资料回答问题。

如果资料中没有足够信息，请明确说“根据当前资料无法确认”，不要编造。
回答应简洁、准确，并在必要时引用来源文件名。

资料片段：
{context}

用户问题：{question}

回答：`);

    const promptValue = await prompt.invoke({
      question,
      context: this.formatContext(chunks),
    });
    return promptValue.toString();
  }

  private formatContext(chunks: RetrievedChunk[]) {
    if (chunks.length === 0) {
      return '未检索到相关资料。';
    }

    return chunks
      .map((chunk, index) => {
        const location = this.formatLocation(chunk.metadata);
        return `[片段 ${index + 1}]
来源：${chunk.fileName}${location ? `（${location}）` : ''}
相似度：${chunk.similarity.toFixed(4)}
内容：
${chunk.content}`;
      })
      .join('\n\n---\n\n');
  }

  private buildSources(chunks: RetrievedChunk[]) {
    const sourceMap = new Map<string, any>();
    for (const chunk of chunks) {
      const key = `${chunk.documentId}:${this.formatLocation(chunk.metadata)}`;
      if (!sourceMap.has(key)) {
        sourceMap.set(key, {
          documentId: chunk.documentId,
          fileName: chunk.fileName,
          sourcePath: chunk.sourcePath,
          location: this.formatLocation(chunk.metadata),
          bestSimilarity: chunk.similarity,
        });
      }
    }

    return Array.from(sourceMap.values());
  }

  private async buildChunks(document: LoadedDocument) {
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
          },
        });
      }
    }

    return chunks;
  }

  private async replaceDocumentChunks(
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

    return this.db.transaction(async (client) => {
      const documentId = await this.upsertProcessingDocument(client, document);
      this.logIngestProgress({
        stage: 'file_write_start',
        ...logContext,
        documentId,
        chunks: chunks.length,
        durationMs: fileStart ? Date.now() - fileStart : undefined,
      });

      await client.query('DELETE FROM aplus_chunks WHERE document_id = $1', [
        documentId,
      ]);

      for (let index = 0; index < chunks.length; index += 1) {
        await client.query(
          `INSERT INTO aplus_chunks
             (document_id, chunk_index, content, metadata, embedding)
           VALUES ($1, $2, $3, $4::jsonb, $5::vector)`,
          [
            documentId,
            index,
            chunks[index].content,
            JSON.stringify(chunks[index].metadata),
            JSON.stringify(embeddings[index]),
          ],
        );
      }

      await client.query(
        `UPDATE aplus_documents
         SET chunk_count = $2,
             status = 'ready',
             error = NULL,
             updated_at = CURRENT_TIMESTAMP,
             ingested_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [documentId, chunks.length],
      );

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
    client: pg.PoolClient,
    document: LoadedDocument,
  ): Promise<string> {
    const result = await client.query(
      `INSERT INTO aplus_documents
         (source_path, file_name, file_type, file_hash, file_size, status, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'processing', CURRENT_TIMESTAMP)
       ON CONFLICT (source_path) DO UPDATE
       SET file_name = EXCLUDED.file_name,
           file_type = EXCLUDED.file_type,
           file_hash = EXCLUDED.file_hash,
           file_size = EXCLUDED.file_size,
           status = 'processing',
           error = NULL,
           updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [
        document.sourcePath,
        document.fileName,
        document.fileType,
        document.fileHash,
        document.fileSize,
      ],
    );

    const id = result.rows[0]?.id;
    if (!id) {
      throw new InternalServerErrorException('failed to upsert document');
    }

    return String(id);
  }

  private async markDocumentFailed(
    file: {
      sourcePath: string;
      fileName: string;
      fileType: string;
      fileHash: string;
      fileSize: number;
    },
    error: string,
  ) {
    await this.db.query(
      `INSERT INTO aplus_documents
         (source_path, file_name, file_type, file_hash, file_size, chunk_count, status, error, updated_at)
       VALUES ($1, $2, $3, $4, $5, 0, 'failed', $6, CURRENT_TIMESTAMP)
       ON CONFLICT (source_path) DO UPDATE
       SET file_name = EXCLUDED.file_name,
           file_type = EXCLUDED.file_type,
           file_hash = EXCLUDED.file_hash,
           file_size = EXCLUDED.file_size,
           chunk_count = 0,
           status = 'failed',
           error = EXCLUDED.error,
           updated_at = CURRENT_TIMESTAMP`,
      [
        file.sourcePath,
        file.fileName,
        file.fileType,
        file.fileHash,
        file.fileSize,
        error,
      ],
    );
  }

  private async findDocumentBySourcePath(sourcePath: string) {
    const result = await this.db.query(
      'SELECT id, file_hash, status FROM aplus_documents WHERE source_path = $1',
      [sourcePath],
    );

    return result.rows[0] as
      | { id: string; file_hash: string; status: string }
      | undefined;
  }

  private formatLocation(metadata: Record<string, unknown>) {
    if (metadata.page) return `第 ${metadata.page} 页`;
    if (metadata.sheet) return `工作表 ${metadata.sheet}`;
    if (metadata.slide) return `第 ${metadata.slide} 页幻灯片`;
    return '';
  }

  private assertQuestion(question: string) {
    if (!question || !question.trim()) {
      throw new BadRequestException('question is required');
    }
  }

  private logIngestProgress(meta: Record<string, unknown>) {
    const cleanMeta = Object.fromEntries(
      Object.entries(meta).filter(([, value]) => value !== undefined),
    );
    this.logger.info('RAG ingest progress' + meta.stage, undefined, cleanMeta);
  }
}
