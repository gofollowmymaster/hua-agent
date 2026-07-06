# Monorepo 开发规范

`docs/standard/` 是项目开发规范说明书，回答“在这个 pnpm workspace 中，各子项目代码应该怎么写、文件应该怎么放、变更应该遵守哪些工程规则”。项目事实放在 `docs/architecture/`，AI 工作流、OpenSpec 判断、验证和交付要求放在 `docs/ai-governance/`。

## 阅读路由

| 任务范围 | 必读规范 |
| --- | --- |
| workspace 根脚本、依赖放置、跨包引用 | `docs/standard/workspace.md` |
| API 后端接口、Service、DTO、Prisma、Redis、BullMQ、飞书、多租户 | `docs/standard/api/README.md` |
| RAG Admin 前端页面、组件、路由、store、API client、样式 | `docs/standard/rag-admin/README.md` |
| shared 包类型、导出和依赖边界 | `docs/standard/shared/README.md` |
| 前后端契约或 shared 变更 | `docs/standard/workspace.md`，再读受影响子项目规范 |
| 纯文档治理或文档结构调整 | `docs/ai-governance/testing-and-verification.md` |

## 规范优先级

当规范、文档和代码出现不一致时，按以下顺序处理：

1. 以当前代码真实实现为事实来源。
2. 以 `AGENTS.md` 中的高频硬规则和命令约束为执行底线。
3. 以对应子项目的 `docs/standard/<scope>/` 规范指导实现方式。
4. 以 `docs/architecture/<scope>/` 中的项目上下文解释为什么这么做。

发现冲突时，不要静默选择一边；应在当前变更中同步修正文档，或在交付说明中明确差异与原因。

## 维护规则

- 新增 workspace 根脚本、依赖管理、跨包引用规则时，放到 `docs/standard/workspace.md`。
- 新增 API 后端代码风格、模块分层、配置维护、Redis key、缓存、定时任务或队列处理规则时，放到 `docs/standard/api/`。
- 新增 RAG Admin 前端组件、路由、状态、请求、样式或构建规范时，放到 `docs/standard/rag-admin/`。
- 新增 shared 包类型导出、依赖边界或发布契约规则时，放到 `docs/standard/shared/`。
- 不要把项目事实写进本目录；事实应沉淀到 `docs/architecture/`。
- 不要把完整规范复制到 `AGENTS.md`；`AGENTS.md` 只保留短入口和高频命令。
