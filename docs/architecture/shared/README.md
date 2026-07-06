# Shared 包架构说明

`packages/shared` 是 monorepo 中预留的共享包，当前只适合承载跨端稳定类型和无运行时副作用工具。实现规范见 `docs/standard/shared/README.md`。

## 当前状态

- 包名：`@aplus-sql/shared`。
- 目录：`packages/shared`。
- 入口：`packages/shared/src/index.ts`。
- 当前不承载 API 服务、前端组件、Prisma model 或运行时适配器。

## 阅读入口

- `package-boundary.md`：shared 包边界、允许内容和禁止内容。

涉及 shared 变更时，同时检查所有消费者，包括 `apps/api` 和 `apps/rag-admin`。
