import { ChatOpenAI } from '@langchain/openai';
import { BadRequestException, Injectable } from '@nestjs/common';
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
import { RagQuestionRouterService } from './rag-question-router.service';
import { RagRetrievalService } from './retrieval/rag-retrieval.service';
import type {
  RagMemoryMessage,
  RagQueryOptions,
  RagResolvedSession,
  RagStreamEvent,
  RetrievalCandidate,
  RetrievedChunk,
  SourceItem,
} from '../../types/rag.type';
import type {
  RagAnswerGenerationResult,
  RagQuestionRoute,
  RagQuestionRouteResult,
  RagRerankResult,
  RagRetrievalRouteResult,
  RagWorkflowInput,
  RagWorkflowMode,
  RagWorkflowResult,
} from '../../types/rag-workflow.type';
import type { RagReasoningEffort } from '@src/config/interface';
import type { RagQueryRewriteResult } from './rag-query-rewrite.service';

// 图状态按阶段保存中间结果，独立字段可避免并行召回节点写入冲突。
const RagWorkflowStateAnnotation = Annotation.Root({
  question: Annotation<string>,
  options: Annotation<RagQueryOptions>,
  mode: Annotation<RagWorkflowMode>,
  session: Annotation<RagResolvedSession | undefined>,
  memory: Annotation<RagMemoryMessage[]>,
  routeResult: Annotation<RagQuestionRouteResult | undefined>,
  rewrite: Annotation<RagQueryRewriteResult | undefined>,
  vectorResult: Annotation<RagRetrievalRouteResult | undefined>,
  keywordResult: Annotation<RagRetrievalRouteResult | undefined>,
  fusedCandidates: Annotation<RetrievalCandidate[]>,
  rerankResult: Annotation<RagRerankResult | undefined>,
  chunks: Annotation<RetrievedChunk[]>,
  prompt: Annotation<string | undefined>,
  answer: Annotation<string>,
  reasoningFallback: Annotation<boolean>,
  sources: Annotation<SourceItem[]>,
});

type RagWorkflowGraphState = typeof RagWorkflowStateAnnotation.State;
type RagWorkflowGraphUpdate = typeof RagWorkflowStateAnnotation.Update;
type RagWorkflowRuntime = {
  writer: (event: RagStreamEvent) => void;
};

/** 使用 LangGraph 编排会话、路由、检索、生成和消息持久化。 */
@Injectable()
export class RagQueryService {
  private readonly reasoningModel: ChatOpenAI;
  private readonly fallbackModel: ChatOpenAI;
  private readonly reasoningEffort: RagReasoningEffort;
  private readonly graph: ReturnType<RagQueryService['buildGraph']>;

  /** 初始化推理与回退模型，并编译可复用的问答状态图。 */
  constructor(
    private readonly logger: LoggerService,
    private readonly tenantContext: TenantContext,
    private readonly ragMemoryService: RagMemoryService,
    private readonly promptRegistry: PromptRegistryService,
    private readonly questionRouterService: RagQuestionRouterService,
    private readonly queryRewriteService: RagQueryRewriteService,
    private readonly ragRetrievalService: RagRetrievalService,
  ) {
    this.logger.setContext(this.constructor.name);
    const modelConfig = {
      temperature: 0,
      model: NodeConfigService.get('modelName'),
      apiKey: NodeConfigService.get('openAiApiKey'),
      configuration: {
        baseURL: NodeConfigService.get('openAiBaseUrl'),
      },
    };
    this.reasoningEffort = NodeConfigService.get('ragReasoningEffort');
    // Qwen 模型不会触发 LangChain 的 OpenAI 模型名识别，需通过 modelKwargs 强制透传。
    this.reasoningModel = new ChatOpenAI({
      ...modelConfig,
      modelKwargs: {
        reasoning_effort: this.reasoningEffort,
      },
    });
    this.fallbackModel = new ChatOpenAI(modelConfig);
    this.graph = this.buildGraph();
  }

  /** 同步运行完整问答图并返回答案、来源和最终切片。 */
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

