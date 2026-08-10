# Global Admin 构建与运行

本文记录 `apps/global-admin` 的 Vite 构建、开发代理和运行时访问事实；前端构建的通用约定（`VITE_` 前缀、敏感配置、输出到 `apps/api/public/<app>`）见 `docs/standard/frontend/architecture/README.md`。

## Vite 配置

`apps/global-admin/vite.config.ts` 当前配置：

- Vue 插件：`@vitejs/plugin-vue`。
- Less 预处理：`@namespace` 取 `VITE_AUTH_PLATFORM`（默认 `global-admin`）；`@primary-color`、`@text-primary-color` 等主题变量由 `src/config/theme-color-token.ts` 统一生成，两者都通过 Vite `modifyVars` 注入。
- 路径别名：`@` 指向 `apps/global-admin/src`。
- `base`：`/public/global-admin/`。
- 构建输出：`../api/public/global-admin`（`emptyOutDir: true`）。
- dev server 端口：`5175`。
- proxy：`/global-admin` 转发到 `VITE_API_PROXY_TARGET`，默认 `http://localhost:3000`。

## 环境变量

前端环境变量位于 `apps/global-admin/`，常见文件：

- `.env`
- `.env.development`
- `.env.test`
- `.env.production`
- `.env.local`（模板见 `.env.local.template`）

关键变量：

- `VITE_AUTH_ENV`：认证环境（development / test / uat / prod）。
- `VITE_AUTH_API_URL`：认证 SDK API 地址，必须由部署环境显式配置。
- `VITE_AUTH_PLATFORM`：SDK platform，默认 `global-admin`；token 持久化固定使用 `localStorage['authToken']`。
- `VITE_AUTH_APP_CODE`：appCode，默认 `GLOBAL`。
- `VITE_API_BASE_URL`：业务 API base URL，默认同源空串。
- `VITE_API_PROXY_TARGET`：开发代理目标。

## 运行方式

- 开发：`pnpm global-admin:dev`（或 app 内 `pnpm dev`）。
- 构建：`pnpm global-admin:build`（vue-tsc 类型检查 + vite build）。
- 预览：`pnpm global-admin:preview`。
- 测试：`pnpm global-admin:test`（Vitest）。

生产访问依赖 API app 提供 `apps/api/public/global-admin` 下的静态文件。
