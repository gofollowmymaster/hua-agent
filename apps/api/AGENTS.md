# AGENTS.md

> ⚠️ **开发前强制自检**：收到 API 开发任务后，**必须**先在下方「开发前强制检查表」中找到任务类型，读取对应必读文档，并在回复中引用关键规则后再开始编码。

## 适用范围

本文件只适用于 `apps/api` NestJS 后端应用。monorepo 根规则见 `../../AGENTS.md`；前端规则见 `../rag-admin/AGENTS.md`。

本文档和 API 专题文档中的 `src/` 默认指 `apps/api/src/`，`prisma/` 默认指 `apps/api/prisma/`。

---

## 🔴 开发前强制检查表

AI 收到任务后，**按任务类型读取对应文档**，不可跳过。多个类型叠加时需读全部对应文档。

| 任务类型 | 必须读取的文档 | 自检要点 |
|----------|---------------|---------|
| 新增/修改 Controller | `docs/standard/code-style.md` | Controller 不放业务逻辑 |
| 新增/修改 Service | `docs/standard/code-style.md` + `docs/standard/module-design.md` | 依赖注入、不自行 new、外部调用按判断顺序 |
| 新增/修改 DTO | `docs/standard/code-style.md` | `class-validator` + 不放业务逻辑 |
| Prisma Schema 变更 | 本文件 Prisma 段 + `../../docs/ai-governance/testing-and-verification.md` | 改后运行 `pnpm pg` |
| 新增/修改模块 | `docs/architecture/directory-structure.md` + `docs/standard/module-design.md` | 目录边界、模块协作方式 |
| Redis key / 缓存 / 限流 / 幂等 | `docs/standard/redis.md` | key 枚举定义、禁止手动拼接、TTL |
| 鉴权 / 租户 / Guard | `docs/architecture/auth-and-tenant.md` | TenantContext、三类 Guard |
| 飞书集成 / 表格 / 卡片 / 回调 | `docs/architecture/feishu-integration.md` | ClientFactory、分层方式 |
| 配置变更 / 环境变量 | `docs/standard/configuration.md` | NodeConfigService，禁止 process.env |
| 公共能力抽取 | `docs/standard/code-style.md` + `docs/standard/module-design.md` | 跨模块复用才进 common |
| 跨端接口 / RAG Admin 调用 | `../../AGENTS.md` + `../rag-admin/standard/architecture/README.md` | 同步检查前后端 |

**操作要求**：读取文档后，在回复中列明确认过的关键规则（至少 3 条），再开始编码。

---

## 技术栈

- **框架**: NestJS + TypeScript
- **ORM**: Prisma + PostgreSQL/pgvector；MySQL schema 仅保留迁移链
- **缓存**: Redis
- **外部集成**: 飞书告警与表格鉴权、OpenAI/LangChain
- **代码检查**: ESLint + Prettier（配置位于 `apps/api/eslint.config.js`、`apps/api/.prettierrc`）

---

## 常用命令

在 `apps/api` 目录内执行：

```bash
pnpm start:dev          # 开发模式运行，加载 .env.dev.local/.env.dev/.env
pnpm build:dev          # 开发环境构建
pnpm start:debug        # 调试模式
pnpm test               # Jest 单元测试，匹配 src 下 *.spec.ts
pnpm test:cov           # 覆盖率测试
pnpm lint               # ESLint --fix，会改写文件
pnpm lint:check         # ESLint 只检查，不改写文件
pnpm format             # Prettier 写入格式化结果，会改写文件
```

根目录也提供对应兼容命令，例如 `pnpm test`、`pnpm build:dev`、`pnpm pg`。

---

## 环境加载

本 app 提供环境加载脚本：

```bash
pnpm env:dev
pnpm env:test
pnpm env:prod
```

依赖环境变量的底层命令**必须**通过对应加载器执行。已有 app 脚本已经内置加载器，例如 `pnpm build:dev` 会执行 `pnpm env:dev -- nest build`。

