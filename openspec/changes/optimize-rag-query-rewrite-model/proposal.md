## Why

查询改写当前复用最终回答的大模型，模型能力和延迟成本超出短文本改写所需，并串行阻塞后续召回。需要为该阶段配置独立的轻量模型以降低检索前等待时间。

## What Changes

- 查询改写使用独立模型配置，不再复用回答模型名称。
- 新增 `RAG_QUERY_REWRITE_MODEL`，默认使用 `qwen-turbo`。
- 继续复用现有 OpenAI-compatible endpoint 和 API key，保持失败回退原问题的语义。
- 保持 LangGraph 拓扑、公开接口和流事件不变。

## Non-goals

- 不增加查询跳过规则、超时、缓存或 Prompt 压缩。
- 不修改回答模型、召回算法和查询改写输出结构。

## Capabilities

### New Capabilities

- `rag-query-rewrite-model`: RAG 查询改写使用独立可配置的轻量模型。

### Modified Capabilities

- 无。

## Impact

- 影响 API 配置、查询改写 Service、环境模板和相关单元测试。
- 不新增依赖，不改变 HTTP、SSE、AGUI 或企微契约。
