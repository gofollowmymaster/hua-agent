# 项目架构说明

`docs/architecture/` 用于承载项目架构说明，回答“项目现在是什么结构、模块如何组成、关键基础设施如何工作”。

本目录只记录项目事实和上下文，不承载开发规范。新增代码应该怎么写、文件应该怎么放、如何验证，请阅读 `docs/standard/README.md`。AI 如何读取上下文、判断风险和交付，请阅读 `docs/ai-governance/README.md`。

## 阅读顺序

1. `project-architecture.md`：理解启动链路、根模块、请求生命周期、全局服务、配置、日志、异常与响应。
2. `directory-structure.md`：理解顶层目录、`src` 顶层结构、`common`、`config`、`type` 等目录的现状。
3. `business-modules.md`：理解当前业务模块职责和现有定时/后台处理分布。
4. `feishu-integration.md`：理解当前飞书集成分层、客户端、helper、表格、卡片、事件入口和配置来源。
5. `auth-and-tenant.md`：理解当前鉴权、多租户上下文、Guard、租户配置、Redis 租户 key 和飞书表格租户模型。

## 与其他目录的分工

- `docs/architecture/`：项目架构说明和上下文事实。
- `docs/standard/`：开发规范、代码分层、集成、安全租户、测试验证和交付格式。
- `docs/ai-governance/`：AI 工作原则、任务分级、OpenSpec 判断、风险边界和上下文读取策略。

当架构文档与代码不一致时，以代码真实实现为准，并在当前变更中同步修正文档或说明差异。
