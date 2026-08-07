import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { NodeConfigService } from '@src/config/node-config.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RagPrismaService } from '@src/common/service/rag-prisma/rag-prisma.service';
import {
  BaseRagRetriever,
  type RagRetrievalRow,
  type RagRetrieveInput,
} from './rag-retriever';

/** 通过问题向量与 pgvector 相似度检索当前租户的候选切片。 */
@Injectable()
export class RagVectorRetrieverService extends BaseRagRetriever {
  private readonly embeddings: OpenAIEmbeddings;

  /** 从集中配置初始化向量检索策略和 Embeddings 客户端。 */
  constructor(
    private readonly ragPrisma: RagPrismaService,
    logger: LoggerService,
  ) {
    const retrievalConfig = NodeConfigService.get('vcHelper').retrieval;
    super(
      logger,
      'vector',
      retrievalConfig.vectorTopK,
      'RAG vector retrieval failed',
      'rag_vector_retrieval_failed',
    );
    this.embeddings = new OpenAIEmbeddings({
      apiKey: NodeConfigService.get('embeddingsApiKey'),
      model: NodeConfigService.get('embeddingsModelName'),
      dimensions: NodeConfigService.get('embeddingsDimensions'),
      configuration: {
        baseURL: NodeConfigService.get('embeddingsBaseUrl'),
      },
    });
  }

  /** 生成问题向量并按余弦距离查询租户隔离的候选切片。 */
  protected async retrieveCandidates(input: RagRetrieveInput, limit: number) {
    const vector = await this.embeddings.embedQuery(input.query);
    const rows = await this.ragPrisma.$queryRaw<RagRetrievalRow[]>`
      SELECT c.id,
             c.tenant_code,
             c.document_id,
             c.chunk_index,
             c.content,
             c.metadata,
             d.file_name,
             d.file_type,
             d.source_path,
             1 - (c.embedding <=> ${JSON.stringify(vector)}::vector) AS score
      FROM aplus_chunks c
      JOIN aplus_documents d ON d.id = c.document_id
      WHERE c.embedding IS NOT NULL
        AND c.tenant_code = ${input.tenantCode}
        AND d.tenant_code = ${input.tenantCode}
      ORDER BY c.embedding <=> ${JSON.stringify(vector)}::vector
      LIMIT ${limit}
    `;

    return rows.map((row, index) => this.toCandidate(row, index + 1));
  }
}
