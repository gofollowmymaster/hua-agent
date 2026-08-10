## Context

`apps/api/src/agent/docs` 下已有 207 个 Markdown 业务文档，`AgentModule` 目前只是空模块骨架。现有 RAG 模块已经具备 Markdown 加载、文本切分、OpenAI Embeddings、pgvector 向量检索和 zhparser 中文全文检索能力，但 `aplus_documents` / `aplus_chunks` 面向企业微信 RAG 问答，字段与业务 Agent 文档元数据不完全匹配。

## Goals / Non-Goals

**Goals:**

- 为业务 Agent 建立独立的知识库表，避免与现有 RAG 数据耦合。
- 提供可独立执行的 Markdown 清洗入库程序。
- 提供按租户隔离的全文检索、向量检索和混合检索接口。
- 复用现有 RAG PostgreSQL、pgvector、zhparser 和 embedding 配置。

**Non-Goals:**

- 不做 RAG Admin 前端页面。
- 不做基于检索结果的 LLM 问答。
- 不修改现有 RAG 企业知识库表结构和行为。

## Decisions

- **独立表放在同一 RAG PostgreSQL**：新增 `agent_documents`、`agent_chunks`，与 `aplus_documents`、`aplus_chunks` 平级，避免引入第二套数据库；`schema.sql` 和迁移 SQL 同时维护，`pnpm pg` 生成新 Prisma 模型。
- **独立清洗程序使用 Nest application context**：`scripts/agent-knowledge-ingest.ts` 通过 `NestFactory.createApplicationContext(AgentModule)` 复用入库 Service、`NodeConfigService` 和 Prisma client，避免脚本与 HTTP 代码重复实现清洗/切分/向量化逻辑。
- **租户与分类双字段**：按用户确认增加 `tenant_code`，脚本按 docs 顶层目录写入租户；`category` 改为 docs 二级目录名，并去除 `Yurex`、`Aplus`、`Boat` 等租户展示前缀。
- **全文与向量双路检索**：全文检索复用 zhparser `to_tsvector`，向量检索复用 OpenAI Embeddings + pgvector 余弦距离；`hybrid` 模式对双路候选做 Reciprocal Rank Fusion 后返回。
- **配置独立于 RAG**：新增 `agentKnowledge` 配置块，包含 docs 目录、chunk size、overlap 和 embedding batch size，避免长期复用语义不匹配的 `vcHelper` 配置。
- **只入库 Markdown**：扫描时按 `.md` 后缀过滤，pdf、xlsx、图片及其他文件只计入跳过，不解析不写库。

## Risks / Trade-offs

- [embedding 维度变化] → 表和索引固定使用 `vector(1024)`，配置变更时需先迁移表结构，避免维度不匹配。
- [全文检索依赖 zhparser] → 迁移 SQL 复用现有 `zhparser` 配置创建逻辑，保证新表索引可用。
- [混合检索排序简单] → 使用 RRF，不引入重排模型，后续需要更高精度时再接入现有 rerank 能力。
- [脚本直接连生产 RAG 库] → 命令通过 `env:*` 加载对应环境变量，执行前由流水线控制环境。

## Migration Plan

1. 更新 `apps/api/prisma/rag/schema.prisma` 和 `schema.sql`。
2. 新增迁移 `apps/api/prisma/rag/migrations/202608100001_add_agent_knowledge.sql`。
3. 运行 `pnpm pg` 重新生成 RAG Prisma client。
4. 对已存在 RAG 库执行迁移 SQL；`schema.sql` 保持幂等，可重复执行。
5. 回滚方式为删除 `agent_chunks` 和 `agent_documents`，不影响现有 `aplus_*` 数据。

## Open Questions

无。
