# 开发工作流治理

本文规定 AI 助手从需求理解到交付说明的标准流程。具体代码风格和模块设计见 `docs/standard/README.md`，验证口径见 `testing-and-verification.md`。

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
- 代码实现遵守 `docs/standard/README.md` 及相关专题规范。
- 需要项目事实或集成现状时，补读 `docs/architecture/README.md` 及对应专题。

## 5. 验证规则

实现完成后必须按变更类型验证，具体验证矩阵见 `testing-and-verification.md`。验证命令和未能执行的原因都应在交付说明中说明。

## 6. 交付说明

最终交付应包含：

- 修改了什么。
- 关键文件路径。
- 执行了哪些验证。
- 未执行测试或构建的原因。
- 是否存在残留风险或后续建议。

如果执行了 git stage、commit、push 或 PR，需要按 Codex 应用要求输出对应指令。
