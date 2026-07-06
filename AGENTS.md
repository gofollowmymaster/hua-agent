# AGENTS.md

## 技术栈

- **Monorepo**: pnpm workspace
- **后端**: NestJS + TypeScript（`apps/api`）
- **前端**: Vue 3 + Vite + TypeScript（`apps/rag-admin`）
- **共享包**: `packages/shared`
- **ORM**: Prisma (MySQL)
- **缓存/队列**: Redis + BullMQ
- **代码检查**: ESLint + Prettier

## 常用命令

### 环境加载（API 重要）

后端依赖环境变量的命令始终在命令前加上正确的环境加载器：

```bash
pnpm env:dev   -- 用于开发环境
pnpm env:test  -- 用于测试环境
pnpm env:prod  -- 用于生产环境
```

前端 `apps/rag-admin` 使用 Vite 环境加载机制，不套用 API 的 `pnpm env:* -- ...`。

### API 后端

```bash
pnpm start:dev          # API 开发模式运行（支持热重载）
pnpm build:dev          # API 开发环境构建
pnpm start:debug        # API 调试模式
pnpm test               # API 单元测试（apps/api/src 下的 *.spec.ts）
pnpm test:cov           # API 覆盖率测试
pnpm lint               # API ESLint --fix
pnpm format             # API Prettier 写入格式化结果
```

### RAG Admin 前端

```bash
pnpm rag-admin:dev      # 前端开发服务
pnpm rag-admin:build    # 前端类型检查和生产构建
pnpm rag-admin:preview  # 前端构建预览
```

### 数据库（Prisma）

```bash
pnpm pg                 # prisma generate（mysql + rag）
pnpm pf                 # prisma format
pnpm migrate:dev        # 创建迁移（开发环境）
pnpm migrate:test       # 创建迁移（测试环境）
pnpm migrate:prod       # 应用迁移（生产环境）
pnpm pmSdo              # 打开 Prisma Studio
```

### 构建与部署

```bash
pnpm docker:dev         # 在 Docker 中通过 PM2 运行开发环境
pnpm docker:test        # 在 Docker 中通过 PM2 运行测试环境
pnpm docker:prod        # 在 Docker 中通过 PM2 运行生产环境
```

## 环境文件

API 后端环境变量位于 `apps/api/`，通过根目录兼容脚本或 API app 脚本加载。`dotenv-cli` 按下列顺序读取，已存在变量不会被后续文件覆盖，因此本地文件优先：

- `dev`: `apps/api/.env.dev.local` → `apps/api/.env.dev` → `apps/api/.env`
- `test`: `apps/api/.env.test.local` → `apps/api/.env.test` → `apps/api/.env`
- `prod`: `apps/api/.env.prod.local` → `apps/api/.env.prod` → `apps/api/.env`

RAG Admin 前端环境变量位于 `apps/rag-admin/`，仅使用 `VITE_` 前缀变量：

- 通用：`apps/rag-admin/.env`
- 开发：`apps/rag-admin/.env.development`，本地覆盖使用 `apps/rag-admin/.env.local`
- 测试：`apps/rag-admin/.env.test`
- 生产：`apps/rag-admin/.env.production`

## 路径别名

- API: `@src/*` → `apps/api/src/*`（在 API app 内解析为 `src/*`）
- API: `@utils/*` → `apps/api/src/utils/*`
- API: `@mockServer/*` → `apps/api/mockServer/*`
- RAG Admin: `@` → `apps/rag-admin/src`

## 文档读取路由

AI 任务默认先读：

1. `docs/ai-governance/README.md`
2. 按任务范围读取对应架构和规范：
   - workspace：`docs/architecture/workspace.md`、`docs/standard/workspace.md`
   - API：`docs/architecture/api/README.md`、`docs/standard/api/README.md`
   - RAG Admin：`docs/architecture/rag-admin/README.md`、`docs/standard/rag-admin/README.md`
   - Shared：`docs/architecture/shared/README.md`、`docs/standard/shared/README.md`
   - Cross-app：workspace 文档 + 受影响子项目文档
3. 需要执行或交付时读 `docs/ai-governance/development-workflow.md` 和 `docs/ai-governance/testing-and-verification.md`

`AGENTS.md` 只保留高频硬规则、常用命令、路径入口和最短读取路径。长期架构事实写入 `docs/architecture/`，开发规范写入 `docs/standard/`，AI 工作流写入 `docs/ai-governance/`。

## Prisma

- Schema: `apps/api/prisma/schema.prisma`、`apps/api/prisma/rag/schema.prisma`
- 数据库: MySQL
- 二进制目标: `native`, `debian-openssl-3.0.x`
- Schema 变更后始终运行 `pnpm pg`

## OpenSpec 工作流

本仓库使用 OpenSpec 进行变更管理：

- 变更位于 `openspec/changes/`
- 使用技能：`openspec-propose`、`openspec-apply-change`、`openspec-archive-change`
- 通过 `/opsx-propose`、`/opsx-apply`、`/opsx-archive` 运行

## 代码风格

- **Prettier**: 单引号、尾随逗号
- **ESLint**: TypeScript 推荐规则（关闭 no-explicit-any）
- **TypeScript**: 关闭 strictNullChecks、关闭 noImplicitAny
