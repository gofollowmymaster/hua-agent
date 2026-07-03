# AGENTS.md

## 技术栈

- **框架**: NestJS + TypeScript
- **ORM**: Prisma (MySQL)
- **包管理器**: pnpm
- **缓存/队列**: Redis + BullMQ
- **代码检查**: ESLint + Prettier

## 常用命令

### 环境加载（重要）

始终在命令前加上正确的环境加载器：

```bash
pnpm env:dev   -- 用于开发环境
pnpm env:test  -- 用于测试环境
pnpm env:prod  -- 用于生产环境
```

### 开发

```bash
pnpm start:dev          # 以开发模式运行（支持热重载）
pnpm build:dev         # 开发环境构建
pnpm start:debug       # 调试模式
```

### 数据库（Prisma）

```bash
pnpm pg                # prisma generate - 生成 Prisma 客户端
pnpm pf                # prisma format
pnpm migrate:dev       # 创建迁移（开发环境）
pnpm migrate:test      # 创建迁移（测试环境）
pnpm migrate:prod      # 应用迁移（生产环境）
pnpm pmSdo             # 打开 Prisma Studio
```

### 构建与部署

```bash
pnpm docker:dev         # 在 Docker 中通过 PM2 运行开发环境
pnpm docker:test        # 在 Docker 中通过 PM2 运行测试环境
pnpm docker:prod        # 在 Docker 中通过 PM2 运行生产环境
```

### 代码质量

```bash
pnpm lint              # ESLint --fix
pnpm format            # Prettier 写入格式化结果
```

### 测试

```bash
pnpm test              # 单元测试（jest，来自 src/ 下的 *.spec.ts）
pnpm test:cov          # 带覆盖率的测试
```

## 环境文件

环境变量按以下顺序加载（后加载的会覆盖先加载的）：

- `dev`: `.env` → `.env.dev` → `.env.dev.local`
- `test`: `.env` → `.env.test` → `.env.test.local`
- `prod`: `.env` → `.env.prod` → `.env.prod.local`

## 路径别名

- `@src/*` → `src/*`
- `@utils/*` → `src/utils/*`
- `@mockServer/*` → `mockServer/*`

## 架构

### 长期文档与读取顺序

- AI 任务默认先读：`docs/ai-governance/README.md`
- 涉及代码实现、模块设计、配置变更、Redis key、缓存、定时任务或队列处理变更时继续读：`docs/standard/README.md`
- 需要理解项目结构、模块组成、关键基础设施时读：`docs/architecture/README.md`
- AI 工作原则、任务分级、OpenSpec 判断、开发工作流、测试验证、风险边界和交付要求沉淀在 `docs/ai-governance/`
- 代码风格、模块设计、配置规范、Redis key 与缓存使用、定时任务与队列处理规范沉淀在 `docs/standard/`
- 项目架构、目录边界、业务模块、飞书集成、权限/多租户模型沉淀在 `docs/architecture/`
- `AGENTS.md` 只保留高频硬规则、常用命令、路径入口和最短读取路径，避免与专题文档重复维护

### 模块结构

```
src/
├── manage/       # 管理功能
├── robot/        # 飞书机器人集成
├── ai/           # AI 功能
├── admin/        # 管理后台
├── doc/          # 文档
├── alert/        # 告警系统
├── fd-copilot/   # 前端 Copilot
├── devops/       # DevOps 集成
├── common/       # 共享内容：守卫、过滤器、拦截器、中间件、服务
│   └── service/  # 全局服务：Redis、Logger、Prisma、TenantContext
├── config/       # 支持租户的配置（A、yurex、boat）
└── main.ts       # 入口文件（端口 3000）
```

### 全局服务（处处可用）

- `PrismaService` - 通过 Prisma 访问数据库
- `RedisService` / `RedisProvider` - Redis 操作
- `LoggerService` - Winston 日志
- `TenantContext` - 多租户支持

### API 文档

- Swagger UI: `/swagger`（仅在 `NODE_ENV=dev` 时可用）
- Swagger JSON: `/swagger/json`

## Prisma

- Schema: `prisma/schema.prisma`
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

## 测试说明

- 仅发现 1 个 spec 文件（`src/alert/common/service/msg-alert.service.spec.ts`）
- 测试使用 `@nestjs/testing` 和 `supertest`
- 测试文件模式：src 目录下的 `*.spec.ts`
