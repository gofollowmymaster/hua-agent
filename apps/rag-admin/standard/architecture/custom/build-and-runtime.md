# RAG Admin 构建与运行

本文记录 `apps/rag-admin` 的 Vite 构建、开发代理和运行时访问事实；前端构建的通用约定（`VITE_` 前缀、敏感配置、输出到 `apps/api/public/<app>`）见 `docs/standard/frontend/architecture/README.md`。

## Vite 配置

`apps/rag-admin/vite.config.ts` 当前配置：

- Vue 插件：`@vitejs/plugin-vue`。
- Less 预处理：`@namespace` 取 `VITE_AUTH_PLATFORM`（默认 `rag-admin`）；`@primary-color`、`@text-primary-color` 等主题变量由 `src/config/theme-color-token.ts` 统一生成，两者都通过 Vite `modifyVars` 注入。
- 路径别名：`@` 指向 `apps/rag-admin/src`。
- `base`：`/public/rag-admin/`。
- 构建输出：`../api/public/rag-admin`。
- dev server 端口：`5174`。
- proxy：`/api` 转发到 `VITE_API_PROXY_TARGET` 并去掉 `/api` 前缀，默认 `http://localhost:3000`。

## 环境变量

前端环境变量位于 `apps/rag-admin/`，常见文件：

- `.env`
- `.env.development`
- `.env.local`
- `.env.test`
- `.env.production`

## 运行方式

- 开发：`pnpm admin:dev`。
- 构建：`pnpm admin:build`。
- 预览：`pnpm admin:preview`。

生产访问依赖 API app 提供 `apps/api/public/rag-admin` 下的静态文件。
