## Why

当前 RAG 问答能力独立存在于 `aplus-rag` 示例工程，无法在本服务中统一部署和调用。迁移后，本项目可直接提供企业资料入库、检索增强问答和流式问答接口。

## What Changes

- 在 `src/ai/` 下新增 RAG 子模块，提供文档扫描入库、问答、SSE 流式问答、文档列表和删除能力。
- 保留 PostgreSQL + pgvector 作为 RAG 专用向量库，不复用本项目 MySQL/Prisma 主库。
- 新增 RAG 数据库初始化脚本、schema、模型/embedding/资料目录配置。
- 将源项目 `raw/` 资料复制到本仓库，接口暂不增加鉴权。
- 新增 LangChain、文档解析、PostgreSQL 客户端相关依赖。

## Capabilities

### New Capabilities

- `rag-knowledge-qa`: 企业资料 RAG 入库、检索增强问答、流式问答和索引文档管理。

### Modified Capabilities

无。

## Non-goals

- 不把 embedding 存入 MySQL/Prisma。
- 不新增接口鉴权、权限模型或租户隔离。
- 不迁移源项目 `.env` 中的真实密钥。

## Impact

- 影响 `src/ai` 模块注册、`package.json`/lockfile、环境变量模板、`prisma/rag`、`scripts` 和新增 `raw/` 资料目录。
- 运行依赖新增一个可用的 PostgreSQL + pgvector 实例，并要求配置 `RAG_DATABASE_URL`。
