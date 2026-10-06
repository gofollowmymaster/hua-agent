# AGENTS.md

## Scope

本文件适用于 `apps/react-admin/**`。同时遵守根 `AGENTS.md`、`docs/ai-governance/README.md` 和 `docs/standard/design/README.md`。

## Stack

- Umi Max 4 + React 18 + TypeScript
- Ant Design 5 + `@ant-design/pro-components`
- Vitest + React Testing Library；关键流程使用 Playwright

## Boundaries

- 页面请求必须经过 `src/api/`，统一复用 `@aplus-sql/http-client`。
- 不导入 Vue 专属 `@aplus-sql/ui-kit` 或 `apps/rag-admin/src`。
- 登录、租户、token、路由和 API 行为以现有 `rag-admin` 实现为兼容基线。
- 列表优先使用 ProTable，表单使用 ProForm，布局使用 ProLayout。
- 页面详情使用 `drawer`、`drawerCode` query 驱动的全局 Drawer。
- 单个 TS/TSX 文件不超过 400 行；新增或实质修改类及类方法时添加简洁 JSDoc。

## Commands

```bash
pnpm dev
pnpm build
pnpm test
pnpm e2e
pnpm lint:check
pnpm format:check
```