  /** 以自定义事件模式运行问答图并逐步产出流式状态和内容。 */
  async *streamAnswer(
    question: string,
    options: RagQueryOptions = {},
  ): AsyncGenerator<RagStreamEvent> {
    const stream = await this.graph.stream(
      this.buildInput(question, options, 'stream'),
      {
        ...this.buildRunConfig(options, 'stream'),
        streamMode: 'custom',
      },
    );

    for await (const event of stream) {
      yield event as unknown as RagStreamEvent;
    }
  }

  /** 定义 direct 与 RAG 分支及双路检索汇合关系，并编译状态图。 */
  private buildGraph() {
    // 路由后仅 RAG 分支扇出两路召回，并通过数组起点 edge 形成 fan-in barrier。
    return new StateGraph({
      state: RagWorkflowStateAnnotation,
      writer: writer<RagStreamEvent>,
    })
      .addNode('resolve_session', this.resolveSessionNode.bind(this))
      .addNode('load_memory', this.loadMemoryNode.bind(this))
      .addNode('persist_user_message', this.persistUserMessageNode.bind(this))
      .addNode('route_question', this.routeQuestionNode.bind(this))
      .addNode('rewrite_query', this.rewriteQueryNode.bind(this))
      .addNode('retrieve_vector', this.retrieveVectorNode.bind(this))
      .addNode('retrieve_keyword', this.retrieveKeywordNode.bind(this))
      .addNode('fuse_candidates', this.fuseCandidatesNode.bind(this))
      .addNode('rerank_candidates', this.rerankCandidatesNode.bind(this))
      .addNode('build_rag_prompt', this.buildRagPromptNode.bind(this))
      .addNode('build_direct_prompt', this.buildDirectPromptNode.bind(this))
      .addNode('generate_answer', this.generateAnswerNode.bind(this))
      .addNode(
        'persist_assistant_message',
        this.persistAssistantMessageNode.bind(this),
      )
      .addNode('build_result', this.buildResultNode.bind(this))
      .addEdge(START, 'resolve_session')
      .addEdge('resolve_session', 'load_memory')
      .addEdge('load_memory', 'persist_user_message')
      .addEdge('persist_user_message', 'route_question')
      .addConditionalEdges(
        'route_question',
        this.selectQuestionRoute.bind(this),
        {
          rag: 'rewrite_query',
          direct: 'build_direct_prompt',
        },
      )
      .addEdge('rewrite_query', 'retrieve_vector')
      .addEdge('rewrite_query', 'retrieve_keyword')
      .addEdge(['retrieve_vector', 'retrieve_keyword'], 'fuse_candidates')
      .addEdge('fuse_candidates', 'rerank_candidates')
      .addEdge('rerank_candidates', 'build_rag_prompt')
      .addEdge('build_rag_prompt', 'generate_answer')
      .addEdge('build_direct_prompt', 'generate_answer')
      .addEdge('generate_answer', 'persist_assistant_message')
      .addEdge('persist_assistant_message', 'build_result')
      .addEdge('build_result', END)
      .compile({ name: 'rag_qa_workflow' });
  }

  /** 校验问题并解析租户、会话标识等上下文，供后续节点统一使用。 */
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

  /** 根据已解析的会话加载短期对话记忆，为问题改写和提示词构建提供上下文。 */
  private async loadMemoryNode(
    state: RagWorkflowGraphState,
  ): Promise<RagWorkflowGraphUpdate> {
    return this.runNode('load_memory', state, async () => ({
      memory: await this.ragMemoryService.loadShortTermMemory(state.session),
    }));
  }

  /** 持久化当前用户问题；公开状态由路由结果决定，避免 direct 分支伪装成检索。 */
  private async persistUserMessageNode(
    state: RagWorkflowGraphState,
  ): Promise<RagWorkflowGraphUpdate> {
    return this.runNode('persist_user_message', state, async () => {
      await this.ragMemoryService.appendUserMessage(
        state.session,
        state.question,
      );
      return {};
    });
  }

