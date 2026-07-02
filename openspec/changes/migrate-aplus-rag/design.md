## Overview

将 `aplus-rag` 的能力作为 `AiModule` 下的 `src/ai/rag` 子模块迁入。本模块保持源项目功能和 pgvector 检索方式，同时适配本项目 NestJS 10、TypeScript、DTO、Swagger、配置和目录规范。

## Architecture

- `RagController` 使用 `@Controller('ai/rag')`，暴露入库、问答、SSE、文档列表、删除接口，暂不挂载 Guard。
- `RagService` 负责编排：扫描文件、读取文档、切块、生成 embedding、写入 pgvector、检索、构造 prompt、调用 ChatOpenAI。
- `DocumentLoaderService` 负责本地资料解析，支持 `.pdf/.docx/.xlsx/.ppt/.pptx/.txt/.md`。
- `RagDatabaseService` 封装 `pg.Pool`、普通查询、事务和应用关闭连接释放。
- `types.ts` 放模块内部稳定类型，DTO 放 `dto/`。

## Storage

- RAG 使用独立 PostgreSQL schema：`aplus_documents` 与 `aplus_chunks`。
- `aplus_chunks.embedding` 使用 `vector(1024)`，检索 SQL 保留 `embedding <=> queryVector` 和 HNSW cosine 索引。
- 初始化脚本 `scripts/rag-db-init.mjs` 读取 `database/rag/schema.sql`，连接 `RAG_DATABASE_URL`，不使用 Prisma migration。

## Configuration

- 新增配置项：`RAG_DATABASE_URL`、模型/embedding API 配置、`RAW_DIR`、chunk 参数、topK 参数。
- 业务代码通过本模块内配置读取工具统一解析数字和字符串默认值，避免复用 MySQL `DATABASE_URL`。
- 不提交真实 API key，只补充模板说明。

## Risks

- `pgvector` 依赖运行环境已安装 `vector` extension；初始化脚本失败时需先处理数据库环境。
- `raw/` 资料进入仓库会增加体积，后续若资料变大应改为部署挂载目录。
- 问答接口暂不鉴权，需由调用方或上游网络边界控制访问。
