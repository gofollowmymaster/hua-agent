## Context

当前 `RagRerankService` 已通过 `RagReranker` 接口组合 Noop 与规则策略，但全局配置为 `model` 时只记录告警并使用规则策略。RAG 主链路由 LangGraph 统一编排，重排节点通过 `RagRetrievalService` facade 调用该服务。本变更需要接入 DashScope 原生 Qwen3 rerank API，同时保持内部扩展边界、现有公开协议和失败降级。

## Goals / Non-Goals

**Goals:**

- 实现可注入、可单测的 `Qwen3Reranker`。
- 支持内部调用按请求覆盖全局重排模式。
- 保留模型失败、规则失败两级降级及明确诊断。
- 集中管理 endpoint、密钥、模型和超时配置，避免敏感内容进入日志。

**Non-Goals:**

- 不开放新的 HTTP、SSE、AGUI 或企微参数。
- 不增加重试、批量、熔断、checkpointer 或数据库状态。
- 不改变候选召回、RRF 融合和规则重排算法。

## Decisions

### 1. Qwen3 作为独立 RagReranker Provider

`Qwen3Reranker` 实现现有 `RagReranker`，通过 NestJS 注入 `HttpService`，并使用 `firstValueFrom` 调用配置的完整 DashScope endpoint。这样外部调用、响应校验和候选映射与策略编排解耦，测试可以直接 mock HTTP observable。替代方案是在 `RagRerankService` 内直接发送请求，但会使模式选择、降级和协议处理耦合。

请求仅发送 `model`、`input.query`、`input.documents`、`parameters.return_documents=false` 和归一化后的 `top_n`。响应必须包含非空 `output.results`；每项 index 必须唯一且在候选范围内，`relevance_score` 必须为有限数值。映射结果将该分数写入候选 `score`、`retrieval.rerankScore`，并标记 `rerankMode: 'model'`。

### 2. 请求模式覆盖全局模式

内部 `RagQueryOptions` 和 `RagRerankCandidatesInput` 增加可选 `rerankMode`，优先级为请求参数、`RAG_RERANK_MODE`、`rule`。工作流和 facade 仅透传该字段，不修改公开 DTO。选择结果通过 `RagRerankResult.mode` 返回，避免根据候选反推策略。

### 3. 模型失败采用两级降级

选择 `model` 时先调用 Qwen3；失败后记录不含正文和密钥的 warn，并调用规则策略。规则成功时结果 `status` 仍为 `failed`、`mode` 为 `model`、`fallbackMode` 为 `rule`，候选则按实际策略标记 `rule`。若规则也失败，返回融合候选前 topK。选择 `rule` 时失败直接回退融合候选；`none` 返回禁用状态。

该诊断设计保留“请求策略未成功”的事实，同时让下游获得可用片段。替代方案是规则成功后标记 success，但会掩盖外部模型故障。

### 4. 配置集中在 NodeConfigService

配置层新增 `rerankApiKey`、`rerankUrl`、`rerankModel`、`rerankTimeoutMs`。API key 默认回退 embeddings key，模型默认 `qwen3-rerank`，超时默认 10000ms；URL 不自动拼接，缺失时由模型策略抛出项目异常并进入降级链。业务 Service 不直接读取 `process.env`。

### 5. Trace 仅记录非敏感诊断

工作流重排节点日志增加选择模式和 fallback 模式，只保留状态、耗时、候选数、tenant 与 session。异常日志可记录错误类别或消息，但异常文本不得包含服务端响应体、query、document、Authorization 或 API key。

## Risks / Trade-offs

- [Risk] 候选正文发送到外部模型形成数据边界扩展 → 仅在显式 model 模式发送，并由部署方配置获准 endpoint。
- [Risk] DashScope 返回非法 index 或 score 导致错误映射 → 严格校验完整响应，任何非法项触发规则降级。
- [Risk] 外部请求增加问答时延 → 使用可配置超时并限制发送候选数为 `rerankTopN`。
- [Risk] 降级状态与实际候选策略不同 → 同时返回 `mode`、`fallbackMode`，候选自身记录实际 `rerankMode`。

## Migration Plan

1. 部署代码和新增配置；未选择 model 时行为保持不变。
2. 配置 `RERANK_URL` 与密钥后，可通过内部调用或全局配置逐步启用 model。
3. 观察失败率、fallbackMode 和时延；异常时将 `RAG_RERANK_MODE` 切回 `rule` 或 `none`。
4. 回滚无需数据迁移，移除 model 配置并恢复旧策略实现即可。

## Open Questions

- 无。
