# Workspace 架构

本文记录 pnpm workspace 层的当前事实，包括根目录职责、包边界、脚本转发和构建产物关系。各子项目内部架构见 `docs/architecture/api/README.md`、`docs/architecture/rag-admin/README.md` 和 `docs/architecture/shared/README.md`。

## Workspace 包

`pnpm-workspace.yaml` 当前匹配：

- `apps/*`
- `packages/*`

实际 workspace 包：

- `@aplus-sql/api`：位于 `apps/api`。
- `@aplus-sql/rag-admin`：位于 `apps/rag-admin`。
- `@aplus-sql/shared`：位于 `packages/shared`。

根目录不承载业务源码，只承载 workspace 调度、兼容脚本、OpenSpec、部署入口和长期文档。

## 根脚本边界

根 `package.json` 保留后端历史命令的兼容入口，例如 `pnpm start:dev`、`pnpm build:dev`、`pnpm test`、`pnpm pg`，这些脚本通过 `pnpm --filter @aplus-sql/api ...` 转发到 API app。

RAG Admin 使用独立脚本：

- `pnpm rag-admin:dev`
- `pnpm rag-admin:build`
- `pnpm rag-admin:preview`

根目录的 `env:dev`、`env:test`、`env:prod` 只为 API 后端命令加载 `apps/api/.env*`。前端使用 Vite 自身的环境加载机制。

## 构建产物关系

`apps/rag-admin` 的 Vite 构建输出目录是 `apps/api/public/rag-admin`。API app 通过已有静态资源服务暴露该目录。

开发态前端默认运行在 Vite dev server，`/ai` 请求通过 Vite proxy 转发到 API 后端，默认目标为 `http://localhost:3000`。

## 边界原则

- `apps/api` 不能直接依赖 `apps/rag-admin` 源码。
- `apps/rag-admin` 不能直接引用 `apps/api/src` 内部实现。
- 前后端共享内容应先判断是否足够稳定；只有跨端稳定类型或无副作用工具才进入 `packages/shared`。
- 跨端交互以 HTTP API、静态资源发布和共享包导出为边界。

## 部署事实

当前部署仍以 API app 为运行主体。RAG Admin 生产构建产物放入 API 静态目录，由后端进程一并提供访问。根 Docker/PM2 入口继续通过 workspace 兼容脚本运行 API。
