# API 目录架构

`apps/api` 只承载知识问答、业务Agent和它们所需的公共基础设施。

## 顶层目录

- `src/`：NestJS 源码。
- `prisma/rag/`：RAG 与 Agent 的 PostgreSQL schema、基线 SQL 和迁移。
- `prisma/`：MySQL 历史迁移链与 datasource-only schema。
- `scripts/`：RAG 数据库初始化和业务Agent知识入库脚本。
- `public/rag-admin/`：RAG Admin 生产构建产物。
- `public/react-admin/`：React Ant Design Pro 管理后台生产构建产物。

## src 结构

- `main.ts`：应用启动、全局 Pipe/Filter/Interceptor 和 Swagger。
- `app.module.ts`：根模块与 `LoggerMiddleware`、`TenantMiddleware` 装配。
- `auth/`：本地用户、密码校验、JWT 登录与系统管理员用户管理接口。
- `ai/`：知识问答聊天、RAG Admin 管理接口、文档入库和检索工作流。
- `agent/`：业务Agent知识库与多工具 Chat。
- `common/`：仍被两个业务域复用的守卫、租户上下文、Redis、RAG Prisma、日志、异常、拦截器和最小飞书能力。
- `config/`：全局配置、租户配置与 `NodeConfigService`。
- `type/`：全局用户和请求上下文类型。

## common 边界

- `const/`：共享常量和 Redis key。
- `decorator/`：响应转换等横切装饰器。
- `exception/`、`filter/`：统一异常与 HTTP 错误转换。
- `guard/`：`AuthGuard`、`SecretAuthGuard`、`CompositeAuthOrSecretGuard`。
- `middleware/`、`interceptor/`：请求上下文、日志和响应转换。
- `service/`：Redis、RAG Prisma、Logger、TenantContext 及全局模块。
- `feishu/`、`table/`：异常告警和固定密钥表格鉴权所需的最小飞书封装。

公共目录只接收真实跨模块复用能力。业务专属 Controller、Service、DTO 和工作流应留在 `ai/` 或 `agent/`。
