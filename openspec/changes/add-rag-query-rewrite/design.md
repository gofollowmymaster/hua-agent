## Context

当前 RAG 查询链路由 `RagQueryService` 和 `RagStreamService` 负责：解析会话、加载短期记忆、写入用户问题、使用原问题做 pgvector 检索，再将原问题和检索片段注入 QA prompt。`PromptRegistryService` 已支持按分类注册版本化 prompt，接口类型中也预留了 `rewrite` 分类。

## Goals / Non-Goals

**Goals:**

- 在检索前统一改写查询，提升连续追问和指代问题的命中率。
- 改写失败时降级到原问题，保证 RAG 问答主链路可用。
- 不改变公开接口契约。

**Non-Goals:**

- 不暴露改写结果给调用方。
- 不新增配置开关。
- 不改变知识库检索 SQL、topK 规则或租户隔离条件。

## Decisions

### 1. 新增 `RagQueryRewriteService`

该服务放在 `src/ai/rag/services/qa/`，作为 RAG QA 模块内部能力。它通过构造函数注入 `LoggerService`、`TenantContext` 和 `PromptRegistryService`，并使用与现有 RAG QA 一致的 `ChatOpenAI` 配置。

核心方法接收原始问题、短期记忆、会话标识和 topK，返回：

- `originalQuestion`
- `rewrittenQuestion`
- `usedRewrite`
- `fallbackReason`

`fallbackReason` 只用于日志，不进入公开响应。

### 2. Prompt 使用 `rewrite/v1`

新增 `prompts/rewrite/v1.ts` 并在 `PromptRegistryService` 注册 `rewrite: { v1 }`。模板要求模型按 `StructuredOutputParser.getFormatInstructions()` 输出结构化数据，不回答问题，不解释过程，不编造最近对话和原问题以外的实体。结构化字段包括 `rewrittenQuestion` 和 `rewriteReason`。

无最近对话或原问题已经完整时，应保持原问题语义，并在 `rewriteReason` 中说明原因。对于明显错别字、同音字、中英文混写和口语化表达，prompt 允许做高置信轻量纠正与关键词归一；对于乱码、无意义寒暄、纯情绪、表情或与知识库检索无关的内容，prompt 要求直接输出原问题，避免强行改写成业务问题。

`RagQueryRewriteService` 使用 `zod` schema 定义 `rewrittenQuestion` 和 `rewriteReason`，再用 `StructuredOutputParser.fromZodSchema(schema)` 生成格式说明并解析模型输出。模型返回空文本、异常、结构化解析失败或 schema 校验失败时由服务回退原问题，并在结构化结果中记录回退原因。

### 3. 检索用改写问题，回答用原始问题

同步和流式问答均在 `loadShortTermMemory()` 后、`retrieve()` 前调用改写。`retrieve()` 使用 `rewrittenQuestion`；`buildPrompt('qa')` 仍使用用户原始问题。

该策略让检索补足上下文，同时保持最终回答针对用户真实表达。

### 4. 可观测性只走日志

每次改写完成后记录结构化日志，字段包括 tenant、sessionKey、originalQuestion、rewrittenQuestion、usedRewrite、fallbackReason。接口响应、SSE status 和 AGUI data 不增加字段，避免前端契约变化。

## Risks / Trade-offs

- LLM 改写额外增加一次模型调用，可能提高延迟；本次通过失败回退保证可用性，不新增异步缓存。
- 改写可能引入偏差；prompt 限制不编造信息，并且最终 QA 仍使用原始问题。
- 记录原始问题和改写问题有排查价值，但可能包含用户输入内容；日志不得包含 token、secret 或授权信息。

## Rollout

实现后先通过单元测试验证改写、回退、同步和流式链路。发布后可通过日志对比 original/rewritten 检查连续追问的检索效果。
