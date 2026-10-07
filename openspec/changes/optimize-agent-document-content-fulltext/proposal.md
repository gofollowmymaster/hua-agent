## Why

业务 Agent 知识库的文档管理关键词筛选目前通过 `agent_chunks` 的关联子查询匹配正文。`agent_documents` 已保存完整原文，直接在文档表完成全文匹配可以减少关联与去重成本，并让分页对象和检索对象保持一致。

## What Changes

- NestJS 与 FastAPI 的文档管理关键词筛选直接查询 `agent_documents.content`。
- 为文档原文新增 zhparser GIN 表达式索引，并纳入数据库初始化检查。
- 保留元数据匹配、租户隔离、组合筛选、分页和排序语义。
- 保留 chunk 全文索引及 Business Agent `search_knowledge` 的 chunk 级检索行为。

## Capabilities

### Modified Capabilities

- `agent-knowledge-management`: 文档管理关键词正文匹配由切片表改为文档原文。

## Impact

- 影响共享 RAG 初始化 SQL、增量迁移、双栈文档分页查询、数据库检查及相关测试和架构文档。
- 不修改 HTTP、工具或搜索命中响应契约。
