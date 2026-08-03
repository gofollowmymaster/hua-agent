## Why

现有 RAG 问答已经支持会话记忆，但向量检索仍直接使用用户当前输入。连续追问、代词指代或省略上下文的问题容易检索不到正确片段，例如“那审批呢”“继续说配置要求”。需要在检索前将问题改写为独立、完整、适合 embedding 的查询。

## What Changes

- 新增 RAG 查询改写能力：加载短期记忆后，调用 LLM 将用户原问题改写为独立检索查询。
- 同步问答、SSE 流式问答、AGUI 问答和企业微信入口统一生效。
- 改写失败、改写为空或改写与原问题等价时自动回退原问题，不影响问答可用性。
- 回答生成仍使用用户原始问题，避免回答口吻和用户意图偏离。
- 公开 HTTP/流式/AGUI 响应结构保持不变，仅记录结构化日志用于排查检索质量。

## Capabilities

### New Capabilities

- `rag-query-rewrite`: 基于最近对话将用户问题改写为适合知识库检索的独立查询。

### Modified Capabilities

- `rag-knowledge-qa`: 问答链路在检索前默认执行查询改写，保留旧接口契约。

## Non-goals

- 不新增前端展示字段或调试接口。
- 不改变 DTO、HTTP 响应、SSE 事件或 AGUI 协议结构。
- 不做多查询扩展、HyDE、rerank 或检索融合。
- 不新增环境变量，沿用现有 OpenAI/LangChain 模型配置。

## Impact

- 影响 `src/ai/rag/services/qa`、`src/ai/rag/prompts` 和 `src/ai/ai.module.ts`。
- 需要补充查询改写、同步问答和流式问答相关单元测试。
