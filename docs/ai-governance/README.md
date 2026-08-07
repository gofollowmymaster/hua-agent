# AI 治理方案

`docs/ai-governance/` 是本 monorepo 的 AI 治理说明书，回答“AI 助手如何选择上下文、判断风险、选择流程、验证交付”。它不承载各子项目完整架构或实现规范；架构事实放在各子项目的 `docs/architecture/`，实现规范放在各子项目的 `docs/standard/`。

## AI 工作原则

- 先判断任务范围，再读取对应子项目文档；不要把 API 后端规范当作全项目默认规范。
- 先理解现状，再提出或执行方案；不要在未搜索现有实现前新增平行结构。
- 优先复用已有 app、package、Service、DTO、API client、store、helper、adapter 和异常类型。
- 涉及行为变化、接口契约、数据库、跨包公共能力、构建/部署边界或重要外部集成时，先判断是否需要 OpenSpec change。
- 涉及租户、鉴权、Redis key、飞书、前端登录 token、静态资源发布或 shared 导出时，按高风险或跨端任务处理。
- 文档和代码冲突时，先以代码真实实现为准，并同步修正文档或在交付说明中说明差异。

## 任务范围分类

| 范围 | 场景 | 必读入口 |
| --- | --- | --- |
| `workspace` | 根脚本、pnpm workspace、依赖放置、部署/构建边界 | `AGENTS.md`、`docs/ai-governance/README.md` |
| `api` | NestJS 后端、Prisma、Redis、BullMQ、飞书、多租户 | `apps/api/docs/architecture/README.md`、`apps/api/docs/standard/README.md` |
| `rag-admin` | Vue/Vite 前端、页面、路由、store、API client、样式 | `apps/rag-admin/docs/architecture/README.md`、`apps/rag-admin/docs/standard/README.md`、`docs/standard/design/README.md` |
| `shared` | 共享类型、无副作用工具、跨包导出 | `packages/shared/docs/architecture/README.md`、`packages/shared/docs/standard/README.md` |
| `frontend-packages` | Vue 公共组件/hooks、HTTP client、前端公共导出 | 对应 package 的 `docs/architecture/README.md`、`docs/standard/README.md`、受影响前端文档 |
| `cross-app` | 前后端接口契约、登录链路、静态资源发布、shared 消费 | `workspace` 入口 + 受影响子项目入口 |
| `docs-only` | 文档治理、架构说明、规范说明 | `docs/ai-governance/testing-and-verification.md` |

## 阅读顺序

1. 先读根目录 `AGENTS.md`：获取技术栈、常用命令、环境加载、路径别名和最短读取路径。
2. 再读本文：确认任务范围、风险分级、OpenSpec 判断和上下文读取策略。
3. 按任务范围读取对应子项目的 `docs/architecture/README.md` 与 `docs/standard/README.md`。
4. 前端、UI、交互或产品设计相关任务，再读 `docs/standard/design/README.md`。
5. 需要从需求推进到实现和交付时，读 `development-workflow.md`。
6. 需要确认验证要求时，读 `testing-and-verification.md`。

## 任务分级

| 等级 | 场景 | AI 处理要求 |
| --- | --- | --- |
| L1 低风险 | 注释、纯文档、小范围无行为变化修正 | 可直接修改；验证路径、链接和引用准确性。 |
| L2 常规 | 单 app 局部 bugfix、单页面调整、单模块内部逻辑、小范围配置读取 | 先搜索现有实现；遵守对应子项目规范；运行相关验证或说明原因。 |
| L3 高风险 | 新增接口、行为语义变化、跨 app 契约、shared 导出、跨模块公共能力、外部系统集成 | 优先判断 OpenSpec；读取 workspace 和受影响子项目专题；补充测试或构建验证。 |
| L4 关键风险 | Prisma schema、迁移、鉴权、多租户、Redis 隔离、飞书回调/表格写入、登录 token 链路、生产静态资源路径 | 必须读取相关 API/RAG Admin/workspace 专题和验证规范；明确风险与回滚关注点。 |

## OpenSpec 判断

以下情况优先走 OpenSpec change：

- 新增业务接口或修改已有接口行为、鉴权、响应结构、错误语义。
- 修改数据库 schema、迁移或持久化模型。
- 调整跨模块、跨 app 或 shared 公共能力。
- 修改前后端接口契约、登录 token 链路、静态资源发布路径或部署构建边界。
- 引入新的外部系统集成或重要配置。

只改注释、文档、小范围 bugfix，且不改变既有行为时，可以不新增 OpenSpec，但交付说明中应说清楚验证方式。

## 高风险补读入口

- API 鉴权、租户、Redis key、飞书表格或飞书回调：读 `apps/api/docs/architecture/auth-and-tenant.md`、`apps/api/docs/architecture/feishu-integration.md` 和 `testing-and-verification.md`。
- RAG Admin 登录、API client、路由、构建输出：读 `apps/rag-admin/docs/architecture/auth-and-api-client.md`、`apps/rag-admin/docs/architecture/build-and-runtime.md`、`apps/rag-admin/docs/standard/README.md` 和 `docs/standard/design/README.md`。
- shared 导出或跨端类型：读 `packages/shared/docs/architecture/package-boundary.md`、`packages/shared/docs/standard/package-design.md`。
- 前端 UI/hooks 或 HTTP client 公共导出：读对应 package 的架构与规范入口、RAG Admin 前端规范和所有消费 app。
- 根脚本、依赖、部署/构建边界：读 `AGENTS.md` 和受影响子项目入口。

## 与其他文档的分工

- `AGENTS.md`：短、快、稳定。承载必须遵守的命令、环境、代码风格和文档入口。
- `apps/*/docs/architecture/`、`packages/*` 文档：子项目和共享包架构事实。
- `apps/*/docs/standard/`、`packages/shared/docs/standard/`：子项目开发规范。
- `docs/standard/design/`：整体产品设计规范。
- `docs/ai-governance/`：AI 工作原则、任务分级、风险边界、OpenSpec 判断、上下文读取策略、验证和交付。