环境文件加载顺序：

- `dev`: `.env.dev.local` → `.env.dev` → `.env`
- `test`: `.env.test.local` → `.env.test` → `.env`
- `prod`: `.env.prod.local` → `.env.prod` → `.env`

新增本地必填变量时，同步维护 `.env.dev.local.template`，不要提交真实密钥、token、数据库连接串或机器人 secret。

---

## Prisma

- MySQL schema: `prisma/schema.prisma`
- RAG schema: `prisma/rag/schema.prisma`
- 生成 client：`pnpm pg`
- 格式化 schema：`pnpm pf`
- 开发迁移：`pnpm migrate:dev`
- 测试迁移：`pnpm migrate:test`
- 生产迁移：`pnpm migrate:prod`

修改任一 Prisma schema 后始终运行 `pnpm pg`。需要迁移时，检查迁移只包含预期 schema 变化。

---

## 目录边界

- `src/main.ts`：应用入口。
- `src/app.module.ts`：根模块和全局中间件装配。
- `src/common/`：跨模块基础设施、守卫、异常、拦截器、中间件、全局服务、飞书 helper/table 等。
- `src/config/`：全局配置、数据库/Redis 配置、租户配置和 `NodeConfigService`。
- `src/ai/`：知识问答、RAG Admin 管理接口、文档入库与检索。
- `src/agent/`：业务Agent知识库与多工具 Chat。
- `prisma/`：API app 的 Prisma schema 和迁移元信息。
- `public/`：静态资源目录，包含 Vue RAG Admin 与 React Admin 生产构建产物。

新增公共能力前先确认真实跨模块复用需求；不要在未搜索现有 Service、DTO、helper、adapter、table、Redis key 和异常类型前新增平行结构。

---

## 🔴 核心开发规则

以下规则从 `docs/standard/` 中提取，是 AI 最容易违反的高频规则。**违反这些将导致代码被退回**。

### Controller 规则

- ✅ 只负责：路由定义、Guard 声明、DTO 参数接收、调用 Service、返回结果
- ❌ 禁止：写业务逻辑、直接操作数据库/Redis、直接调用飞书 API、做复杂条件判断
- Guard 示例：`AuthGuard`、`SecretAuthGuard`、`CompositeAuthOrSecretGuard`

### Service 规则

- ✅ 负责：业务编排、事务边界、权限后的业务判断、外部能力调用
- ✅ 依赖通过 NestJS 构造函数注入，**不要自行 `new` 全局服务**
- ❌ 禁止：处理 HTTP 请求解析（那是 Controller/Interceptor 的职责）
- ❌ 禁止：散写 `process.env`，必须通过 `NodeConfigService` 读取

### DTO 规则

- ✅ 放在模块内 `dto/` 目录
- ✅ 使用 `class-validator` 装饰器 + `class-transformer`，依赖全局 `ValidationPipe`
- ❌ 禁止：在 DTO 中放业务逻辑、数据库操作
- 飞书响应类型、业务类型分别放对应目录，不塞进全局类型文件

### 文件与类型拆分规则

- ✅ 除 DTO 文件外，一个 TypeScript 文件只允许声明一个 `class`；新增 Controller、Service、adapter、table、schedule、processor 等类必须拆到独立的、按职责命名的文件。
- ✅ `type`、`interface`、`enum` 等类型声明必须放在独立类型文件，不得与 `class` 同文件声明；按归属放入模块的 `type/`、`common/type/`、`dto/` 或既有专用类型目录。
- ❌ 禁止：为图方便在 Controller、Service、DTO 或 adapter 文件中内联声明业务类型。

### 异常处理规则

- ✅ 优先使用 `src/common/exception/` 中已有的异常类
- ✅ 不需要飞书上报的异常用 `NotReportException`
- ❌ 禁止：直接 `throw new Error('xxx')` 而不使用项目中已定义的异常
- 创建自定义异常前先在 `src/common/exception/` 搜索是否已有合适类型

