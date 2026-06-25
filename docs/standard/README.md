# 项目开发规范

`docs/standard/` 用于承载项目开发规范类文档，回答“开发时必须怎么做”。架构背景、模块现状和系统理解放在 `docs/ai-agent/`。

## 阅读顺序

1. 先读根目录 `AGENTS.md`，确认技术栈、命令、环境加载、代码风格和 OpenSpec 入口。
2. 再读本目录中与任务相关的规范：
   - `development-workflow.md`：需求到实现的工作流。
   - `code-style.md`：TypeScript/NestJS 代码风格和分层写法。
   - `module-design.md`：新增模块、子功能、adapter、table、schedule 的放置规范。
   - `testing-and-verification.md`：不同类型变更的验证要求。
3. 需要理解项目现状和模块职责时，再补读 `docs/ai-agent/` 对应专题。

## 与其他文档的分工

- `AGENTS.md`：快速规则和常用命令，保持短而稳定。
- `docs/standard/`：开发规范，规定后续实现必须遵守的做法。
- `docs/ai-agent/`：架构知识，解释项目结构、模块职责、飞书集成、权限与多租户背景。

当文档与代码不一致时，先以代码真实实现为准，并在当前变更中同步修正文档或说明差异。

## 维护规则

- 新增长期开发约束时，优先放到本目录。
- 不要把完整规范复制到 `AGENTS.md`，只在 `AGENTS.md` 添加入口或短规则。
- 不要把架构现状文档写进本目录；架构现状应沉淀到 `docs/ai-agent/`。
- 规范变更本身也需要做静态校验：路径真实、链接可达、措辞与当前代码一致。
