## Context

`agent_documents.content` 已完整回填原始 Markdown。文档管理关键词查询当前先在 `agent_documents` 过滤元数据，再通过 `EXISTS` 访问 `agent_chunks` 的 zhparser 索引。Business Agent 的 `search_knowledge` 仍需要 chunk 级结果，因此两种全文检索有不同职责。

## Decisions

- 文档管理查询直接使用 `to_tsvector('zhparser', d.content) @@ keyword_query.query`，不再关联 `agent_chunks`。
- 元数据的字符串包含匹配与 zhparser 无有效词元时的兼容行为保持不变。
- 新增 `idx_agent_documents_content_fts` GIN 表达式索引；保留 `idx_agent_chunks_content_fts` 供 `search_knowledge` 使用。
- 初始化 SQL、独立增量迁移和 `rag:db:check` 同步维护索引存在性。
- 不修改 `search_knowledge` SQL、RRF、返回类型和工具投影。

## Risks / Trade-offs

- 原始 Markdown 的 frontmatter 和图片语法也会参与分词，这是直接检索完整 `content` 的预期语义。
- 新 GIN 索引增加文档写入和存储成本，但文档更新频率低于 chunk 批量写入，且能消除管理分页的 chunk 关联。