### 日志规则

- ✅ 请求级日志由 `LoggerMiddleware` 和 `ResponseInterceptor` 自动处理，不需要在 Controller/Service 中重复打日志
- ❌ 禁止：记录明文 token、secret、Authorization header、密码
- 业务日志通过注入 `LoggerService` 输出

### 命名规则

| 类型 | 命名格式 | 位置 |
|------|---------|------|
| Controller | `<Feature>Controller` | `src/<module>/` |
| Service | `<Feature>Service` | `src/<module>/` |
| Module | `<Feature>Module` | `src/<module>/` |
| DTO | `CreateXxxDto` / `QueryXxxDto` / `UpdateXxxDto` | `src/<module>/dto/` |
| Table Adapter | `<Domain>Table` | `src/common/table/` 或模块内 `table/` |
| Schedule | `<Purpose>Schedule` | `src/<module>/common/schedule/` |
| Processor | `<Purpose>Processor` | `src/<module>/common/processor/` |

### 公共代码规则

- ✅ 只有**已经出现跨模块复用**时才能进 `src/common/`
- ❌ 禁止：为假想的未来复用提前抽象
- ❌ 禁止：引入第二套同职责技术方案（如已有 axios 不再引入 got）
- 新增外部调用判断顺序：是否已有可复用能力 → 是否飞书 → 是否单模块私有 → 是否跨模块

### 配置规则

- ✅ 业务代码统一通过 `NodeConfigService` 读取配置
- ❌ 禁止：在 Service/Controller 中用 `process.env.XYZ` 直接读环境变量
- 全局通用非敏感常量放 `src/config/index.ts`
- 不同租户不同值放 `src/config/tenant/<tenant>.ts`
- 数字/布尔环境变量必须用 `numberEnv` / `maxNumberEnv` / `booleanEnv` 集中解析

### 模块设计规则

- 一个业务域对应一个 NestJS Module，模块名即为业务域名
- 模块间协作通过**公开 Service 或 adapter**，不直接访问对方内部实现
- 飞书基础 OpenAPI 封装 → `src/common/feishu/helper/`
- 跨模块复用的飞书表格 → `src/common/table/`
- 单模块私有的外部调用 → 模块内 `table/` 或 `adapter/`

---

## 🔴 高风险场景规则

以下场景涉及基础设施，错误代价高。**必须先读对应专题文档再动手**。

### Redis / 缓存

> 前置必读：`docs/standard/redis.md`

核心要点（不可仅依赖此摘要）：
- key 统一定义在 `src/common/const/redis-key.enum.ts` 的 `RedisKeys` 枚举中
- 构造 key 用 `RedisService.buildCacheKey` 或 `buildCacheKeyWithTemplates`，**禁止手动拼接**
- 所有 key 前缀为 `frontend-node:`
- 租户隔离 key 必须含 `{tenant}` 占位符
- 缓存必须有明确 TTL；长期不失效的 key 需有意设计
- 限流：`RedisService.limiter(key, limit, ttl)`，`true` = 已超阈值需阻断
- 幂等：`RedisService.idempotent(tag, handle, expireTime)`，默认过期 24h
- Pattern 批量操作基于 SCAN：`hasByPattern` / `getByPattern` / `delByPattern`
- `delByPattern` 长度 < 20 会抛错，pattern 必须足够具体

### 鉴权 / 租户

> 前置必读：`docs/architecture/auth-and-tenant.md`

核心要点（不可仅依赖此摘要）：
- `TenantMiddleware` 解析用户与租户，通过 `TenantContext`（AsyncLocalStorage）保存
- 需要当前用户/租户信息时注入 `TenantContext`，不要自行解析 header
- 三类 Guard：`AuthGuard`（Bearer JWT）、`SecretAuthGuard`（固定密钥）、`CompositeAuthOrSecretGuard`（JWT 或固定密钥）
- 租户配置通过 `NodeConfigService` 读取，禁止直接 import 租户配置文件

