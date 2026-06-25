# 目录架构

本文说明项目目录职责和边界，帮助 AI agent 判断新代码应该放在哪里。

## 顶层目录

- `src/`：应用源码，包含 NestJS 模块、公共基础设施、配置和类型。
- `prisma/`：Prisma schema 和迁移元信息。schema 变更后必须按 `AGENTS.md` 运行 `pnpm pg`。
- `openspec/`：OpenSpec 项目说明、变更提案、归档记录和规范目录。涉及行为变化时先走这里。
- `mockServer/`：静态 mock 资源目录，通过 `ServeStaticModule` 暴露；当前 `mock-server` API 已被中间件标记为废弃。
- `docs/`：项目文档。本目录下 `ai-agent/` 专门沉淀 AI agent 长期开发知识。
- `dist/`、`coverage/`、`logs/`：构建、覆盖率、日志等生成物，不应作为源码设计依据。

## src 顶层结构

- `src/main.ts`：应用入口。
- `src/app.module.ts`：根模块和全局中间件装配。
- `src/config/`：全局配置、数据库配置、租户配置和 `NodeConfigService`。
- `src/common/`：跨业务模块复用的基础设施、飞书集成、守卫、异常、中间件、拦截器、基础类和公共表格 adapter。
- `src/type/`：全局类型定义，例如用户上下文。
- `src/manage/`：管理类业务。
- `src/robot/`：飞书机器人消息与表格操作入口。
- `src/ai/`：AI、Aily、日志操作相关能力。
- `src/admin/`：管理后台相关能力，如缓存和管理表格。
- `src/doc/`：文档、知识库、文档检查相关能力。
- `src/alert/`：告警、Sentry webhook、飞书事件回调、告警统计与清理。
- `src/fd-copilot/`：前端 Copilot 文档同步与处理。
- `src/devops/`：DevOps、云效发布通知和定时处理。
- `src/demo-plugin/`：插件演示与 MID 相关能力。
- `src/mock-server/`：历史 mock server 能力，当前访问会被 `DiscardMiddleware` 阻断。

## common 目录边界

`src/common` 不是业务逻辑垃圾桶。只有满足跨模块复用、基础设施或明确横切关注点的代码才应放入。

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
- `utils/`：确实无状态、无业务归属的小工具。新增前应先判断是否属于 helper、service、adapter 或具体业务模块。

## config 目录边界

- `src/config/index.ts` 聚合全局配置。
- `src/config/db.ts` 承载数据库/Redis 等基础配置。
- `src/config/tenant/` 承载租户差异配置。
- `src/config/node-config.service.ts` 是配置读取入口，业务代码优先使用它而不是直接读取深层配置对象。

新增配置判断规则：

- 所有租户都共用一个值：放全局配置。
- 不同租户可能不同：放 `tenant/` 对应租户配置，并通过 `NodeConfigService` 读取。
- 敏感值：优先来自环境变量，不要新增硬编码 secret。

## type 目录边界

`src/type` 用于少量全局类型。局部 DTO、飞书响应类型、业务领域类型应放在对应模块或 `src/common/feishu/type` 中。

新增类型默认放置规则：

- 请求/响应参数：模块内 `dto/`。
- 飞书 OpenAPI 数据结构：`src/common/feishu/type/`。
- 业务模块内部类型：模块内 `type/`。
- 跨模块共享且稳定的类型：再考虑 `src/type/` 或 `src/common` 下明确子目录。

## 新文件放置决策

- 新 HTTP 接口：优先在对应业务模块下新增 controller/service/dto。
- 新飞书 API 封装：优先在 `src/common/feishu/helper` 或 `src/common/feishu/type` 扩展。
- 新飞书表格访问：优先新增或复用 table adapter，不要在 Service 里直接拼表格请求。
- 新租户配置：放 `src/config/tenant`，并通过 `NodeConfigService` 获取。
- 新缓存 key：先扩展 `RedisKeys`，再通过 `RedisService.buildCacheKey*` 构造。
- 新定时任务：放业务模块的 `common/schedule` 或已有 schedule 目录，复用基础 schedule 抽象。
