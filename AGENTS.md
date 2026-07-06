# AGENTS.md

## 适用范围

本文件是 monorepo 根入口，只保留 workspace 级规则、根命令路由和文档读取路由。子项目细节见：

- API 后端：`apps/api/AGENTS.md`
- RAG Admin 前端：`apps/rag-admin/AGENTS.md`

## Workspace

- **包管理器**: pnpm workspace
- **后端 app**: `apps/api`（NestJS + TypeScript）
- **前端 app**: `apps/rag-admin`（Vue 3 + Vite + TypeScript）
- **共享包**: `packages/shared`
- **根目录职责**: workspace 调度、兼容脚本、OpenSpec、部署入口和 AI 治理入口

## 根目录命令

根目录不提供 `env:*` 脚本。API 根兼容命令通过 `pnpm --filter @aplus-sql/api ...` 转发到 `apps/api`，由 API app 自身脚本加载环境变量。

常用根命令：

```bash
pnpm start:dev          # 转发到 API 开发模式
pnpm build:dev          # 转发到 API 构建
pnpm test               # 转发到 API Jest
pnpm pg                 # 转发到 API Prisma generate
pnpm rag-admin:dev      # RAG Admin 开发服务
pnpm rag-admin:build    # RAG Admin 类型检查和生产构建
```

格式化和 lint 命令会改写文件，执行前确认这是当前任务的一部分：

```bash
pnpm lint
pnpm format
```

## 子项目入口

进入具体 app 工作时，优先读取对应 app 级规则：

- 修改 `apps/api/**`：读 `apps/api/AGENTS.md`
- 修改 `apps/rag-admin/**`：读 `apps/rag-admin/AGENTS.md`
- 修改 `packages/shared/**`：读 `packages/shared/docs/architecture/README.md` 和 `packages/shared/docs/standard/README.md`
- 修改跨端契约、根脚本、构建/部署边界：读 `AGENTS.md`、`docs/ai-governance/README.md` 和受影响子项目文档

## 文档读取路由

AI 任务默认先读：

1. `docs/ai-governance/README.md`
2. 按任务范围读取对应架构和规范：
   - workspace：`AGENTS.md`、`docs/ai-governance/README.md`
   - API：`apps/api/docs/architecture/README.md`、`apps/api/docs/standard/README.md`
   - RAG Admin：`apps/rag-admin/docs/architecture/README.md`、`apps/rag-admin/docs/standard/README.md`
   - Shared：`packages/shared/docs/architecture/README.md`、`packages/shared/docs/standard/README.md`
   - Cross-app：`AGENTS.md`、`docs/ai-governance/README.md` + 受影响子项目文档
3. 需要执行或交付时读 `docs/ai-governance/development-workflow.md` 和 `docs/ai-governance/testing-and-verification.md`

长期架构事实写入 `apps/*/docs/architecture/` 或 `packages/shared/docs/architecture/`，开发规范写入 `apps/*/docs/standard/` 或 `packages/shared/docs/standard/`，AI 工作流写入 `docs/ai-governance/`。不要把完整子项目规范复制到根 `AGENTS.md`。

## OpenSpec 工作流

本仓库使用 OpenSpec 进行变更管理：

- 变更位于 `openspec/changes/`
- 使用技能：`openspec-propose`、`openspec-apply-change`、`openspec-archive-change`
- 通过 `/opsx-propose`、`/opsx-apply`、`/opsx-archive` 运行

涉及行为变化、接口契约、数据库、跨 app/shared 公共能力、构建/部署边界或重要外部集成时，优先判断是否需要 OpenSpec change。

## 全局风格

- Prettier: 单引号、尾随逗号
- ESLint: TypeScript 推荐规则（关闭 no-explicit-any）
- TypeScript: 关闭 strictNullChecks、关闭 noImplicitAny
- 不修改与任务无关的文件，不回退用户或其他 agent 的改动。
- 文档和代码冲突时，以代码真实实现为准，并同步修正文档或在交付说明中说明差异。
