# AI 治理方案

`docs/ai-governance/` 是本项目的 AI 治理说明书，回答“AI 助手如何读项目、判断风险、选择流程、验证交付”。它不是 `AGENTS.md` 的替代品，也不承载完整开发规范或项目架构说明；代码实现规范放在 `docs/standard/`，项目架构说明放在 `docs/architecture/`。

本目录只沉淀 AI 工作方式、风险控制和读取策略。AI 执行任务前需要理解的项目上下文，包括架构、目录边界、业务模块、飞书集成、权限与多租户，应到 `docs/architecture/` 阅读。

## AI 工作原则

- 先理解现状，再提出或执行方案；不要在未搜索现有实现前新增平行结构。
- 优先复用项目已有模块、Service、DTO、helper、table、adapter 和异常类型。
- 涉及行为变化、接口、数据库、跨模块公共能力或重要外部集成时，先判断是否需要 OpenSpec change。
- 涉及租户、鉴权、Redis key、飞书表格、飞书回调、外部系统写入时，按高风险任务处理。
- 文档和代码冲突时，先以代码真实实现为准，并同步修正文档或在交付说明中说明差异。

## 阅读顺序

1. 先读根目录 `AGENTS.md`：获取技术栈、常用命令、环境加载、路径别名、OpenSpec 工作流等高频硬规则。
2. 再读本文：确认 AI 任务分级、上下文读取路径、风险边界和交付要求。
3. 涉及代码实现、模块设计或测试验证时，读 `docs/standard/README.md` 及其专题规范。
4. 需要理解项目架构和模块现状时，读 `docs/architecture/README.md` 及其专题说明。

## 任务分级

| 等级 | 场景 | AI 处理要求 |
| --- | --- | --- |
| L1 低风险 | 注释、纯文档、小范围无行为变化修正 | 可直接修改；验证路径、链接和引用准确性。 |
| L2 常规 | 局部 bugfix、单模块内部逻辑、小范围配置读取 | 先搜索现有实现；遵守 `docs/standard/`；运行相关验证或说明原因。 |
| L3 高风险 | 新增接口、行为语义变化、跨模块公共能力、外部系统集成 | 优先判断 OpenSpec；阅读 `docs/architecture/` 相关专题；补充测试或构建验证。 |
| L4 关键风险 | Prisma schema、迁移、鉴权、多租户、Redis 隔离、飞书回调/表格写入 | 必须读取 `docs/architecture/auth-and-tenant.md`、相关飞书/架构专题和验证规范；明确风险与回滚关注点。 |

## OpenSpec 判断

以下情况优先走 OpenSpec change：

- 新增业务接口。
- 修改已有接口行为、鉴权、响应结构或错误语义。
- 修改数据库 schema、迁移或持久化模型。
- 调整跨模块公共能力。
- 引入新的外部系统集成或重要配置。

只改注释、文档、小范围 bugfix，且不改变既有行为时，可以不新增 OpenSpec，但交付说明中应写明验证方式。

## 探索优先规则

执行前必须先用 `rg`、`find`、`sed` 等方式确认现有实现：

- 找到相关 controller、service、DTO、table adapter、helper、配置和测试。
- 找到同模块已有风格，优先沿用。
- 找到公共能力边界，避免把业务逻辑塞进 `src/common`。
- 找到租户、飞书、Redis、鉴权相关路径后，再决定是否需要读取对应专题。

不要用猜测替代搜索；不要为了当前需求做大范围顺手重构。

## 验证与交付

- 文档变更：检查目录结构、旧路径残留、链接可达和职责边界。
- 普通代码变更：优先运行相关测试；没有相关测试时至少运行构建或说明未运行原因。
- 数据库、Redis、租户、飞书变更：补充隔离、配置读取、幂等、异常路径和来源校验检查。
- 交付说明必须包含修改内容、关键文件、已运行验证、未运行验证原因和残留风险。

具体验证口径以 `docs/standard/testing-and-verification.md` 为准。

## 与其他文档的分工

- `AGENTS.md`：短、快、稳定。承载必须遵守的命令、环境、代码风格和基础架构摘要。
- `docs/standard/`：开发规范。承载开发流程、代码风格、模块设计、测试验证和交付格式。
- `docs/ai-governance/`：AI 治理方案。承载 AI 工作原则、任务分级、风险边界和上下文读取策略。
- `docs/architecture/`：项目架构说明。承载项目结构、模块职责、集成现状和基础设施事实。

当多处信息发生冲突时，优先以代码实现为准；其次以 `AGENTS.md` 的硬性命令/约束为准；再以 `docs/standard/` 的实现规范、`docs/architecture/` 的事实说明和本目录治理说明为准。

## AI 开发前检查

- 明确当前任务是否需要 OpenSpec change；涉及新增接口、行为变更、数据库变更时，优先按 OpenSpec 流程推进。
- 先搜索现有模块、Service、DTO、table adapter、helper，复用已有模式。
- 不要把业务逻辑放进 Controller；不要在业务 Service 中散写外部系统底层调用。
- 涉及租户、飞书表格、Redis key、鉴权时，必须阅读 `docs/architecture/auth-and-tenant.md`、`docs/architecture/feishu-integration.md` 与 `docs/standard/integration-design.md`。
- 本项目命令需要按 `AGENTS.md` 的环境加载规则执行，具体验证要求见 `docs/standard/testing-and-verification.md`。
