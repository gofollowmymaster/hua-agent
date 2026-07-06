## Architecture

Monorepo 使用原生 `pnpm workspace`：

```text
apps/
  api/        # NestJS 后端
  rag-admin/  # RAG 管理后台
packages/
  shared/     # 共享类型/工具预留
```

根目录只负责 workspace 调度、兼容脚本、部署入口和长期文档。后端 app 保持当前 NestJS 技术栈，前端 app 使用 Vue 3 + Vite + TypeScript。

## API App

- `apps/api` 保留现有后端目录结构，包括 `src`、`prisma`、`mockServer`、`public`、`scripts`。
- `apps/api/package.json` 承接当前后端依赖和脚本。
- 环境加载脚本从 API app 内读取 `.env*`：`dotenv -e .env.dev.local -e .env.dev -e .env`；根目录兼容脚本读取 `apps/api/.env*`。
- Prisma 命令在 `apps/api` 工作目录内执行，schema 路径保持 `prisma/schema.prisma` 与 `prisma/rag/schema.prisma`。
- 根目录旧脚本通过 `pnpm --filter @aplus-sql/api ...` 转发。

## RAG Admin Backend

- 新增 `RagAdminController` 和 `RagAdminService`，路由前缀 `ai/rag/admin`。
- 全部接口使用 `AuthGuard`，并通过 `TenantContext` 限制当前租户数据。
- 文档分页查询复用 `aplus_documents` 和 chunk 计数。
- 文档删除复用现有删除逻辑，不删除 raw 原文件。
- 重建索引复用 `RagIngestService.ingest({ force })`。
- 会话和消息查询使用 `aplus_rag_sessions`、`aplus_rag_messages`。

## RAG Admin Frontend

- 使用 hash 路由，页面包含文档管理和消息对话记录。
- 登录参考 `aplus-admin-wms`：`authHub` 初始化、cookie 保存 token、axios 请求注入 `Authorization: Bearer <token>`。
- 构建输出目录为 `../api/public/rag-admin`，由 Nest 已有 `/public` 静态服务访问。
- 默认同源调用 API；开发环境通过 Vite proxy 转发 `/ai` 到后端。

## Deployment

- Docker 仍复制整个仓库并运行根目录兼容脚本。
- PM2 在 `apps/api` 工作目录内运行，script 保持指向 `./dist/main.js`。
- 根目录保留 `Dockerfile`，`apps/api` 自身不新增 Dockerfile。
