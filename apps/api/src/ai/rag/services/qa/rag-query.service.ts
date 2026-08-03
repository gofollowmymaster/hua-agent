import { randomUUID } from 'node:crypto';
import { ChatOpenAI } from '@langchain/openai';
import { BadRequestException, Injectable } from '@nestjs/common';
import { createUIMessageStream, type UIMessage } from 'ai';
import {
  Annotation,
  END,
  START,
  StateGraph,
  writer,
} from '@langchain/langgraph';
import { TenantContext } from '@src/common/service/context/tenant.context';
import { LoggerService } from '@src/common/service/logger/logger.service';
import { NodeConfigService } from '@src/config/node-config.service';
import { PromptRegistryService } from '../../prompts/prompt.registry';
import { RagMemoryService } from './rag-memory.service';
import { RagQueryRewriteService } from './rag-query-rewrite.service';
import { RagRetrievalService } from './rag-retrieval.service';
import type {
  RagChatRequest,
  RagMemoryMessage,
  RagQueryOptions,
  RagResolvedSession,
  RetrievalCandidate,
  RetrievedChunk,
  SourceItem,
} from '../../types/rag.type';
import type {
  RagRerankResult,
  RagRetrievalRouteResult,
  RagWorkflowInput,
  RagWorkflowMode,
  RagWorkflowResult,
  RagWorkflowStreamEvent,
} from './rag-workflow.type';
import type { RagQueryRewriteResult } from './rag-query-rewrite.service';

// 图状态按阶段保存中间结果，独立字段可避免并行召回节点写入冲突。
const RagWorkflowStateAnnotation = Annotation.Root({
  question: Annotation<string>,
  options: Annotation<RagQueryOptions | undefined>,
  mode: Annotation<RagWorkflowMode>,
  session: Annotation<RagResolvedSession | undefined>,
  memory: Annotation<RagMemoryMessage[]>,
  rewrite: Annotation<RagQueryRewriteResult | undefined>,
  vectorResult: Annotation<RagRetrievalRouteResult | undefined>,
  keywordResult: Annotation<RagRetrievalRouteResult | undefined>,
  fusedCandidates: Annotation<RetrievalCandidate[]>,
  rerankResult: Annotation<RagRerankResult | undefined>,
  chunks: Annotation<RetrievedChunk[]>,
  prompt: Annotation<string | undefined>,
  answer: Annotation<string>,
  sources: Annotation<SourceItem[]>,
});

type RagWorkflowGraphState = typeof RagWorkflowStateAnnotation.State;
type RagWorkflowGraphUpdate = typeof RagWorkflowStateAnnotation.Update;
type RagWorkflowRuntime = {
  writer: (event: RagWorkflowStreamEvent) => void;
};

@Injectable()
export class RagQueryService {
  private readonly model: ChatOpenAI;
  private readonly graph: ReturnType<RagQueryService['buildGraph']>;

  constructor(
    private readonly logger: LoggerService,
    private readonly tenantContext: TenantContext,
    private readonly ragMemoryService: RagMemoryService,
    private readonly promptRegistry: PromptRegistryService,
    private readonly queryRewriteService: RagQueryRewriteService,
    private readonly ragRetrievalService: RagRetrievalService,
  ) {
    this.logger.setContext(this.constructor.name);
    this.model = new ChatOpenAI({
      temperature: 0,
      model: NodeConfigService.get('modelName'),
      apiKey: NodeConfigService.get('openAiApiKey'),
      configuration: {
        baseURL: NodeConfigService.get('openAiBaseUrl'),
      },
    });
    this.graph = this.buildGraph();
  }

  async answerQuestion(
    question: string,
    options: RagQueryOptions = {},
  ): Promise<RagWorkflowResult> {
    const result = await this.graph.invoke(
      this.buildInput(question, options, 'sync'),
      this.buildRunConfig(options, 'sync'),
    );

    return this.toResult(result);
  }

  async *streamAnswer(
    question: string,
    options: RagQueryOptions = {},
  ): AsyncGenerator<RagWorkflowStreamEvent> {
    const stream = await this.graph.stream(
      this.buildInput(question, options, 'stream'),
      {
        ...this.buildRunConfig(options, 'stream'),
        streamMode: 'custom',
      },
    );

    for await (const event of stream) {
      yield event as unknown as RagWorkflowStreamEvent;
    }
  }

