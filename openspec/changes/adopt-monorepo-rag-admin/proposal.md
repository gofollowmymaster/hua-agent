## Why

当前仓库是单 NestJS 应用，后续需要同时承载后端 API 与 RAG 管理后台前端。继续把前端静态资源和后端源码混在根目录，会让构建、部署、依赖和模块边界越来越模糊。

## What Changes

- 将仓库调整为轻量 `pnpm workspace` monorepo。
- 将现有 NestJS 后端迁移到 `apps/api`，保留根目录旧命令兼容入口。
- 新增 `apps/rag-admin` Vue/Vite 管理后台，使用公司登录中心和 `@aplus-frontend/ui`。
- 新增 RAG 管理接口，支持文档管理和消息对话记录查看。
- 新增 `packages/shared` 作为共享包边界，首版不强制抽离业务代码。

## Capabilities

### New Capabilities

- `monorepo-workspace`: 后端、前端和共享包在同一 pnpm workspace 内管理。
- `rag-admin-console`: RAG 文档管理与会话消息记录后台。

### Modified Capabilities

- `rag-knowledge-qa`: 保持原问答能力，并增加管理后台所需查询接口。

## Non-goals

- 不引入 Turbo、Nx 或 Lerna。
- 不接入菜单权限、按钮权限。
- 不支持后台上传文档或导出对话记录。
- 不抽离现有后端公共代码到共享包。

## Impact

- 影响根目录 `package.json`、`pnpm-workspace.yaml`、Docker/PM2 启动路径、Nest 构建路径和 Prisma schema 路径。
- 影响所有后端源码、Prisma、mock、public、scripts 的目录位置。
- 新增前端 app 依赖和构建产物输出到 `apps/api/public/rag-admin`。
