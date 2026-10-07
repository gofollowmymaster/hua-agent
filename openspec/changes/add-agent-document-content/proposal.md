## Why

`agent_documents` 当前只保存文档元数据和切片，无法从数据库恢复原始 Markdown 全文。Business Agent 的 `get_document` 工具也只能读取元数据，检索命中后不能获取完整文档内容。

## What Changes

- 为 `agent_documents` 增加完整原始 Markdown 内容字段，并兼容已有数据。
- NestJS 与 FastAPI 入库时同时保存原文，清洗后的正文仍只用于切片和向量化。
- 历史空内容记录在下一次普通入库时自动补齐。
- Business Agent 的 `get_document` 工具返回不截断的完整文档内容。
- 管理列表和详情接口保持现有响应结构，不加载或返回全文。

## Capabilities

### Modified Capabilities

- `agent-knowledge-ingest`: 保存完整原始 Markdown，并自动补齐历史记录。
- `agent-chat-tools`: `get_document` 返回当前租户文档的完整内容。

## Impact

- 影响共享 RAG schema、增量迁移、双栈 Agent 知识库入库和 Business Agent 工具。
- 不修改 HTTP 路由、请求参数、管理接口响应或切片检索语义。
