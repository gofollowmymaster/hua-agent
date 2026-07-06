# Monorepo 架构说明

`docs/architecture/` 只记录项目当前架构事实，回答“这个 workspace 现在由哪些子项目组成、边界在哪里、关键基础设施如何工作”。开发规范放在 `docs/standard/`，AI 工作流和验证治理放在 `docs/ai-governance/`。

## Workspace 组成

- `apps/api/`：NestJS API 应用，承载后端接口、Prisma、Redis、BullMQ、飞书集成、多租户和静态资源服务。
- `apps/rag-admin/`：Vue/Vite RAG 管理后台，承载页面、路由、登录集成、API client 和前端构建。
- `packages/shared/`：共享类型和无副作用工具的 workspace 包预留，当前不承载业务运行逻辑。
- 根目录：pnpm workspace、兼容脚本、OpenSpec、部署入口和长期文档。

## 阅读路由

| 任务范围 | 必读架构文档 |
| --- | --- |
| workspace、根脚本、构建边界、跨包关系 | `docs/architecture/workspace.md` |
| API 后端、Prisma、Redis、BullMQ、飞书、多租户 | `docs/architecture/api/README.md` |
| RAG Admin 前端、路由、登录、API client、Vite 构建 | `docs/architecture/rag-admin/README.md` |
| shared 包、跨端类型、共享工具边界 | `docs/architecture/shared/README.md` |
| 前后端契约、静态资源发布、登录链路 | `docs/architecture/workspace.md`，再读 API 与 RAG Admin 对应专题 |

## 子目录职责

- `api/`：只记录 `apps/api` 的项目事实和基础设施，不写前端规范。
- `rag-admin/`：只记录 `apps/rag-admin` 的项目事实和运行链路，不写后端实现规范。
- `shared/`：只记录 `packages/shared` 的边界和当前状态。
- `workspace.md`：记录 monorepo 层事实，如 workspace 包、根脚本转发、构建产物关系和部署边界。

当架构文档与代码不一致时，以代码真实实现为准，并在当前变更中同步修正文档或说明差异。
