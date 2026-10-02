# RAG Admin 登录、API Client 与接口契约

本文记录 `apps/rag-admin` 的本地登录和 API 调用事实；通用请求封装规则见 `docs/standard/frontend/architecture/README.md`。

## 登录与 token

RAG Admin 不再使用外部登录 SDK。`/login` 页面通过 `src/api/auth/auth.ts` 调用 API app 的 `POST /auth/login`，并由 `src/stores/modules/user/` 的 user store 统一保存 token。

- `tenant-auth.config.ts` 根据当前页面 hostname 解析 A、C、D 服务商码；未知域名回退 D。
- 登录请求携带 `supplier` header，使 API 开发代理也能建立正确的租户上下文。
- 成功响应为 `{ token }`；store 将 token 和从 JWT payload 解析的用户信息持久化在 `localStorage['authToken']`。
- API 调用继续使用 `Authorization: Bearer <token>`；HTTP 401 清理本地登录态并进入 `/login`。
- 登录成功后回到 query 中的受保护目标路由；不存在有效目标时进入 `/knowledge/documents`。登出只清理本地 token 并进入登录页。

后端 JWT 保持已有 `loginTime`、用户和租户 claims，`AuthGuard` 与 `TenantMiddleware` 无需针对 RAG Admin 改造。用户、密码哈希、状态和系统管理员标记存储在 RAG PostgreSQL 的 `rag_admin_users` 表中。

## 请求封装与 API 路径

通用 axios、业务 envelope 和 401 处理能力位于 `@aplus-sql/http-client`。`src/api/common/http.ts` 负责创建 RAG Admin 实例并注入 base URL、user store token 和 logout；聊天流式 adapter 通过 `src/api/common/unauthorized-fetch.ts` 的自定义 fetch 处理 HTTP 401。

本地认证接口：

- `POST /auth/login`：公开接口，接收用户名和密码，返回 token。
- `POST /auth/users/page`、`POST /auth/users`、`POST /auth/users/:id`、`POST /auth/users/:id/password`：仅系统管理员可访问，所有数据限定为当前租户。

RAG Admin 开发/测试环境通过 `VITE_API_BASE_URL=/api` 统一携带 `/api` 前缀，开发态由 Vite proxy 将 `/api` 请求转发到 API 后端并去掉前缀；生产态保持同源调用。

## 错误与空状态

- 登录失败统一显示用户名或密码错误，不暴露用户存在性或启用状态。
- 业务 API 方法保留后端错误的可排查信息，页面负责展示用户可理解的错误、加载和空状态。
