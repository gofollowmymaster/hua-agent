## Context

`RagQueryRewriteService` 与最终答案生成当前都读取 `modelName`。本地环境使用能力较强但响应更慢的 `qwen3.7-plus`，导致短文本结构化改写承担不必要的模型延迟，并阻塞后续并行召回节点。

## Goals / Non-Goals

**Goals:**

- 查询改写使用独立、可配置的轻量模型。
- 默认使用 `qwen-turbo`，不影响最终回答模型。
- 保持改写失败回退原问题和现有观测语义。

**Non-Goals:**

- 不改变 Prompt、记忆长度、超时、重试和模型 endpoint。
- 不调整 LangGraph 拓扑或公开协议。

## Decisions

### 1. 新增独立模型名称配置

在全局配置中新增 `queryRewriteModelName`，读取 `RAG_QUERY_REWRITE_MODEL` 并默认 `qwen-turbo`。`RagQueryRewriteService` 仅替换 `ChatOpenAI` 的 `model` 参数，继续复用 `openAiApiKey` 与 `openAiBaseUrl`。这样部署方可独立升级或回滚改写模型，而无需复制 endpoint 和密钥配置。

替代方案是在 Service 中写死 `qwen-turbo`，但不利于不同环境验证和模型下线后的切换；另一方案是复用 `MODEL_NAME`，无法实现性能隔离。

### 2. 保持改写业务语义

模型输入、结构化解析、日志字段和失败 fallback 均保持不变。单元测试更新为验证模型实际执行和结果归一化，并断言构造模型时使用独立配置。

## Risks / Trade-offs

- [Risk] 轻量模型的改写准确率低于回答模型 → 保留可配置模型名和原问题 fallback，可通过环境变量快速切回其他模型。
- [Risk] 部署 endpoint 不支持 `qwen-turbo` → 部署前验证模型可用性，或设置 `RAG_QUERY_REWRITE_MODEL` 为兼容模型。

## Migration Plan

1. 部署代码后默认使用 `qwen-turbo` 执行查询改写。
2. 观察 `rewrite_query` 节点耗时、fallback 比例及检索质量。
3. 回滚时将 `RAG_QUERY_REWRITE_MODEL` 设置为原 `MODEL_NAME` 对应值，无数据迁移。

## Open Questions

- 无。
