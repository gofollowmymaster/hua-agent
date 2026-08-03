## Why

当前 RAG 问答只依赖 pgvector 语义召回，遇到专有名词、编号、文件名、短关键词或精确表达时命中不稳定。需要引入多路召回与统一重排边界，在一期提升召回稳定性，同时为后续模型 rerank 快速切换留好扩展点。

## What Changes

- 新增 RAG 多路召回：保留向量召回，并增加 PostgreSQL 全文关键词召回。
- 新增候选融合与去重：按片段维度合并多路结果，使用 RRF 融合排序。
- 新增 rerank 抽象：一期提供规则重排与空重排，后续可切换模型重排。
- 新增 RAG 检索配置：控制各路召回候选数、融合参数和重排模式。
- 新增 RAG chunk 全文索引迁移，复用 `zhparser`。

## Non-goals

- 不引入 Elasticsearch、Meilisearch 等外部检索系统。
- 不改变公开问答接口响应契约。
- 不在一期接入真实模型 rerank 调用。

## Capabilities

### New Capabilities

- `rag-hybrid-retrieval`: RAG 问答支持多路召回、候选融合、可切换重排与降级。

### Modified Capabilities

- 无。

## Impact

- 影响 `apps/api/src/ai/rag/services/qa/` 下 RAG 查询与流式问答检索路径。
- 影响 `apps/api/src/ai/rag/types/rag.type.ts` 和全局 RAG 配置类型。
- 影响 RAG PostgreSQL schema/migration，新增 chunk 内容全文索引。
- 需要补充相关单元测试并运行 Prisma client 生成。
