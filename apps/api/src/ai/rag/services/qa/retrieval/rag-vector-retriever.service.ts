import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { NodeConfigService } from '@src/config/node-config.service';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { RagPrismaService } from '../../prisma/rag-prisma.service';
import {
  BaseRagRetriever,
  type RagRetrievalRow,
  type RagRetrieveInput,
} from './rag-retriever';

@Injectable()
export class RagVectorRetrieverService extends BaseRagRetriever {
  private readonly embeddings: OpenAIEmbeddings;

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
