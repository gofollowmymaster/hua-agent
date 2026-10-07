# AGENTS.md

## 适用范围

本文件是 monorepo 根入口，只保留 workspace 级规则、根命令路由和文档读取路由。子项目细节见：

- API 后端：`apps/api/AGENTS.md`
- Python API 后端：`apps/python-api/AGENTS.md`
- RAG Admin 前端：`apps/rag-admin/AGENTS.md`
- React Admin 前端：`apps/react-admin/AGENTS.md`

## Workspace

- **包管理器**: pnpm workspace
- **后端 app**: `apps/api`（NestJS + TypeScript）
- **双栈后端 app**: `apps/python-api`（Python 3.12 + FastAPI，默认端口 8000）
- **前端 app**: `apps/rag-admin`（Vue 3 + Vite）与 `apps/react-admin`（React 18 + Umi Max + Ant Design Pro）
- **共享包**: `packages/shared`、`packages/ui-kit`、`packages/react-ui-kit`、`packages/http-client`
- **根目录职责**: workspace 调度、兼容脚本、OpenSpec、部署入口和 AI 治理入口

## 根目录命令

根目录不提供 `env:*` 脚本。API 根兼容命令通过 `pnpm --filter @aplus-sql/api ...` 转发到 `apps/api`，由 API app 自身脚本加载环境变量。

常用根命令：

```bash
pnpm start:dev          # 转发到 API 开发模式
pnpm build:dev          # 转发到 API 构建
pnpm test               # 转发到 API Jest
pnpm pg                 # 转发到 API Prisma generate
pnpm admin:dev          # RAG Admin 开发服务
pnpm admin:build        # RAG Admin 类型检查和生产构建
pnpm admin:lint         # 转发到 RAG Admin ESLint（--fix）
pnpm admin:lint:check   # 转发到 RAG Admin ESLint（只检查）
pnpm admin:format       # 转发到 RAG Admin Prettier（--write）
pnpm admin:format:check # 转发到 RAG Admin Prettier（只检查）
pnpm admin:stylelint       # 转发到 RAG Admin Stylelint（--fix）
pnpm admin:stylelint:check # 转发到 RAG Admin Stylelint（只检查）
pnpm react-admin:dev        # React Admin 开发服务（5175）
pnpm react-admin:build      # React Admin 生产构建
pnpm react-admin:test       # React Admin Vitest
pnpm react-admin:typecheck  # React Admin TypeScript 只检查
pnpm react-admin:lint:check # React Admin ESLint（只检查）
pnpm react-admin:antd:info Button # 查询当前 antd 组件 API
pnpm react-admin:antd:lint  # React Admin Ant Design 专项检查
pnpm react-admin:check      # React Admin 静态检查与单测汇总
pnpm python-api:dev         # FastAPI 开发服务（8000）
pnpm python-api:start       # FastAPI 生产启动（默认 prod）
pnpm python-api:test        # FastAPI pytest
pnpm python-api:lint        # FastAPI Ruff 只检查
pnpm python-api:typecheck   # FastAPI mypy
pnpm python-api:build       # 构建 Python wheel/sdist
pnpm digital-avatar:import:dev  # 将数字分身 txt 导入开发数据库
pnpm digital-avatar:import:test # 将数字分身 txt 导入测试数据库
pnpm digital-avatar:import:prod # 将数字分身 txt 导入生产数据库
pnpm rag:db:init            # 使用开发环境配置初始化共享 RAG 数据库
pnpm rag:db:check           # 使用开发环境配置检查 Skill 表及索引
pnpm ui-kit:build          # UI Kit 类型检查
pnpm ui-kit:test           # UI Kit Vitest
pnpm react-ui-kit:build    # React UI Kit 类型检查
pnpm react-ui-kit:test     # React UI Kit Vitest
pnpm http-client:build     # HTTP Client 类型检查
pnpm http-client:test      # HTTP Client Vitest
```

共享 RAG 数据库初始化和检查同时提供 `:dev`、`:test`、`:prod` 后缀命令；部署 NestJS 或 FastAPI 前必须选择目标环境执行对应命令。

格式化和 lint 命令会改写文件，执行前确认这是当前任务的一部分：

```bash
pnpm lint
pnpm lint:check
pnpm format
```

提交前使用 `husky` + `lint-staged` 对暂存的 API TS、RAG Admin TS/Vue 和 React Admin TS/TSX 文件执行 ESLint 只检查；需要临时跳过时使用 `git commit --no-verify`。
提交信息使用 Conventional Commits，通过 `@commitlint/config-conventional` 校验，例如 `feat: xxx`、`fix: xxx`。

## 子项目入口

进入具体 app 工作时，优先读取对应 app 级规则：

