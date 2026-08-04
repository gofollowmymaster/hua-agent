## Why

现有 RAG 的 `model` 重排模式仍固定回退规则重排，无法使用模型相关性评分提升融合候选的排序质量。需要接入 DashScope `qwen3-rerank`，同时保留请求级策略选择和可观测的降级语义。

## What Changes

- 新增 Qwen3 模型重排策略，通过 DashScope 原生 API 对候选片段评分和排序。
- 支持内部问答调用按请求选择 `none | rule | model`，请求参数优先于全局配置。
- 模型失败时回退规则重排，规则也失败时回退融合候选，并记录非敏感诊断。
- 新增 rerank endpoint、模型、密钥和超时的集中配置。
- 保持 HTTP、SSE、AGUI、企微协议及公开响应结构不变。

## Non-goals

- 不向公开 DTO 或 query 参数暴露重排模式。
- 不实现批量请求、重试、熔断或新的重排模型供应商。
- 不修改召回、融合、规则重排算法和数据库 schema。

## Capabilities

### New Capabilities

- `qwen3-model-rerank`: 使用 DashScope Qwen3 模型执行可配置、可降级的 RAG 候选重排。

### Modified Capabilities

- 无。

## Impact

- 影响 RAG 内部类型、检索 facade、LangGraph 重排节点、rerank 策略及 `AiModule`。
- 新增 DashScope 外部调用和 `RERANK_*` 环境配置，复用现有 `HttpModule`。
- model 模式会向配置的 endpoint 发送 query 和候选正文；日志及 trace 不记录这些内容。
