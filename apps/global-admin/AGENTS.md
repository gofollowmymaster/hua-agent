# AGENTS.md

## 适用范围

本文件适用于 `apps/global-admin/**`。该 app 是不区分租户的总管理员前端，不得复用 RAG Admin 的 tenant hostname、supplierCode 或 TenantContext 语义。

## 技术栈与命令

- Vue 3、Vite、TypeScript、Vue Router hash mode、Pinia、aplus-ui。
- 公共 UI/hooks 从 `@aplus-sql/ui-kit` 导入，请求基础设施从 `@aplus-sql/http-client` 导入。
- 常用命令：`pnpm global-admin:dev`、`pnpm global-admin:test`、`pnpm global-admin:build`、`pnpm global-admin:lint:check`、`pnpm global-admin:stylelint:check`。

## 必读文档

1. `standard/architecture/README.md`
2. `standard/development/README.md`
3. `../../docs/standard/frontend/architecture/README.md`
4. `../../docs/standard/frontend/README.md`（共享规范索引）
5. `../../docs/standard/design/README.md`

页面开发规范（`standard/development/*.md`）为 `docs/standard/frontend/development/` 共享规范的软连接；`standard/architecture/custom/table-pattern.md` 是本 app 自有版本。涉及 API、鉴权、middleware 或静态发布时，同时读取根 `AGENTS.md`、API 鉴权文档和 AI 验证治理。

## 边界规则

- Global Admin API 使用 `GlobalAdminGuard`，前端不得携带或伪造 `supplierCode`、`supplier`、`ignore-supplier-check`。
- 业务 API 统一放在 `src/api/`；页面不得直接创建 axios 实例。
- token、登录 SDK 和用户状态统一放在 `src/stores/modules/user/`。
- 详情使用全局 LayoutDrawer 和 URL query，不新建页面私有 Drawer。
- 只展示 API 返回的脱敏字段，不推导或展示租户敏感配置。
- aplus-ui 组件使用前先通过 CLI 查询公开 API；禁止内部深路径 import。
