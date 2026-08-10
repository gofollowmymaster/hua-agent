# API 架构说明

`apps/api/docs/architecture/` 记录 `apps/api` 的后端架构事实。这里不承载 RAG Admin 前端规范，也不承载代码实现规则；实现规则见 `apps/api/docs/standard/README.md`。

本文档目录中的 `src/` 默认指 `apps/api/src/`，`prisma/` 默认指 `apps/api/prisma/`。

## 阅读顺序

1. `project-architecture.md`：理解启动链路、根模块、请求生命周期、全局服务、配置、日志、异常与响应。
2. `directory-structure.md`：理解 API app 目录、`src` 顶层结构、`common`、`config`、`type` 等目录现状。
3. `auth-and-tenant.md`：理解鉴权、多租户上下文、Guard、租户配置、Redis 租户 key 和飞书表格租户模型。
4. `global-admin.md`：理解无租户总控台的聚合模块、业务子模块和依赖边界。
5. `feishu-integration.md`：理解飞书集成分层、客户端、helper、表格、卡片、事件入口和配置来源。

## 适用任务

- 新增或修改 API 接口、Controller、Service、DTO。
- 修改 Prisma、Redis、BullMQ、定时任务、队列或后台处理。
- 修改飞书、鉴权、多租户、固定 token、租户配置等后端能力。
- 调整 API app 构建、Swagger、静态资源服务或后端环境变量。

涉及前端调用方时，同时阅读 `apps/rag-admin/standard/architecture/README.md` 和 `AGENTS.md`。
