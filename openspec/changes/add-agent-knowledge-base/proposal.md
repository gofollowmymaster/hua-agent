## Why

业务 Agent 目前只有 `AgentModule` 骨架，`apps/api/src/agent/docs` 下已有的 207 个 Markdown 业务文档没有被结构化入库，无法支撑后续 Agent 会话的全文检索和向量检索。

## What Changes

- 在 RAG PostgreSQL 中新增独立表 `agent_documents` 和 `agent_chunks`，复用 pgvector 和 zhparser 能力。
- 新增独立 Markdown 清洗入库程序，只处理 `apps/api/src/agent/docs` 下的 `.md` 文档，跳过 pdf、xlsx、图片等原始文件。
- 入库时保留文档 frontmatter 元数据，以 docs 二级目录名作为 `category`（去除 Yurex 等租户前缀），并按现有租户体系写入 `tenant_code`。
- 在 `AgentModule` 下新增知识库子模块，提供入库、分页列表、删除和全文/向量/混合检索接口。

## Capabilities

### New Capabilities

- `agent-knowledge-ingest`: 扫描并清洗 docs 目录 Markdown，切分、向量化后写入独立知识库表。
- `agent-knowledge-retrieval`: 按租户提供全文检索、向量检索和混合检索。
- `agent-knowledge-management`: 按租户分页查看和删除已入库文档。

### Modified Capabilities

无。

## Impact

- 影响 `apps/api/prisma/rag/schema.prisma`、`schema.sql` 和 RAG 迁移目录。
- 影响 `apps/api/src/agent/`、`apps/api/scripts/`、`apps/api/package.json` 和根目录 `package.json`。
- 新增 RAG Prisma client 模型、HTTP 路由和配置项。
- 不修改现有 RAG 的 `aplus_documents` / `aplus_chunks` 表及现有接口。

## Non-goals

- 不包含 RAG Admin 前端管理页面。
- 不包含基于检索结果的 LLM 问答。
- 不改造现有 RAG 企业知识库的入库与检索链路。