- 修改 `apps/api/**`：读 `apps/api/AGENTS.md`
- 修改 `apps/python-api/**`：读 `apps/python-api/AGENTS.md`
- 修改 `apps/rag-admin/**`：读 `apps/rag-admin/AGENTS.md`
- 修改 `apps/react-admin/**`：读 `apps/react-admin/AGENTS.md`
- 修改 `packages/shared/**`：读 `packages/shared/docs/architecture/README.md` 和 `packages/shared/docs/standard/README.md`
- 修改 `packages/ui-kit/**`：读 `packages/ui-kit/docs/architecture/README.md`、`packages/ui-kit/docs/standard/README.md`、受影响前端规范和整体产品设计规范
- 修改 `packages/react-ui-kit/**`：读 `packages/react-ui-kit/docs/architecture/README.md`、`packages/react-ui-kit/docs/standard/README.md`、React Admin 规范和整体产品设计规范
- 修改 `packages/http-client/**`：读 `packages/http-client/docs/architecture/README.md`、`packages/http-client/docs/standard/README.md` 和受影响前端的 API client 架构文档
- 修改跨端契约、根脚本、构建/部署边界：读 `AGENTS.md`、`docs/ai-governance/README.md` 和受影响子项目文档

## 文档读取路由

AI 任务默认先读：

1. `docs/ai-governance/README.md`
2. 按任务范围读取对应架构和规范：
   - workspace：`AGENTS.md`、`docs/ai-governance/README.md`
   - API：`apps/api/docs/architecture/README.md`、`apps/api/docs/standard/README.md`
   - Python API：`apps/python-api/docs/architecture/README.md`、`apps/python-api/docs/standard/README.md`
   - 前端通用架构与规范：`docs/standard/frontend/README.md`、`docs/standard/frontend/architecture/README.md`、`docs/standard/frontend/development/`
   - RAG Admin：`apps/rag-admin/standard/architecture/README.md`、`apps/rag-admin/standard/development/README.md`
   - React Admin：`apps/react-admin/standard/architecture/README.md`、`apps/react-admin/standard/development/README.md`
   - 整体产品设计：`docs/standard/design/README.md`（前端、UI、交互相关任务必读）
   - Shared：`packages/shared/docs/architecture/README.md`、`packages/shared/docs/standard/README.md`
   - UI Kit：`packages/ui-kit/docs/architecture/README.md`、`packages/ui-kit/docs/standard/README.md` + 受影响前端文档
   - React UI Kit：`packages/react-ui-kit/docs/architecture/README.md`、`packages/react-ui-kit/docs/standard/README.md` + React Admin 文档
   - HTTP Client：`packages/http-client/docs/architecture/README.md`、`packages/http-client/docs/standard/README.md` + 受影响前端文档
   - Cross-app：`AGENTS.md`、`docs/ai-governance/README.md` + 受影响子项目文档
3. 需要执行或交付时读 `docs/ai-governance/development-workflow.md` 和 `docs/ai-governance/testing-and-verification.md`

长期架构事实写入 `apps/*/docs/architecture/` 或对应 `packages/*` 文档（前端 app 为 `apps/*/standard/architecture/`），多前端 app 共用架构约定写入 `docs/standard/frontend/`，完整子项目开发规范写入 `apps/*/docs/standard/` 或对应 package 文档（前端 app 为 `apps/*/standard/development/`），整体产品设计规范写入 `docs/standard/design/`，AI 工作流写入 `docs/ai-governance/`。不要把完整子项目规范复制到根 `AGENTS.md`。

## OpenSpec 工作流

本仓库使用 OpenSpec 进行变更管理：

- 变更位于 `openspec/changes/`
- 使用技能：`openspec-propose`、`openspec-apply-change`、`openspec-archive-change`
- 通过 `/opsx-propose`、`/opsx-apply`、`/opsx-archive` 运行

涉及行为变化、接口契约、数据库、跨 app/shared 公共能力、构建/部署边界或重要外部集成时，优先判断是否需要 OpenSpec change。

## 全局风格

- Prettier: API 使用 `apps/api/.prettierrc`；前端 app 与共享包使用各自 package 配置
- ESLint: TypeScript 推荐规则（关闭 no-explicit-any）
- ESLint / Prettier 及配套插件版本统一由 `pnpm-workspace.yaml` 的 `catalog` 管理，子项目通过 `catalog:` 引用
- TypeScript: 关闭 strictNullChecks、关闭 noImplicitAny
- AI 新增或实质修改类、类方法时，必须使用简洁 JSDoc 说明其职责；具体要求见 `docs/ai-governance/development-workflow.md`。
- 不修改与任务无关的文件，不回退用户或其他 agent 的改动。
- 文档和代码冲突时，以代码真实实现为准，并同步修正文档或在交付说明中说明差异。

<!-- antd-cli setup start -->

## Ant Design CLI Skill

Use the shared Ant Design skill at `.agents/skills/antd/SKILL.md` before working on Ant Design code in this repository.

The skill teaches agents when and how to call `@ant-design/cli` commands such as `antd info`, `antd doc`, `antd demo`, `antd token`, `antd semantic`, and `antd changelog`.

<!-- antd-cli setup end -->
