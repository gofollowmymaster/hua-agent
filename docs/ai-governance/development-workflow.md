# 开发工作流治理

本文规定 AI 助手从需求理解到交付说明的标准流程。具体代码风格、模块设计和验证口径见 `docs/standard/README.md`。

## 1. 判断是否需要 OpenSpec

以下情况优先走 OpenSpec change：

- 新增业务接口。
- 修改已有接口行为、鉴权、响应结构或错误语义。
- 修改数据库 schema、迁移或持久化模型。
- 调整跨模块公共能力。
- 引入新的外部系统集成或重要配置。

只改注释、文档、小范围 bugfix，且不改变既有行为时，可以不新增 OpenSpec，但交付说明中应说清楚验证方式。

## 2. 开发前先探索

实现前必须先搜索和阅读相关现有代码：

- 先用 `rg`、`find`、`sed` 等方式查找 controller、service、DTO、table adapter、helper、配置和测试。
- 优先复用同模块既有结构。
- 优先复用 `src/common` 中已有基础设施。
- 不确定模块边界时，先读 `docs/architecture/directory-structure.md`。

不要在未理解现有实现的情况下直接新增平行方案。

## 3. 命令执行规则

所有项目命令必须遵循 `AGENTS.md` 的环境加载规则：

- 开发环境命令使用 `pnpm env:dev -- ...`。
- 测试环境命令使用 `pnpm env:test -- ...`。
- 生产环境命令使用 `pnpm env:prod -- ...`。

不要绕过环境加载直接执行依赖环境变量的命令。格式化和 lint 命令会修改文件，执行前应确认这是当前任务的一部分。

## 4. 实现规则

- 不修改与任务无关的文件。
- 不回退用户或其他 agent 已经做出的改动。
- 不为了当前需求做大范围顺手重构。
- Controller 只做协议层处理。
- Service 负责业务编排。
- 数据库、Redis、飞书、外部系统访问必须通过已有 Service、helper、table、adapter 分层。
- 新增配置优先通过 `NodeConfigService` 读取，不在业务代码中散写配置读取逻辑。
- 涉及租户时必须使用 `TenantContext` 或显式传入租户，不要隐式使用默认租户掩盖问题。
- 飞书集成分层与约定见 `docs/architecture/feishu-integration.md`。
- 鉴权、租户和 Redis key 模型见 `docs/architecture/auth-and-tenant.md`。

## 5. 验证规则

实现完成后必须按变更类型验证：

- 文档变更：检查路径、链接、引用代码路径是否真实。
- 普通代码变更：优先运行相关测试；没有相关测试时至少运行 TypeScript 构建或说明未运行原因。
- DTO/接口变更：检查 Swagger 装饰器、DTO 校验和 Guard。
- Prisma schema 变更：运行 `pnpm pg`，并按环境选择迁移命令。
- Redis/租户/飞书变更：补充租户隔离、配置读取和异常路径验证。

验证命令和未能执行的原因都应在交付说明中说明。

## 6. 交付说明

最终交付应包含：

- 修改了什么。
- 关键文件路径。
- 执行了哪些验证。
- 未执行测试或构建的原因。
- 是否存在残留风险或后续建议。

如果执行了 git stage、commit、push 或 PR，需要按 Codex 应用要求输出对应指令。
