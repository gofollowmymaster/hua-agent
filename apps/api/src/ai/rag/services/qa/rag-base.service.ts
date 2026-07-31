import { BadRequestException } from '@nestjs/common';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { NodeConfigService } from '@src/config/node-config.service';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RagPrismaService } from '../prisma/rag-prisma.service';
import { RagMemoryService } from './rag-memory.service';
import { PromptRegistryService } from '../../prompts/prompt.registry';
import type { UIMessage } from 'ai';
import type {
  RagQueryOptions,
  RagMemoryMessage,
  RetrievedChunk,
  RagStreamEvent,
  SourceItem,
  RagUserQuestion,
} from '../../types/rag.type';

/**
 * RAG 问答抽象基类
 *
 * 提供所有 RAG 问答子类共享的能力：
 * - embeddings / model 初始化
 * - 向量检索 (retrieve)
 * - 引用来源构建 (buildSources)
 * - 工具方法 (assertQuestion / extractContentText / extractLatestUserQuestion)
 *
 * 注意：使用 abstract class，不加 @Injectable()。
 * 子类构造函数需重复声明所有依赖（NestJS DI 限制）。
 */
export abstract class RagBaseService {
  protected readonly embeddings: OpenAIEmbeddings;
  protected readonly model: ChatOpenAI;
  protected readonly defaultTopK: number;

  constructor(
    protected readonly ragPrisma: RagPrismaService,
    protected readonly logger: LoggerService,
    protected readonly tenantContext: TenantContext,
    protected readonly ragMemoryService: RagMemoryService,
    protected readonly promptRegistry: PromptRegistryService,
  ) {
    this.logger.setContext(this.constructor.name);

    const ragConfig = NodeConfigService.get('vcHelper');
    this.defaultTopK = ragConfig.defaultTopK;

    this.embeddings = new OpenAIEmbeddings({
      apiKey: NodeConfigService.get('embeddingsApiKey'),
      model: NodeConfigService.get('embeddingsModelName'),
      dimensions: NodeConfigService.get('embeddingsDimensions'),
      configuration: {
        baseURL: NodeConfigService.get('embeddingsBaseUrl'),
      },
    });

    this.model = new ChatOpenAI({
      temperature: 0,
      model: NodeConfigService.get('modelName'),
      apiKey: NodeConfigService.get('openAiApiKey'),
      configuration: {
        baseURL: NodeConfigService.get('openAiBaseUrl'),
      },
    });
  }

  /**
   * PostgreSQL 向量余弦相似度检索
   */
  protected async retrieve(
    question: string,
    topK = this.defaultTopK,
  ): Promise<RetrievedChunk[]> {
    const tenantCode = this.tenantContext.tenant;
    const limit = Math.min(Math.max(Number(topK) || this.defaultTopK, 1), 20);
    const vector = await this.embeddings.embedQuery(question);
    const rows = await this.ragPrisma.$queryRaw<any[]>`
      SELECT c.id,
             c.tenant_code,
             c.document_id,
             c.chunk_index,
             c.content,
             c.metadata,
             d.file_name,
             d.file_type,
             d.source_path,
             1 - (c.embedding <=> ${JSON.stringify(vector)}::vector) AS similarity
      FROM aplus_chunks c
      JOIN aplus_documents d ON d.id = c.document_id
      WHERE c.embedding IS NOT NULL
        AND c.tenant_code = ${tenantCode}
        AND d.tenant_code = ${tenantCode}
      ORDER BY c.embedding <=> ${JSON.stringify(vector)}::vector
      LIMIT ${limit}
    `;

    return rows.map((row) => ({
      id: String(row.id),
      tenantCode: row.tenant_code,
      documentId: String(row.document_id),
      fileName: row.file_name,
      fileType: row.file_type,
      sourcePath: row.source_path,
      chunkIndex: Number(row.chunk_index),
      content: row.content,
      metadata: row.metadata ?? {},
      similarity: Number(row.similarity),
    }));
  }

  /**
   * 从检索片段构建引用来源列表（去重）
   */
  protected buildSources(chunks: RetrievedChunk[]): SourceItem[] {
    const sourceMap = new Map<string, SourceItem>();
    for (const chunk of chunks) {
      const key = `${chunk.documentId}:${this.promptRegistry.formatLocation(chunk.metadata)}`;
      if (!sourceMap.has(key)) {
        sourceMap.set(key, {
          documentId: chunk.documentId,
          fileName: chunk.fileName,
          fileType: chunk.fileType,
          sourcePath: chunk.sourcePath,
          location: this.promptRegistry.formatLocation(chunk.metadata),
          bestSimilarity: chunk.similarity,
        });
      }
    }

    return Array.from(sourceMap.values());
  }

  /**
   * 从 LangChain 响应中提取文本内容
   */
  protected extractContentText(content: unknown): string {
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

  /**
   * 校验问题非空
   */
  protected assertQuestion(question: string): void {
    if (!question || !question.trim()) {
      throw new BadRequestException('question is required');
    }
  }

  /**
   * 从 UIMessage[] 中提取最新的用户问题
   */
  protected extractLatestUserQuestion(messages?: UIMessage[]): RagUserQuestion {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new BadRequestException('messages is required');
    }

    const latestUserMessage = [...messages]
      .reverse()
      .find((message) => message?.role === 'user');
    const question = latestUserMessage?.parts
      ?.filter((part) => part?.type === 'text')
      .map((part) => ('text' in part ? part.text : ''))
      .join('')
      .trim();

    if (!question) {
      throw new BadRequestException('question text is required');
    }

    return {
      id: latestUserMessage?.id,
      text: question,
    };
  }
}
