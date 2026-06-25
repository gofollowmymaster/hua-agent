# AI Agent 长期开发文档

这组文档用于沉淀项目架构、模块边界和长期上下文，供后续 AI agent 与开发者理解项目现状。它不是 `AGENTS.md` 的替代品，也不承载完整开发规范。

## 阅读顺序

1. 先读根目录的 `AGENTS.md`：获取技术栈、常用命令、环境加载、路径别名、OpenSpec 工作流等高频规则。
2. 再读 `docs/standard/README.md`：确认开发流程、代码风格、模块设计和验证规范。
3. 需要理解项目架构和模块现状时，按任务类型阅读本目录专题：
   - `project-architecture.md`：理解启动链路、全局模块、请求生命周期、配置、日志、异常与响应处理。
   - `directory-structure.md`：理解顶层目录、`src` 目录和公共目录边界。
   - `business-modules.md`：理解现有业务模块职责，以及新增模块/功能时的推荐结构。
   - `feishu-integration.md`：理解飞书集成的 clients、helpers、table、card、type 分层。
   - `auth-and-tenant.md`：理解鉴权、多租户上下文、租户配置和跨租户开发注意事项。

## 与 AGENTS.md 的分工

- `AGENTS.md`：短、快、稳定。承载必须遵守的命令、环境、代码风格和基础架构摘要。
- `docs/standard/`：开发规范。承载开发流程、代码风格、模块设计和测试验证要求。
- `docs/ai-agent/`：架构知识。承载项目架构、模块现状、飞书集成、权限/租户等专题背景。

当两处信息发生冲突时，优先以代码实现为准；其次以 `AGENTS.md` 的硬性命令/约束为准；本目录文档用于解释上下文和指导开发方式。

## AI Agent 开发前检查

- 明确当前任务是否需要 OpenSpec change；涉及新增接口、行为变更、数据库变更时，优先按 OpenSpec 流程推进。
- 先搜索现有模块、Service、DTO、table adapter、helper，复用已有模式。
- 不要把业务逻辑放进 Controller；不要在业务 Service 中散写外部系统底层调用。
- 涉及租户、飞书表格、Redis key、鉴权时，必须阅读 `auth-and-tenant.md` 与 `feishu-integration.md`。
- 本项目命令需要按 `AGENTS.md` 的环境加载规则执行，具体验证要求见 `docs/standard/testing-and-verification.md`。
