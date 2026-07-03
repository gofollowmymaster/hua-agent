# 项目开发规范

`docs/standard/` 是项目开发规范说明书，回答“开发者和 AI 实现代码时必须怎么做”。本目录沉淀开发流程、代码风格、模块设计、集成设计、测试验证和交付格式；AI 行为治理和风险控制放在 `docs/ai-governance/`，项目架构事实放在 `docs/architecture/`。

本目录不是项目事实索引。架构背景、模块现状、飞书集成、权限与多租户等上下文，应到 `docs/architecture/` 的专题文档中读取。

## 阅读顺序

1. 先读根目录 `AGENTS.md`，确认技术栈、命令、环境加载、代码风格和 OpenSpec 入口。
2. AI 任务先读 `docs/ai-governance/README.md`，确认任务分级、风险边界和上下文读取路径。
3. 涉及代码实现、模块设计或验证交付时，再读本目录中与任务相关的规范：
   - `development-workflow.md`：需求到实现的工作流。
   - `code-style.md`：TypeScript/NestJS 代码风格和分层写法。
   - `module-design.md`：新增模块、子功能、adapter、table、schedule 的放置规范。
   - `integration-design.md`：飞书和外部系统集成规范。
   - `testing-and-verification.md`：不同类型变更的验证要求。
4. 需要理解项目现状和模块职责时，再补读 `docs/architecture/` 对应专题。

## 任务类型到必读文档

| 任务类型 | 必读规范 | 补充上下文 |
| --- | --- | --- |
| 新增或修改接口、业务行为 | `development-workflow.md`、`module-design.md`、`testing-and-verification.md` | `docs/architecture/business-modules.md`、`docs/architecture/auth-and-tenant.md` |
| 新增模块、Service、DTO、adapter、table、schedule | `module-design.md`、`code-style.md` | `docs/architecture/directory-structure.md`、`docs/architecture/business-modules.md` |
| 修改代码风格、分层、异常、日志、配置读取 | `code-style.md`、`module-design.md` | `docs/architecture/project-architecture.md`、`docs/architecture/auth-and-tenant.md` |
| 修改测试、构建、验证策略或交付说明 | `testing-and-verification.md`、`development-workflow.md` | `docs/ai-governance/README.md` |
| 涉及飞书或外部系统集成 | `integration-design.md`、`module-design.md`、`testing-and-verification.md` | `docs/architecture/feishu-integration.md` |
| 涉及 Prisma schema、Redis、租户、鉴权 | `development-workflow.md`、`testing-and-verification.md` | `docs/architecture/auth-and-tenant.md` |
| 纯文档治理或文档结构调整 | `testing-and-verification.md` | `docs/ai-governance/README.md` |

## 规范优先级

当规范、文档和代码出现不一致时，按以下顺序处理：

1. 以当前代码真实实现为事实来源。
2. 以 `AGENTS.md` 中的高频硬规则和命令约束为执行底线。
3. 以 `docs/standard/` 中的专题规范指导实现方式。
4. 以 `docs/architecture/` 中的项目上下文解释为什么这么做。

发现冲突时，不要静默选择一边；应在当前变更中同步修正文档，或在交付说明中明确差异与原因。

## 与其他文档的分工

- `AGENTS.md`：快速规则和常用命令，保持短而稳定。
- `docs/standard/`：开发规范，规定后续实现必须遵守的做法。
- `docs/ai-governance/`：AI 治理方案，规定 AI 如何读取上下文、判断风险、选择流程、验证交付。
- `docs/architecture/`：项目架构说明，承载项目结构、模块职责、集成现状和基础设施事实。

## 维护规则

- 新增长期开发约束、代码分层规则、验证规则或交付格式时，优先放到本目录。
- 新增 AI 行为规则、风险分级、上下文读取策略、OpenSpec 判断规则时，放到 `docs/ai-governance/`。
- 新增架构现状、模块职责、集成现状或基础设施事实时，放到 `docs/architecture/`。
- 不要把架构现状文档写进本目录；项目事实上下文应沉淀到 `docs/architecture/`。
- 不要把完整规范复制到 `AGENTS.md`，只在 `AGENTS.md` 添加入口或短规则。
- 规范变更本身也需要做静态校验：路径真实、链接可达、措辞与当前代码一致。
