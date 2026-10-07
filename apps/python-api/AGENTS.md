# AGENTS.md

## 适用范围

本规则适用于 `apps/python-api/**`。该应用是基于 Python 3.12 和 FastAPI 实现的
`apps/api` 对等服务；两个服务均可独立部署，并共享由 Prisma 管理的 PostgreSQL
schema 和 `frontend-node:*` Redis key。

## 常用命令

在仓库根目录运行：

```bash
pnpm python-api:sync
pnpm python-api:dev
pnpm python-api:start
pnpm python-api:test
pnpm python-api:lint
pnpm python-api:typecheck
pnpm python-api:build
pnpm digital-avatar:import:dev
pnpm digital-avatar:import:test
pnpm digital-avatar:import:prod
```

## 边界约束

- `apps/api` 中的 Prisma schema 和 SQL migration 是数据库结构的唯一权威来源，不得引入 Alembic。
- 保持路由、鉴权、租户、响应、错误、文件和 AI SDK 流式协议兼容。
- 除非数据表被明确标记为全局表，否则每次数据库读写都必须包含当前租户条件。
- Redis key、TTL、JSON 编码和幂等状态必须与 NestJS 保持兼容。
- 生成 UI Message SSE 事件前，必须先规范化 LangChain、LangGraph 和 Deep Agents 事件。
- 不得记录凭据、请求体、知识库内容、原始工具参数或完整工具结果。
- 飞书集成测试默认使用 mock；实时冒烟测试必须显式设置 `FEISHU_SMOKE_TEST_ENABLED=true`。
- 运行时只加载本 app 的 `.env`、`.env.{env}`、`.env.{env}.local`，不得读取 `apps/api/.env*`。
- 核心 PostgreSQL、Redis、JWT 配置必须启动即校验；模型、rerank 和飞书凭据只在功能调用时校验。

## 文档入口

- 架构说明：`apps/python-api/docs/architecture/README.md`
- 开发与验证规范：`apps/python-api/docs/standard/README.md`
- 跨应用治理：`docs/ai-governance/README.md`
