# API 项目架构

本文说明 `apps/api` 的运行链路和全局基础设施。技术栈、常用命令、环境文件加载顺序、路径别名等快速规则见根目录 `AGENTS.md`，本文不重复展开。

## 项目定位

`apps/api` 是基于 NestJS + TypeScript 的后端服务，核心能力围绕飞书生态、告警处理、文档检查、DevOps 通知、管理配置和 AI 助手接口展开。

API app 采用模块化 NestJS 结构：

- `apps/api/src/main.ts` 是应用入口，负责创建 Nest 应用、注册全局 Filter/Interceptor/Pipe、配置 CORS、请求体大小和 dev 环境 Swagger。
- `apps/api/src/app.module.ts` 是根模块，负责装配全局服务、配置模块、静态资源、JWT、定时任务、守卫模块、异常模块和各业务模块。
- `apps/api/src/common` 承载跨模块基础设施、飞书集成、守卫、异常、中间件、拦截器、基础类和公共表格 adapter。

## 启动链路

应用启动流程：

1. `NestFactory.create(AppModule)` 创建应用。
2. `setGlobalAppInstance(app)` 保存全局 app 实例，供少数工具方法使用。
3. 注册 CORS，允许常见 HTTP 方法、任意 header 和 credentials。
4. 注册全局异常过滤器：
   - `AllExceptionsFilter`
   - `AplusExceptionsFilter`
   - `HttpExceptionFilter`
   - `UniqueConstraintExceptionFilter`
5. 注册全局响应与日志拦截器：
   - `TransformInterceptor`
   - `LoggingInterceptor`
6. 注册 `ValidationPipe`，启用 `transform`，并在生产环境关闭详细错误信息。
7. 使用 `body-parser` 将 JSON 和 urlencoded 请求体限制提升到 `50mb`。
8. `NODE_ENV=dev` 时启用 Swagger：`/swagger` 和 `/swagger/json`。
9. 监听端口 `3000`，并支持 webpack HMR dispose。

## 根模块装配

`AppModule` 的核心 imports：

- `GlobalServiceModule`：全局服务模块，导出 Redis、Logger、Prisma、TenantContext 等。
- `ConfigModule.forRoot({ isGlobal: true, load: [() => configuration] })`：加载 `apps/api/src/config/index.ts` 组装后的配置。
- `ServeStaticModule`：将 `mockServer` 作为静态资源目录。
- `DevtoolsModule`：注册 Nest devtools，端口 `3001`。
- `JwtModule.register({ global: true })`：使用 `configuration.jwtSecret` 初始化全局 JWT。
- `ScheduleModule.forRoot()`：启用定时任务。
- `GlobalExceptionHandlerModule`、`GuardModule`：注册全局异常处理能力和可复用守卫。
- 业务模块：`ManageModule`、`RobotModule`、`AiModule`、`AdminModule`、`DocModule`、`DemoPluginModule`、`AlertModule`、`FdCopilotModule`、`DevopsModule`。

`AppModule.configure` 对所有路由应用中间件，顺序是：

1. `LoggerMiddleware`：记录请求开始、headers、body 和响应耗时。
2. `TenantMiddleware`：解析用户与租户上下文，位于依赖租户上下文的逻辑之前。
3. `DiscardMiddleware`：阻断废弃的 `mock-server` 功能访问。

## 请求生命周期

典型 HTTP 请求流：

1. 请求进入 Express/Nest。
2. 全局中间件记录日志、解析租户、拦截废弃路径。
3. Controller 路由匹配。
4. 路由上的 Guard 执行鉴权。
5. DTO 经 `ValidationPipe` 转换与校验。
6. Controller 调用 Service。
7. Service 编排业务逻辑，调用 Prisma、Redis、飞书 helper/table adapter 或其他模块服务。
8. Interceptor 统一记录与转换响应。
9. Exception Filter 捕获异常并统一输出，同时部分异常会发送飞书通知。

## 全局服务

`GlobalServiceModule` 标记为 `@Global()`，导出：

- `PrismaService`：继承 `PrismaClient`，在 `onModuleInit` 中连接 MySQL。
- `RedisProvider` / `RedisService`：提供 ioredis 客户端、租户化 key 构造、限流、幂等、pattern 查询和删除。
- `LoggerService`：封装 Winston 日志能力。
- `TenantContext`：基于 `AsyncLocalStorage` 保存当前请求的租户、用户和 request。
- `WikiFixedTokenService`：文档相关固定 token 能力。

全局服务的注入和模块注册规范见 `apps/api/docs/standard/module-design.md`。

## 后台任务基础设施

项目通过 `ScheduleModule.forRoot()` 启用定时任务能力，通过业务模块中的 `BullModule.forRoot(...)` 和 `BullModule.registerQueue(...)` 使用 BullMQ 队列。

后台任务基础类位于 `apps/api/src/common/base`：

- `BaseSchedule`：定时任务基类，负责 cron 注册、租户上下文遍历和定时任务异常告警。
- `BaseProcessor`：队列处理基类，负责 BullMQ job 处理入口、租户上下文建立、worker 事件日志和队列任务异常告警。

定时任务与队列处理的开发规范见 `apps/api/docs/standard/background-jobs.md`。

## 配置模型

配置入口是 `apps/api/src/config/index.ts`：

- 全局配置来自环境变量、`apps/api/src/config/db.ts`、固定配置和租户配置。
- 租户配置来自 `apps/api/src/config/tenant/index.ts`，当前租户码包括 `aplus`、`boat`、`yurex`。
- `NodeConfigService` 提供静态读取方法：
  - `get` / `getOrThrow` 读取全局配置。
  - `getRobotConfig` 同时兼容全局机器人配置和租户机器人配置。
  - `getFeishuTableConfig` 同时兼容全局表格配置和租户表格配置。
  - `getTenantConfigItem` / `getTenantConfigItemAll` 读取租户级配置。

配置新增、读取、类型维护和敏感信息处理规范见 `apps/api/docs/standard/configuration.md`。

## 日志、异常与响应

- 请求日志由 `LoggerMiddleware` 和 `LoggingInterceptor` 共同承担。
- 响应结构由 `TransformInterceptor` 统一处理。
- 业务异常类型位于 `apps/api/src/common/exception`。
- 不需要飞书上报的异常可使用 `NotReportException`。
- Prisma 唯一约束等数据库异常由专门 Filter 转换。

异常与错误处理的开发规范见 `apps/api/docs/standard/code-style.md`。
