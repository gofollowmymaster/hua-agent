# API 目录架构

本文说明 `apps/api` 下 `src` 整体目录结构与职责边界，不重复承载模块设计规则。模块、子模块目录设计和文件放置规则见 `apps/api/docs/standard/module-design.md`。monorepo 根目录、RAG Admin 和 shared 包结构见 `AGENTS.md`。

## API app 顶层目录

- `apps/api/src/`：NestJS API 应用源码，包含模块、公共基础设施、配置和类型。
- `apps/api/prisma/`：API 应用 Prisma schema 和迁移元信息。Schema 相关命令见根目录 `AGENTS.md`。
- `apps/api/.env*`：API 应用环境变量文件，根目录兼容命令会转发并读取这些文件。
- `apps/api/mockServer/`：静态 mock 资源目录，通过 `ServeStaticModule` 暴露；当前 `mock-server` API 已被中间件标记为废弃。
- `apps/api/public/`：API app 静态资源目录，包含 RAG Admin 生产构建产物。
- `apps/api/dist/`、`coverage/`、`logs/`：构建、覆盖率、日志等生成物。

## API app src 顶层结构

- `apps/api/src/main.ts`：应用入口。
- `apps/api/src/app.module.ts`：根模块和全局中间件装配。
- `apps/api/src/config/`：全局配置、数据库配置、租户配置和 `NodeConfigService`。
- `apps/api/src/common/`：跨业务模块复用的基础设施、飞书集成、守卫、异常、中间件、拦截器、基础类和公共表格 adapter。
- `apps/api/src/type/`：全局类型定义，例如用户上下文。

## 业务模块职责

- `apps/api/src/manage/`：管理类业务。
- `apps/api/src/robot/`：飞书机器人消息与表格操作入口。
- `apps/api/src/ai/`：AI、Aily、日志操作相关能力。
- `apps/api/src/agent/`：业务 Agent 独立业务域入口，承载知识库与多工具 Chat。
- `apps/api/src/admin/`：管理后台相关能力，如缓存和管理表格。
- `apps/api/src/doc/`：文档、知识库、文档检查相关能力。
- `apps/api/src/alert/`：告警、Sentry webhook、飞书事件回调、告警统计与清理。
- `apps/api/src/fd-copilot/`：前端 Copilot 文档同步与处理。
- `apps/api/src/devops/`：DevOps、云效发布通知和定时处理。
- `apps/api/src/demo-plugin/`：插件演示与 MID 相关能力。
- `apps/api/src/global-admin/`：无租户总控台聚合模块；专用鉴权和租户管理等业务能力必须按子模块收拢在此目录。
- `apps/api/src/mock-server/`：历史 mock server 能力，当前访问会被 `DiscardMiddleware` 阻断。

业务模块下的子模块目录布局、Controller 放置和通用模块结构见 `apps/api/docs/standard/module-design.md`。

## 定时任务与后台处理

项目已在 `AppModule` 中启用 `ScheduleModule.forRoot()`。现有定时/后台处理分布在：

- `apps/api/src/alert/common/schedule`
- `apps/api/src/devops/ali/common/schedule`
- `apps/api/src/doc/common/schedule`
- `apps/api/src/doc/common/processor`
- `apps/api/src/fd-copilot/common/processor`

## common 目录现状

`apps/api/src/common` 承载跨模块复用、基础设施或明确横切关注点的代码。

推荐边界：

- `base/`：基础抽象类，如基础 Service、Schedule、Processor、消息发送、告警上下文。
- `const/`：跨模块常量和枚举，例如 Redis key。
- `exception/`：统一异常类型。
- `feishu/`：飞书客户端、helper、卡片、表格、类型和工具。
- `filter/`：全局/专项异常过滤器。
- `guard/`：可复用鉴权守卫。
- `interceptor/`：响应转换、日志等拦截器。
- `middleware/`：请求日志、租户上下文、废弃功能拦截等中间件。
- `service/`：全局服务，如 Redis、Prisma、Logger、TenantContext。
- `table/`：跨业务复用的飞书表格 adapter。
- `utils/`：无状态、无明确业务归属的小工具。

## config 目录现状

- `apps/api/src/config/index.ts` 聚合全局配置。
- `apps/api/src/config/db.ts` 承载数据库/Redis 等基础配置。
- `apps/api/src/config/tenant/` 承载租户差异配置。
- `apps/api/src/config/node-config.service.ts` 是配置读取入口。

## type 目录现状

`apps/api/src/type` 用于少量全局类型。局部 DTO、飞书响应类型、业务领域类型通常位于对应模块或 `apps/api/src/common/feishu/type` 中。
