# AGENTS.md

## 适用范围

本文件只适用于 `apps/api` NestJS 后端应用。monorepo 根规则见 `../../AGENTS.md`；前端规则见 `../rag-admin/AGENTS.md`。

## 技术栈

- **框架**: NestJS + TypeScript
- **ORM**: Prisma (MySQL)
- **RAG 数据库**: Prisma + pgvector
- **缓存/队列**: Redis + BullMQ
- **定时任务**: `@nestjs/schedule`
- **外部集成**: 飞书、企业微信、OpenAI/LangChain
- **代码检查**: ESLint + Prettier

## 必读文档

API 任务按需读取：

- API 架构入口：`docs/architecture/README.md`
- API 开发规范：`docs/standard/README.md`
- API 验证矩阵：`../../docs/ai-governance/testing-and-verification.md`
- 涉及跨端接口、RAG Admin 调用或静态资源发布时，补读 `../../AGENTS.md` 和 `../rag-admin/docs/architecture/README.md`

本文档和 API 专题文档中的 `src/` 默认指 `apps/api/src/`，`prisma/` 默认指 `apps/api/prisma/`。

## 常用命令

在 `apps/api` 目录内执行：

```bash
pnpm start:dev          # 开发模式运行，加载 .env.dev.local/.env.dev/.env
pnpm build:dev          # 开发环境构建
pnpm start:debug        # 调试模式
pnpm test               # Jest 单元测试，匹配 src 下 *.spec.ts
pnpm test:cov           # 覆盖率测试
pnpm lint               # ESLint --fix，会改写文件
pnpm format             # Prettier 写入格式化结果，会改写文件
```

根目录也提供对应兼容命令，例如 `pnpm test`、`pnpm build:dev`、`pnpm pg`。

## 环境加载

本 app 提供环境加载脚本：

```bash
pnpm env:dev
pnpm env:test
pnpm env:prod
```

依赖环境变量的底层命令必须通过对应加载器执行。已有 app 脚本已经内置加载器，例如 `pnpm build:dev` 会执行 `pnpm env:dev -- nest build`。

环境文件加载顺序：

- `dev`: `.env.dev.local` → `.env.dev` → `.env`
- `test`: `.env.test.local` → `.env.test` → `.env`
- `prod`: `.env.prod.local` → `.env.prod` → `.env`

新增本地必填变量时，同步维护 `.env.dev.local.template`，不要提交真实密钥、token、数据库连接串或机器人 secret。

## Prisma

- MySQL schema: `prisma/schema.prisma`
- RAG schema: `prisma/rag/schema.prisma`
- 生成 client：`pnpm pg`
- 格式化 schema：`pnpm pf`
- 开发迁移：`pnpm migrate:dev`
- 测试迁移：`pnpm migrate:test`
- 生产迁移：`pnpm migrate:prod`

修改任一 Prisma schema 后始终运行 `pnpm pg`。需要迁移时，检查迁移只包含预期 schema 变化。

## 目录边界

- `src/main.ts`：应用入口。
- `src/app.module.ts`：根模块和全局中间件装配。
- `src/common/`：跨模块基础设施、守卫、异常、拦截器、中间件、全局服务、飞书 helper/table 等。
- `src/config/`：全局配置、数据库/Redis 配置、租户配置和 `NodeConfigService`。
- `src/ai/`：AI、Aily、RAG、日志操作相关能力。
- `src/doc/`、`src/alert/`、`src/devops/`、`src/manage/`、`src/robot/`：各业务域模块。
- `prisma/`：API app 的 Prisma schema 和迁移元信息。
- `public/`：静态资源目录，包含 RAG Admin 生产构建产物。

新增公共能力前先确认真实跨模块复用需求；不要在未搜索现有 Service、DTO、helper、adapter、table、Redis key 和异常类型前新增平行结构。

## API 实现规则

- Controller 只处理路由、Guard、DTO、调用 Service 和返回结果。
- Service 承载业务编排、事务边界、权限后的业务判断和外部能力调用。
- DTO 放在模块内 `dto/`，使用 `class-validator` 和全局 `ValidationPipe`。
- 飞书、外部系统、表格访问优先封装到 helper、adapter 或 table，不直接散写在业务 Service 中。
- 需要租户、用户或 request 信息时注入 `TenantContext`。
- 需要数据库、Redis、日志时分别注入 `PrismaService`/`RagPrismaService`、`RedisService`、`LoggerService`。

## 高风险规则

- 新增或修改接口、鉴权、响应结构、错误语义、数据库 schema、跨模块公共能力、外部系统集成时，优先判断是否需要 OpenSpec change。
- 涉及 Redis key、缓存、幂等、限流、多租户时，先读 `docs/standard/redis.md`。
- 涉及定时任务或 BullMQ processor 时，先读 `docs/standard/background-jobs.md`。
- 涉及鉴权、租户、固定 token 或租户配置时，先读 `docs/architecture/auth-and-tenant.md`。
- 涉及飞书 API、表格、卡片、事件、回调时，先读 `docs/architecture/feishu-integration.md`。

## 验证

- 普通 API 变更：优先运行相关 Jest 测试；必要时运行 `pnpm test` 或 `pnpm build:dev`。
- Prisma schema 变更：运行 `pnpm pg`；需要迁移时按环境执行迁移命令。
- Redis、租户、队列、飞书、鉴权变更：按 `../../docs/ai-governance/testing-and-verification.md` 的专项检查执行。
- 只改文档时不需要跑业务测试，但要做路径和引用静态校验。