  /** 使用轻量模型进行保守路由；只有确认 direct 时才绕过知识库链路。 */
  private async routeQuestionNode(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<RagWorkflowGraphUpdate> {
    const result = await this.runNode(
      'route_question',
      state,
      async () => ({
        routeResult: await this.questionRouterService.route({
          question: state.question,
          memory: state.memory,
          session: state.session,
          topK: state.options?.topK,
        }),
      }),
      (update) => ({
        route: update.routeResult?.route,
        routeStatus: update.routeResult?.status,
        operationDurationMs: update.routeResult?.durationMs,
        routeFallback: update.routeResult?.status === 'failed',
      }),
    );

    if (result.routeResult?.route === 'rag') {
      this.writeStatus(state, runtime, {
        stage: 'analyzing_start',
        message: '开始分析问题',
        sessionKey: state.session.sessionKey,
        topK: state.options?.topK,
      });
    }
    return result;
  }

  /** 根据路由节点结果选择直接回答或知识库检索分支。 */
  private selectQuestionRoute(state: RagWorkflowGraphState): RagQuestionRoute {
    return state.routeResult?.route === 'direct' ? 'direct' : 'rag';
  }

  /** 结合原始问题与对话记忆生成检索问题，并通知客户端开始知识库检索。 */
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

  /** 使用改写后的问题执行向量语义召回，将候选片段写入 vectorResult。 */
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

  /** 使用改写后的问题执行关键词召回，将候选片段写入 keywordResult。 */
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

  /** 合并向量与关键词两路召回结果，去重并融合为统一候选集合。 */
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

  /** 对融合候选进行重排和 Top-K 截取，产出最终上下文片段并通知检索完成。 */
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
          rerankMode: state.options?.rerankMode,
        });
        return { rerankResult, chunks: rerankResult.chunks };
      },
      (update) => ({
        nodeStatus: update.rerankResult?.status,
        candidateCount: update.chunks?.length ?? 0,
        operationDurationMs: update.rerankResult?.durationMs,
        rerankMode: update.rerankResult?.mode,
        fallbackMode: update.rerankResult?.fallbackMode,
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

  /** 将问题、最终片段和对话记忆填充到 QA 模板，并通知客户端开始生成。 */
  private async buildRagPromptNode(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<RagWorkflowGraphUpdate> {
    const result = await this.runNode('build_rag_prompt', state, async () => ({
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

  /** direct 分支只注入问题和短期记忆，不携带检索片段或引用信息。 */
  private async buildDirectPromptNode(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<RagWorkflowGraphUpdate> {
    const result = await this.runNode(
      'build_direct_prompt',
      state,
      async () => ({
        prompt: await this.promptRegistry.buildPrompt('direct', {
          question: state.question,
          memory: this.promptRegistry.formatMemory(state.memory),
        }),
        vectorResult: undefined,
        keywordResult: undefined,
        fusedCandidates: [],
        rerankResult: undefined,
        chunks: [],
        sources: [],
      }),
    );
    this.writeStatus(state, runtime, {
      stage: 'generate_start',
      message: '开始生成答案',
      sessionKey: state.session.sessionKey,
      topK: state.options?.topK,
      chunks: 0,
    });
    return result;
  }

  /** 按工作流模式调用模型同步或流式生成答案，并将完整答案写回状态。 */
  private async generateAnswerNode(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<RagWorkflowGraphUpdate> {
    return this.runNode(
      'generate_answer',
      state,
      async () => {
        const isDirect = state.routeResult?.route === 'direct';
        const result = isDirect
          ? state.mode === 'stream'
            ? await this.generateDirectStreamAnswer(state, runtime)
            : await this.generateDirectSyncAnswer(state)
          : state.mode === 'stream'
            ? await this.generateStreamAnswer(state, runtime)
            : await this.generateSyncAnswer(state);
        return {
          answer: result.answer,
          reasoningFallback: result.reasoningFallback,
        };
      },
      (update) => ({
        route: state.routeResult?.route ?? 'rag',
        reasoningEffort:
          state.routeResult?.route === 'direct'
            ? undefined
            : this.reasoningEffort,
        reasoningFallback: update.reasoningFallback,
      }),
    );
  }

  /** 将模型生成的完整答案持久化为助手消息，补全当前会话记忆。 */
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

  /** 从最终片段汇总去重后的来源信息，并在流式模式下发送完成事件。 */
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

  /** 使用推理模型同步生成答案，失败或空结果时回退普通模型。 */
  private async generateSyncAnswer(
    state: RagWorkflowGraphState,
  ): Promise<RagAnswerGenerationResult> {
    try {
      const response = await this.reasoningModel.invoke(state.prompt);
      const answer = this.extractContentText(response.content);
      if (answer) return { answer, reasoningFallback: false };

      this.logReasoningFallback(state, 'rag_reasoning_sync_empty');
    } catch (error) {
      this.logReasoningFallback(state, 'rag_reasoning_sync_failed', error);
    }

    return {
      answer: await this.generateFallbackAnswer(state.prompt),
      reasoningFallback: true,
    };
  }

  /** 使用普通模型为 direct 分支同步生成答案。 */
  private async generateDirectSyncAnswer(
    state: RagWorkflowGraphState,
  ): Promise<RagAnswerGenerationResult> {
    return {
      answer: await this.generateFallbackAnswer(state.prompt),
      reasoningFallback: false,
    };
  }

  /** 流式生成 direct 答案，并在无文本或异常时回退同步生成。 */
  private async generateDirectStreamAnswer(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<RagAnswerGenerationResult> {
    let answer = '';
    let fallbackReason = 'direct_stream_empty';
    try {
      const stream = await this.fallbackModel.stream(state.prompt);
      for await (const chunk of stream) {
        const text = this.extractContentText(chunk.content);
        if (!text) continue;
        answer += text;
        runtime.writer({ type: 'answer', data: text });
      }
      if (answer) return { answer, reasoningFallback: false };
    } catch (error) {
      fallbackReason = 'direct_stream_failed';
      this.logDirectFallback(state, fallbackReason, error);
    }

    if (fallbackReason === 'direct_stream_empty') {
      this.logDirectFallback(state, fallbackReason);
    }
    runtime.writer({
      type: 'status',
      data: {
        stage: 'fallback_start',
        message: '流式生成未返回文本，切换为普通生成',
        sessionKey: state.session.sessionKey,
        topK: state.options?.topK,
        chunks: 0,
      },
    });
    const text = await this.generateFallbackAnswer(state.prompt);
    if (text) runtime.writer({ type: 'answer', data: text });
    return { answer: text, reasoningFallback: true };
  }

  /** 流式输出推理与答案内容，并在无正文时回退普通模型。 */
  private async generateStreamAnswer(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
  ): Promise<RagAnswerGenerationResult> {
    let hasText = false;
    let answerContent = '';

    try {
      const stream = await this.reasoningModel.stream(state.prompt);
      for await (const chunk of stream) {
        const reasoning = this.extractReasoningText(chunk);
        if (reasoning) {
          runtime.writer({ type: 'reasoning', data: reasoning });
        }
        const text = this.extractContentText(chunk.content);
        if (!text) continue;

        hasText = true;
        answerContent += text;
        runtime.writer({ type: 'answer', data: text });
      }
    } catch (error) {
      this.logReasoningFallback(state, 'rag_reasoning_stream_failed', error);
    }

    if (hasText) {
      return { answer: answerContent, reasoningFallback: false };
    }

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
        reasoningEffort: this.reasoningEffort,
        reasoningFallback: true,
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

    const text = await this.generateFallbackAnswer(state.prompt);
    if (text) runtime.writer({ type: 'answer', data: text });
    return { answer: text, reasoningFallback: true };
  }

  /** 使用普通模型执行一次非推理答案生成。 */
  private async generateFallbackAnswer(prompt: string): Promise<string> {
    const response = await this.fallbackModel.invoke(prompt);
    return this.extractContentText(response.content);
  }

  /** 记录 RAG 推理模型回退普通生成的上下文。 */
  private logReasoningFallback(
    state: RagWorkflowGraphState,
    stage: string,
    error?: unknown,
  ) {
    this.logger.warn(
      'RAG reasoning failed, fallback to ordinary generation',
      undefined,
      {
        stage,
        tenantCode: state.session.tenantCode,
        sessionKey: state.session.sessionKey,
        topK: state.options?.topK,
        chunks: state.chunks.length,
        reasoningEffort: this.reasoningEffort,
        reasoningFallback: true,
        errorType: error instanceof Error ? error.name : typeof error,
      },
    );
  }

  /** 记录 direct 流式生成回退同步调用的上下文。 */
  private logDirectFallback(
    state: RagWorkflowGraphState,
    stage: string,
    error?: unknown,
  ) {
    this.logger.warn('RAG direct stream fallback to invoke', undefined, {
      stage,
      tenantCode: state.session.tenantCode,
      sessionKey: state.session.sessionKey,
      topK: state.options?.topK,
      route: 'direct',
      errorType: error instanceof Error ? error.name : typeof error,
    });
  }

  /** 执行单个工作流节点并统一记录耗时、状态和安全日志元数据。 */
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
        // 模型错误可能回显请求内容，结构化日志仅保留错误类型。
        errorType: error instanceof Error ? error.name : typeof error,
      });
      throw error;
    }
  }

  /** 从单路检索结果提取节点日志所需的状态和候选统计。 */
  private routeLogMeta(result?: RagRetrievalRouteResult) {
    return {
      nodeStatus: result?.status,
      candidateCount: result?.candidates.length ?? 0,
      operationDurationMs: result?.durationMs,
    };
  }

  /** 仅在流式模式下向调用方写入状态事件。 */
  private writeStatus(
    state: RagWorkflowGraphState,
    runtime: RagWorkflowRuntime,
    data: Extract<RagStreamEvent, { type: 'status' }>['data'],
  ) {
    if (state.mode === 'stream') runtime.writer({ type: 'status', data });
  }

  /** 构造状态图运行所需的初始输入。 */
  private buildInput(
    question: string,
    options: RagQueryOptions,
    mode: RagWorkflowMode,
  ): RagWorkflowInput {
    return { question, options, mode };
  }

  /** 构造包含租户、会话和推理策略的 LangGraph 运行配置。 */
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
        rerankMode: options.rerankMode,
        reasoningEffort: this.reasoningEffort,
        reasoningFallback: false,
      },
    };
  }

  /** 将最终图状态收敛为公共问答结果。 */
  private toResult(state: RagWorkflowGraphState): RagWorkflowResult {
    return {
      sessionKey: state.session.sessionKey,
      answer: state.answer,
      sources: state.sources,
      chunks: state.chunks,
    };
  }

  /** 按文档和位置去重检索切片并汇总来源信息。 */
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

  /** 从模型内容中提取正文并排除推理内容块。 */
  private extractContentText(content: unknown): string {
    if (typeof content === 'string') return content;
    if (!Array.isArray(content)) return '';

    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (!part || typeof part !== 'object') return '';

        const item = part as Record<string, unknown>;
        if (item.type === 'reasoning') return '';
        if (typeof item.text === 'string') return item.text;
        if (typeof item.content === 'string') return item.content;

        return '';
      })
      .join('');
  }

  /** 从模型附加字段或 reasoning 内容块中提取推理文本。 */
  private extractReasoningText(chunk: unknown): string {
    if (!chunk || typeof chunk !== 'object') return '';

    const value = chunk as Record<string, unknown>;
    const additionalKwargs = value.additional_kwargs;
    if (additionalKwargs && typeof additionalKwargs === 'object') {
      const reasoningContent = (additionalKwargs as Record<string, unknown>)
        .reasoning_content;
      if (typeof reasoningContent === 'string' && reasoningContent) {
        return reasoningContent;
      }
    }

    if (!Array.isArray(value.content)) return '';
    return value.content
      .map((part) => {
        if (!part || typeof part !== 'object') return '';
        const item = part as Record<string, unknown>;
        if (item.type !== 'reasoning') return '';
        if (typeof item.reasoning === 'string') return item.reasoning;
        return typeof item.text === 'string' ? item.text : '';
      })
      .join('');
  }

  /** 拒绝空白问题，防止无效请求进入工作流。 */
  private assertQuestion(question: string): void {
    if (!question || !question.trim()) {
      throw new BadRequestException('question is required');
    }
  }
}