  createChatStream(params: RagChatRequest) {
    const question = this.extractLatestUserQuestion(params?.messages);
    const conversationId = params?.id?.trim() || randomUUID();
    const participantId = params?.participantId?.trim() || undefined;
    const textId = randomUUID();

    return createUIMessageStream({
      execute: async ({ writer }) => {
        writer.write({ type: 'text-start', id: textId });

        try {
          for await (const event of this.streamAnswer(question.text, {
            session: {
              channel: 'web',
              conversationId,
              conversationType: 'rag-chat',
              participantId,
              messageId: question.id,
              metadata: { source: 'rag-chat' },
            },
          })) {
            if (event.type === 'answer') {
              writer.write({
                type: 'text-delta',
                id: textId,
                delta: event.data,
              });
              continue;
            }

            writer.write({ type: 'data-status', data: event.data });
          }
        } finally {
          writer.write({ type: 'text-end', id: textId });
        }
      },
      onError: (error) =>
        error instanceof Error ? error.message : String(error),
    });
  }

  private buildGraph() {
    // 两路召回从 rewrite_query 扇出，并通过数组起点 edge 形成 fan-in barrier。
    return new StateGraph({
      state: RagWorkflowStateAnnotation,
      writer: writer<RagWorkflowStreamEvent>,
    })
      .addNode('resolve_session', this.resolveSessionNode.bind(this))
      .addNode('load_memory', this.loadMemoryNode.bind(this))
      .addNode('persist_user_message', this.persistUserMessageNode.bind(this))
      .addNode('rewrite_query', this.rewriteQueryNode.bind(this))
      .addNode('retrieve_vector', this.retrieveVectorNode.bind(this))
      .addNode('retrieve_keyword', this.retrieveKeywordNode.bind(this))
      .addNode('fuse_candidates', this.fuseCandidatesNode.bind(this))
      .addNode('rerank_candidates', this.rerankCandidatesNode.bind(this))
      .addNode('build_prompt', this.buildPromptNode.bind(this))
      .addNode('generate_answer', this.generateAnswerNode.bind(this))
      .addNode(
        'persist_assistant_message',
        this.persistAssistantMessageNode.bind(this),
      )
      .addNode('build_result', this.buildResultNode.bind(this))
      .addEdge(START, 'resolve_session')
      .addEdge('resolve_session', 'load_memory')
      .addEdge('load_memory', 'persist_user_message')
      .addEdge('persist_user_message', 'rewrite_query')
      .addEdge('rewrite_query', 'retrieve_vector')
      .addEdge('rewrite_query', 'retrieve_keyword')
      .addEdge(['retrieve_vector', 'retrieve_keyword'], 'fuse_candidates')
      .addEdge('fuse_candidates', 'rerank_candidates')
      .addEdge('rerank_candidates', 'build_prompt')
      .addEdge('build_prompt', 'generate_answer')
      .addEdge('generate_answer', 'persist_assistant_message')
      .addEdge('persist_assistant_message', 'build_result')
      .addEdge('build_result', END)
      .compile({ name: 'rag_qa_workflow' });
  }

  private async resolveSessionNode(
    state: RagWorkflowGraphState,
  ): Promise<RagWorkflowGraphUpdate> {
    return this.runNode('resolve_session', state, async () => {
      this.assertQuestion(state.question);
      return {
        session: this.ragMemoryService.resolveSession(state.options),
      };
    });
  }

  private async loadMemoryNode(
    state: RagWorkflowGraphState,
  ): Promise<RagWorkflowGraphUpdate> {
    return this.runNode('load_memory', state, async () => ({
      memory: await this.ragMemoryService.loadShortTermMemory(state.session),
    }));
  }

