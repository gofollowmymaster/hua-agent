# 开发工作流治理

本文规定 AI 助手在 monorepo 中从需求理解到交付说明的标准流程。各子项目代码风格和模块设计见对应子项目的 `docs/standard/`，验证口径见 `testing-and-verification.md`。

## 1. 判断任务范围

实现前先把任务归入一个或多个范围：

- `workspace`：根脚本、pnpm workspace、依赖、部署、构建边界。
- `api`：`apps/api` 后端能力。
- `rag-admin`：`apps/rag-admin` 前端能力。
- `shared`：`packages/shared` 共享包。
- `cross-app`：前后端接口契约、登录链路、静态资源发布、shared 消费。
- `docs-only`：只修改文档。

分类后按 `docs/ai-governance/README.md` 的矩阵读取对应架构和规范。

## 2. 判断是否需要 OpenSpec

以下情况优先走 OpenSpec change：

- 新增业务接口。
- 修改已有接口行为、鉴权、响应结构或错误语义。
- 修改数据库 schema、迁移或持久化模型。
- 调整跨模块、跨 app 或 shared 公共能力。
- 修改 RAG Admin 与 API 的接口契约、登录 token 链路、静态资源发布路径或构建输出目录。
- 引入新的外部系统集成或重要配置。

只改注释、文档、小范围 bugfix，且不改变既有行为时，可以不新增 OpenSpec，但交付说明中应说清楚验证方式。

## 3. 开发前先探索

实现前必须先搜索和阅读相关现有代码：

- workspace 任务：检查根 `package.json`、`pnpm-workspace.yaml`、受影响 app 的 `package.json` 和相关部署配置。
- API 任务：查找 controller、service、DTO、table adapter、helper、配置、测试和相关规范。
- RAG Admin 任务：查找 router、view、layout、store、API client、auth、样式和 Vite 配置。
- shared 任务：查找 `packages/shared` 导出和所有 workspace 消费者。
- cross-app 任务：同时查后端 DTO/Controller/Service 和前端 API client/页面调用方。

优先复用对应子项目既有结构。不确定边界时，先读对应子项目的 `docs/architecture/README.md`。

## 4. 命令执行规则

所有项目命令必须遵循 `AGENTS.md` 的环境加载规则：

- API 后端优先使用根目录已有兼容脚本，例如 `pnpm build:dev`、`pnpm start:dev`、`pnpm migrate:dev`。直接在 `apps/api` 内执行依赖环境变量的底层命令时，才使用 API app 的 `pnpm env:dev -- ...`、`pnpm env:test -- ...` 或 `pnpm env:prod -- ...`。
- RAG Admin 前端命令使用 `pnpm rag-admin:*` 或 `pnpm --filter @aplus-sql/rag-admin ...`，不要套 API 的 dotenv 加载器。
- shared 命令按实际 package 脚本执行；当前没有脚本时不要虚构。

格式化和 lint 命令会修改文件，执行前应确认这是当前任务的一部分。

## 5. 实现规则

- 不修改与任务无关的文件。
- 不回退用户或其他 agent 已经做出的改动。
- 不为了当前需求做大范围顺手重构。
- 代码实现遵守对应子项目规范：`apps/api/docs/standard/`、`apps/rag-admin/docs/standard/`、`packages/shared/docs/standard/` 或 `AGENTS.md`。
- 需要项目事实或集成现状时，补读对应子项目的 `docs/architecture/` 专题。
- 跨 app 变更必须同时维护契约两端，不能只改前端或只改后端。

### 类与类方法注释

- AI 新增或实质修改类、类方法时，必须在声明前使用简洁 JSDoc 说明职责。实质修改包括职责、签名、行为或副作用变化；纯格式化、导入整理等机械修改不触发补注释要求。
- 注释要求覆盖 `public`、`protected`、`private` 和 `static` 类方法。普通函数、箭头函数、匿名回调和 Vue 组件内函数不强制添加。
- 注释应说明职责、关键业务语义或副作用，不要复述类名、方法名或 TypeScript 已表达的类型。参数与返回值仅在类型不足以表达语义时补充。
- 修改已有类或类方法时，同步补充缺失的注释，或更新与实现不一致的注释。
- 构造器无需机械添加独立注释；存在非显然的初始化行为时再说明。
- 生成代码、第三方代码和声明文件不适用本要求。

## 6. 验证规则

实现完成后必须按变更类型验证，具体验证矩阵见 `testing-and-verification.md`。验证命令和未能执行的原因都应在交付说明中说明。

## 7. 交付说明

最终交付应包含：

- 修改了什么。
- 关键文件路径。
- 执行了哪些验证。
- 未执行测试或构建的原因。
- 是否存在残留风险或后续建议。

如果执行了 git stage、commit、push 或 PR，需要按 Codex 应用要求输出对应指令。
