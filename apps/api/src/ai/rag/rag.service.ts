import { BadRequestException, Injectable } from '@nestjs/common';
import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { NodeConfigService } from '@src/config/node-config.service';
import { RagPrismaService } from './services/prisma/rag-prisma.service';
import { RagMemoryService } from './services/rag-memory.service';
import type {
  RagMemoryMessage,
  RagQueryOptions,
  RagStreamEvent,
  RetrievedChunk,
} from './types/rag.type';

@Injectable()
export class RagService {
  private readonly embeddings: OpenAIEmbeddings;
  private readonly model: ChatOpenAI;
  private readonly defaultTopK: number;

  constructor(
    private readonly ragPrisma: RagPrismaService,
    private readonly logger: LoggerService,
    private readonly tenantContext: TenantContext,
    private readonly ragMemoryService: RagMemoryService,
  ) {
    this.logger.setContext(RagService.name);

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

  async answerQuestion(question: string, options: RagQueryOptions = {}) {
    this.assertQuestion(question);
    const session = this.ragMemoryService.resolveSession(options);
    const memory = await this.ragMemoryService.loadShortTermMemory(session);
    const chunks = await this.retrieve(question, options.topK);
    const answer = await this.generateAnswer(question, chunks, memory);
    await this.ragMemoryService.appendTurn(session, question, answer);

    return {
      sessionKey: session.sessionKey,
      answer,
      sources: this.buildSources(chunks),
      chunks,
    };
  }

  async *streamAnswer(
    question: string,
    options: RagQueryOptions = {},
  ): AsyncGenerator<RagStreamEvent> {
    this.assertQuestion(question);
    const session = this.ragMemoryService.resolveSession(options);
    const memory = await this.ragMemoryService.loadShortTermMemory(session);
    yield {
      type: 'status',
      data: {
        stage: 'retrieve_start',
        message: '开始检索知识库',
        sessionKey: session.sessionKey,
        topK: options.topK,
      },
    };

    const chunks = await this.retrieve(question, options.topK);
    yield {
      type: 'status',
      data: {
        stage: 'retrieve_done',
        message: `检索完成，命中 ${chunks.length} 个片段`,
        sessionKey: session.sessionKey,
        topK: options.topK,
        chunks: chunks.length,
      },
    };

    const prompt = await this.buildPrompt(question, chunks, memory);
    yield {
      type: 'status',
      data: {
        stage: 'generate_start',
        message: '开始生成答案',
        sessionKey: session.sessionKey,
        topK: options.topK,
        chunks: chunks.length,
      },
    };

    const stream = await this.model.stream(prompt);
    let hasText = false;
    let answerContent = '';

    for await (const chunk of stream) {
      const text = this.extractContentText(chunk.content);
      if (text) {
        hasText = true;
        answerContent += text;
        yield { type: 'answer', data: text };
      }
    }

    if (!hasText) {
      this.logger.warn(
        'RAG stream returned no text, fallback to invoke',
        undefined,
        {
          stage: 'rag_stream_empty_fallback',
          tenantCode: this.tenantContext.tenant,
          sessionKey: session.sessionKey,
          topK: options.topK,
          chunks: chunks.length,
        },
      );
      yield {
        type: 'status',
        data: {
          stage: 'fallback_start',
          message: '流式生成未返回文本，切换为普通生成',
          sessionKey: session.sessionKey,
          topK: options.topK,
          chunks: chunks.length,
        },
      };

      const response = await this.model.invoke(prompt);
      const text =
        this.extractContentText(response.content) ||
        JSON.stringify(response.content);
      if (text) {
        answerContent += text;
        yield { type: 'answer', data: text };
      }
    }

    await this.ragMemoryService.appendTurn(session, question, answerContent);

    yield {
      type: 'done',
      data: {
        stage: 'done',
        message: '生成完成',
      },
    };
  }

  private async retrieve(
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
      sourcePath: row.source_path,
      chunkIndex: Number(row.chunk_index),
      content: row.content,
      metadata: row.metadata ?? {},
      similarity: Number(row.similarity),
    }));
  }

  private async generateAnswer(
    question: string,
    chunks: RetrievedChunk[],
    memory: RagMemoryMessage[],
  ) {
    const prompt = await this.buildPrompt(question, chunks, memory);
    const response = await this.model.invoke(prompt);

    return (
      this.extractContentText(response.content) ||
      JSON.stringify(response.content)
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

  private async buildPrompt(
    question: string,
    chunks: RetrievedChunk[],
    memory: RagMemoryMessage[],
  ) {
    const prompt =
      PromptTemplate.fromTemplate(`你是企业知识库 RAG 问答助手。请只基于给定资料回答问题。

如果资料中没有足够信息，请明确说“根据当前资料无法确认”，不要编造。
回答应简洁、准确，并在必要时引用来源文件名。
最近对话仅用于理解连续追问、代词和用户上下文；当最近对话与资料片段冲突时，以资料片段为准。

最近对话：
{memory}

资料片段：
{context}

用户问题：{question}

回答：`);

    const promptValue = await prompt.invoke({
      question,
      memory: this.ragMemoryService.formatMemory(memory),
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
}
