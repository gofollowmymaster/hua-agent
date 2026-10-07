# API 项目架构

`apps/api` 是知识问答和业务Agent的 NestJS 后端。`src/main.ts` 创建应用并注册全局 Filter、Interceptor、ValidationPipe、CORS、Swagger 与请求体限制；`src/app.module.ts` 负责根模块和中间件装配。

## 根模块

`AppModule` 只装配以下能力：

- `AiModule`：`/ai/rag/chat` 与 `/ai/rag/admin/*`。
- `AgentModule`：`/agent/knowledge/*`、`/agent/chat/*` 与 `/agent/skills/*`。
- `AuthModule`：本地 `/auth/login` 与系统管理员用户管理接口。
- `GlobalServiceModule`：Redis、日志、RAG Prisma 和 `TenantContext`。
- `ConfigModule`、全局 `JwtModule`、`GuardModule`、`GlobalExceptionHandlerModule`。
- `ServeStaticModule`：通过 `/public` 静态根路径发布 Vue RAG Admin 与 React Admin 构建产物。
- `DevtoolsModule`：保留现有 Nest devtools 配置。

`LoggerMiddleware` 和 `TenantMiddleware` 按顺序应用到全部路由。项目没有无租户业务例外，也不注册定时任务、队列或其他历史业务模块。

## 请求生命周期

请求依次经过日志和租户中间件、Controller 路由、Guard、DTO 校验、Service 编排、响应拦截器与异常过滤器。保留业务通过 `RagPrismaService` 访问 PostgreSQL/pgvector，通过 `RedisService` 使用租户化缓存，通过 `TenantContext` 读取当前租户与用户。

## 数据与配置

- `prisma/rag/schema.prisma` 是运行时数据模型，包含本地 RAG Admin 用户、知识问答文档/分块/会话/消息、业务Agent对应模型和用户私有 Skill。
- 业务Agent入库将去除 UTF-8 BOM 后的原始 Markdown 全文保存到 `agent_documents.content`，清洗后的正文只用于 `agent_chunks` 切片和向量化；管理列表与详情不加载全文，`get_document` 工具通过租户隔离的专用查询读取全文。
- 系统 Skill 由代码清单发布并强制装载；用户 Skill 按租户和登录用户隔离，NestJS Agent 每次运行时动态组合启用指令。
- `prisma/schema.prisma` 仅保留 MySQL datasource，用于维护历史迁移链；运行时不生成或注入 MySQL Prisma client。
- `src/config/index.ts` 聚合环境变量和 `aplus`、`boat`、`yurex` 三套租户配置。
- `NodeConfigService` 是业务代码读取全局和租户配置的统一入口。

修改 schema 后运行 `pnpm pg` 生成 RAG client；迁移文件只表达数据库变更，执行迁移前必须确认目标环境和备份策略。

NestJS 与 FastAPI 共用该 RAG schema。部署任一后端前，由 API workspace 使用目标环境对应的 `pnpm rag:db:init:dev|test|prod` 显式应用幂等基线 SQL，再使用 `pnpm rag:db:check:dev|test|prod` 校验必需表、字段及索引。应用启动和请求处理期间不执行 DDL；Python API 不维护独立迁移历史。

## 静态发布

Vue RAG Admin 生产构建输出到 `apps/api/public/rag-admin`，React Admin 输出到 `apps/api/public/react-admin`，均由 API 的 `/public` 静态根路径发布。两套后台并行存在且互不覆盖。