### 飞书集成

> 前置必读：`docs/architecture/feishu-integration.md`

核心要点（不可仅依赖此摘要）：
- 告警客户端通过 `ClientFactory` 创建，当前只保留 `FeishuApp.AlertClient`
- 飞书表格访问通过保留的 helper 与 `ClientSecretTable` 分层封装
- **不直接散写飞书 API 调用**，先判断是否已有 helper 或 adapter 可用

---

## 🔴 禁止模式（Anti-Patterns）

以下模式**绝对禁止**，发现即退回：

1. **禁止直接 `throw new Error()`** — 必须使用 `src/common/exception/` 中已有异常类型或 `NotReportException`
2. **禁止在 Service/Controller 中写 `process.env`** — 必须通过 `NodeConfigService`
3. **禁止手动拼接 Redis key** — 必须通过 `buildCacheKey` / `buildCacheKeyWithTemplates`
4. **禁止在多 Service 中复制粘贴 HTTP 调用/签名/分页/重试/字段映射逻辑** — 提取到 helper/adapter
5. **禁止为假想复用提前抽象** — 至少两个模块真实复用后才进 `src/common/`
6. **禁止引入第二套同职责技术方案** — 如已有 redis 客户端不再引入 ioredis 直连
7. **禁止 Redis key 不含租户占位符** — 多租户场景的 key 必须含 `{tenant}`
8. **禁止缓存不设 TTL** — 除非有明确的不失效设计理由并加注释
9. **禁止 Controller 中写业务逻辑** — Controller 只做路由和参数透传
10. **禁止在非 DTO 文件中声明多个 `class` 或在类文件内声明类型** — 非 DTO 类一文件一个，类型必须拆到独立类型文件

---

## 验证

- 普通 API 变更：优先运行相关 Jest 测试；必要时运行 `pnpm test` 或 `pnpm build:dev`
- Prisma schema 变更：运行 `pnpm pg`；需要迁移时按环境执行迁移命令
- Redis、租户、飞书、鉴权变更：按 `../../docs/ai-governance/testing-and-verification.md` 的专项检查执行
- 只改文档时不需要跑业务测试，但要做路径和引用静态校验

---

## 文档索引

### API 架构文档 (`docs/architecture/`)
| 文档 | 说明 | 何时读 |
|------|------|--------|
| `README.md` | 架构文档入口与阅读顺序 | 首次接触项目 |
| `project-architecture.md` | 整体架构、启动链路、中间件链、请求生命周期 | 理解系统全貌 |
| `directory-structure.md` | src 整体目录结构说明 | 新增模块/文件 |
| `auth-and-tenant.md` | 鉴权、Guard、租户上下文、Redis key 隔离 | 鉴权/多租户变更 |
| `feishu-integration.md` | 保留的告警客户端和表格鉴权边界 | 飞书相关变更 |

### API 开发规范 (`docs/standard/`)
| 文档 | 说明 | 何时读 |
|------|------|--------|
| `README.md` | 规范文档入口与任务映射 | 首次接触项目 |
| `code-style.md` | TypeScript/NestJS 分层、异常、日志、命名 | 几乎所有编码任务 |
| `module-design.md` | 模块/子模块目录设计、table/adapter/helper 放置规则 | 新增模块/外部集成 |
| `configuration.md` | 环境变量、NodeConfigService、租户配置 | 配置/环境变量变更 |
| `redis.md` | Redis key 规范、缓存、限流、幂等 | Redis 相关变更 |

### AI 治理文档 (`../../docs/ai-governance/`)
| 文档 | 说明 | 何时读 |
|------|------|--------|
| `README.md` | AI 治理总纲：任务分级、OpenSpec 判断 | 重大项目启动 |
| `development-workflow.md` | 7 步开发流程 | 复杂多步骤任务 |
| `testing-and-verification.md` | 各类型变更验证矩阵 | 提交前验证 |