  private async persistUserMessageNode(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<RagWorkflowGraphUpdate> {
    const result = await this.runNode(
      'persist_user_message',
      state,
      async () => {
        await this.ragMemoryService.appendUserMessage(
          state.session,
          state.question,
        );
        return {};
      },
    );
    this.writeStatus(state, runtime, {
      stage: 'analyzing_start',
      message: '开始分析问题',
      sessionKey: state.session.sessionKey,
      topK: state.options?.topK,
    });
    return result;
  }

  private async rewriteQueryNode(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<RagWorkflowGraphUpdate> {
    const result = await this.runNode('rewrite_query', state, async () => ({
      rewrite: await this.queryRewriteService.rewrite({
        question: state.question,
        memory: state.memory,
        session: state.session,
        topK: state.options?.topK,
      }),
    }));
    this.writeStatus(state, runtime, {
      stage: 'retrieve_start',
      message: '开始检索知识库',
      sessionKey: state.session.sessionKey,
      topK: state.options?.topK,
    });
    return result;
  }

  private async retrieveVectorNode(
    state: RagWorkflowGraphState,
  ): Promise<RagWorkflowGraphUpdate> {
    return this.runNode(
      'retrieve_vector',
      state,
      async () => ({
        vectorResult: await this.ragRetrievalService.retrieveVector({
          query: state.rewrite.rewrittenQuestion,
          tenantCode: state.session.tenantCode,
        }),
      }),
      (update) => this.routeLogMeta(update.vectorResult),
    );
  }

  private async retrieveKeywordNode(
    state: RagWorkflowGraphState,
  ): Promise<RagWorkflowGraphUpdate> {
    return this.runNode(
      'retrieve_keyword',
      state,
      async () => ({
        keywordResult: await this.ragRetrievalService.retrieveKeyword({
          query: state.rewrite.rewrittenQuestion,
          tenantCode: state.session.tenantCode,
        }),
      }),
      (update) => this.routeLogMeta(update.keywordResult),
    );
  }

  private async fuseCandidatesNode(
    state: RagWorkflowGraphState,
  ): Promise<RagWorkflowGraphUpdate> {
    return this.runNode(
      'fuse_candidates',
      state,
      async () => ({
        fusedCandidates: this.ragRetrievalService.fuseCandidates([
          state.vectorResult.candidates,
          state.keywordResult.candidates,
        ]),
      }),
      (update) => ({ candidateCount: update.fusedCandidates?.length ?? 0 }),
    );
  }

  private async rerankCandidatesNode(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<RagWorkflowGraphUpdate> {
    const result = await this.runNode(
      'rerank_candidates',
      state,
      async () => {
        const rerankResult = await this.ragRetrievalService.rerankCandidates({
          query: state.rewrite.rewrittenQuestion,
          originalQuestion: state.question,
          candidates: state.fusedCandidates,
          topK: state.options?.topK,
          tenantCode: state.session.tenantCode,
          sessionKey: state.session.sessionKey,
        });
        return { rerankResult, chunks: rerankResult.chunks };
      },
      (update) => ({
        nodeStatus: update.rerankResult?.status,
        candidateCount: update.chunks?.length ?? 0,
        operationDurationMs: update.rerankResult?.durationMs,
      }),
    );
    const chunks = result.chunks ?? [];
    this.writeStatus(state, runtime, {
      stage: 'retrieve_done',
      message: `检索完成，命中 ${chunks.length} 个片段`,
      sessionKey: state.session.sessionKey,
      topK: state.options?.topK,
      chunks: chunks.length,
    });
    return result;
  }

  private async buildPromptNode(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<RagWorkflowGraphUpdate> {
    const result = await this.runNode('build_prompt', state, async () => ({
      prompt: await this.promptRegistry.buildPrompt('qa', {
        question: state.question,
        chunks: state.chunks,
        memory: this.promptRegistry.formatMemory(state.memory),
      }),
    }));
    this.writeStatus(state, runtime, {
      stage: 'generate_start',
      message: '开始生成答案',
      sessionKey: state.session.sessionKey,
      topK: state.options?.topK,
      chunks: state.chunks.length,
    });
    return result;
  }

  private async generateAnswerNode(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<RagWorkflowGraphUpdate> {
    return this.runNode('generate_answer', state, async () => ({
      answer:
        state.mode === 'stream'
          ? await this.generateStreamAnswer(state, runtime)
          : await this.generateSyncAnswer(state.prompt),
    }));
  }

  private async persistAssistantMessageNode(
    state: RagWorkflowGraphState,
  ): Promise<RagWorkflowGraphUpdate> {
    return this.runNode('persist_assistant_message', state, async () => {
      await this.ragMemoryService.appendAssistantMessage(
        state.session,
        state.answer,
      );
      return {};
    });
  }

  private async buildResultNode(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<RagWorkflowGraphUpdate> {
    const result = await this.runNode('build_result', state, async () => ({
      sources: this.buildSources(state.chunks),
    }));
    if (state.mode === 'stream') {
      runtime.writer({
        type: 'done',
        data: { stage: 'done', message: '生成完成' },
      });
    }
    return result;
  }

  private async generateSyncAnswer(prompt: string): Promise<string> {
    const response = await this.model.invoke(prompt);
    return (
      this.extractContentText(response.content) ||
      JSON.stringify(response.content)
    );
  }

  private async generateStreamAnswer(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<string> {
    let hasText = false;
    let answerContent = '';

    try {
      const stream = await this.model.stream(state.prompt);
      for await (const chunk of stream) {
        const text = this.extractContentText(chunk.content);
        if (!text) continue;

        hasText = true;
        answerContent += text;
        runtime.writer({ type: 'answer', data: text });
      }
    } catch (error) {
      this.logger.warn('RAG stream failed, fallback to invoke', undefined, {
        stage: 'rag_stream_failed_fallback',
        tenantCode: state.session.tenantCode,
        sessionKey: state.session.sessionKey,
        topK: state.options?.topK,
        chunks: state.chunks.length,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    if (hasText) return answerContent;

    // custom stream 没有产生文本时保持原协议：先发 fallback 状态，再一次性生成。
    this.logger.warn(
      'RAG stream returned no text, fallback to invoke',
      undefined,
      {
        stage: 'rag_stream_empty_fallback',
        tenantCode: state.session.tenantCode,
        sessionKey: state.session.sessionKey,
        topK: state.options?.topK,
        chunks: state.chunks.length,
      },
    );
    runtime.writer({
      type: 'status',
      data: {
        stage: 'fallback_start',
        message: '流式生成未返回文本，切换为普通生成',
        sessionKey: state.session.sessionKey,
        topK: state.options?.topK,
        chunks: state.chunks.length,
      },
    });

    const text = await this.generateSyncAnswer(state.prompt);
    if (text) runtime.writer({ type: 'answer', data: text });
    return text;
  }

  private async runNode<T extends RagWorkflowGraphUpdate>(
    nodeName: string,
    state: RagWorkflowGraphState,
    operation: () => Promise<T>,
    buildMeta?: (update: T) => Record<string, unknown>,
  ): Promise<T> {
    // 统一记录节点级非内容元数据，便于在日志与 LangSmith 中对齐耗时和降级状态。
    const startedAt = Date.now();
    try {
      const update = await operation();
      this.logger.info('RAG workflow node completed', undefined, {
        stage: 'rag_workflow_node',
        nodeName,
        nodeStatus: 'success',
        durationMs: Date.now() - startedAt,
        tenantCode: state.session?.tenantCode ?? this.tenantContext.tenant,
        sessionKey: state.session?.sessionKey,
        ...(buildMeta?.(update) ?? {}),
      });
      return update;
    } catch (error) {
      this.logger.error('RAG workflow node failed', undefined, {
        stage: 'rag_workflow_node',
        nodeName,
        nodeStatus: 'failed',
        durationMs: Date.now() - startedAt,
        tenantCode: state.session?.tenantCode ?? this.tenantContext.tenant,
        sessionKey: state.session?.sessionKey,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private routeLogMeta(result?: RagRetrievalRouteResult) {
    return {
      nodeStatus: result?.status,
      candidateCount: result?.candidates.length ?? 0,
      operationDurationMs: result?.durationMs,
    };
  }

  private writeStatus(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
    data: Extract<RagWorkflowStreamEvent, { type: 'status' }>['data'],
  ) {
    if (state.mode === 'stream') runtime.writer({ type: 'status', data });
  }

  private buildInput(
    question: string,
    options: RagQueryOptions,
    mode: RagWorkflowMode,
  ): RagWorkflowInput {
    return { question, options, mode };
  }

  private buildRunConfig(options: RagQueryOptions, mode: RagWorkflowMode) {
    const session = this.ragMemoryService.resolveSession(options);
    return {
      runName: 'rag_qa_workflow',
      tags: ['rag', mode],
      metadata: {
        tenantCode: session.tenantCode,
        sessionKey: session.sessionKey,
        channel: session.channel,
        topK: options.topK,
      },
    };
  }

  private toResult(state: RagWorkflowGraphState): RagWorkflowResult {
    return {
      sessionKey: state.session.sessionKey,
      answer: state.answer,
      sources: state.sources,
      chunks: state.chunks,
    };
  }

  private buildSources(chunks: RetrievedChunk[]): SourceItem[] {
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

  private assertQuestion(question: string): void {
    if (!question || !question.trim()) {
      throw new BadRequestException('question is required');
    }
  }

  private extractLatestUserQuestion(messages?: UIMessage[]) {
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

    return { id: latestUserMessage?.id, text: question };
  }
}
