# Proposal

## Why

当前仓库同时承载多个已不再属于目标产品的后台、回调和外部集成，增加了部署面、数据面和维护成本。产品需要收敛为知识问答与业务Agent两项核心能力，并彻底移除无关入口与持久化模型。

## What Changes

- **BREAKING**：删除 Global Admin 前后端及其构建、静态发布和鉴权入口。
- **BREAKING**：删除 Manage、Robot、Admin、Doc、Alert、Devops、FdCopilot、DemoPlugin 等 API 业务域。
- **BREAKING**：删除 Aily、日志操作、企微 RAG Bot 等非后台接入渠道。
- 保留 RAG Admin 的知识问答和业务Agent全部现有子页面与 API 契约。
- 删除无关定时任务基础设施、Prisma 模型和数据库表，并同步精简依赖、配置、脚本与文档。

## Capabilities

### New Capabilities

- `product-module-boundary`：定义产品仅提供知识问答和业务Agent，以及被删除入口和数据模型的边界。

### Modified Capabilities

无。

## Impact

影响 workspace 脚本、`apps/api` 根模块与业务域、`apps/global-admin`、Prisma schema/迁移、依赖和架构文档。已下线 URL 不提供兼容层，将返回 404；删除迁移会永久移除相关历史数据。

## Non-goals

- 不改变知识问答和业务Agent现有 HTTP/AGUI 契约。
- 不实现业务Agent三个骨架页面的新业务能力。
- 不重构保留模块的内部算法或 UI。
