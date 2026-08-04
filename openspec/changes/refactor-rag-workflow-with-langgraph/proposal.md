## Why

当前同步与流式 RAG 问答分别以 Service 手工编排，向量和关键词召回虽并行执行，但被封装在单一检索方法中，难以按步骤调试、追踪耗时和定位降级。需要使用 LangGraph 统一主链路，并将各召回通道建模为独立节点。

## What Changes

- 引入 LangGraph `StateGraph`，统一同步与流式问答的主流程编排。
- 将向量召回、关键词召回、融合和重排拆为独立可观测节点，并保持单路失败降级。
- 将各检索方式、候选融合和重排拆为独立可测试 Service，并由检索 facade 提供稳定入口。
- 通过 LangSmith trace 和结构化日志记录节点耗时、候选数与降级状态。
- 保持现有 HTTP、SSE、AGUI、企微机器人接口和事件结构不变。

## Non-goals

- 不引入 LangGraph checkpointer、人工审批或断点恢复。
- 不修改数据库 schema、召回算法、rerank 算法和查询改写当前固定 fallback 行为。

## Capabilities

### New Capabilities

- `rag-langgraph-workflow`: RAG 问答使用可观测的 LangGraph 节点编排，并以独立并行节点执行多路召回。

### Modified Capabilities

- 无。

## Impact

- 影响 `apps/api/src/ai/rag/services/qa/`、`AiModule`、API 依赖及相关单元测试。
- 新增 `@langchain/langgraph` 运行时依赖。
- 不影响公开 API、数据库和前端契约。
