# Proposal

## Why

现有知识问答和业务 Agent 后端仅由 NestJS 提供。团队需要增加可独立部署的 FastAPI 实现，并让两套后端长期共享 PostgreSQL、Redis 和飞书配置，同时不要求现有前端、SDK 或系统调用方修改协议。

## What Changes

- 在 `apps/python-api` 增加 Python 3.12、FastAPI 和 uv 项目。
- 复刻现有 36 个 API 的路由、鉴权、校验、响应、流式协议和数据副作用。
- 同步 Business Agent 系统 Skill、用户 Skill 管理接口和运行时动态装载能力。
- 迁移 RAG、业务 Agent、文档处理、飞书多维表格鉴权和告警能力。
- 保持 Prisma 为数据库 schema 和迁移的唯一权威，两套后端共享现有表和 Redis key。
- 增加独立 Docker 镜像、根命令、健康检查和双栈差异契约测试。

## Capabilities

### New Capabilities

- `fastapi-api-parity`：定义 Python 后端与 NestJS 后端的外部行为兼容、共享状态和独立部署能力。

### Modified Capabilities

- `business-agent-skills`：将系统 Skill、用户 Skill 管理和运行时装载扩展到 FastAPI。

## Impact

影响 workspace 根命令、部署入口、后端运行文档，并新增一个共享现有 PostgreSQL、Redis、模型服务和飞书应用的后端 app。现有 NestJS 路由和部署保持不变。

## Non-goals

- 不替换或下线 NestJS。
- 不修改现有数据库 schema 或迁移权威。
- 不要求前端和 SDK 适配新的响应或流协议。
- 不对同一请求同时发送到两个后端。
