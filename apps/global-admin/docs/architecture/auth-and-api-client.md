# Global Admin 鉴权与 API Client

## 登录

- SDK platform：`global-admin`。
- appCode：`GLOBAL`。
- 登录参数只包含 locale 和 appCode，不包含 supplierCode。
- `VITE_AUTH_ENV` 决定 `global.*` 登录地址；`VITE_AUTH_API_URL` 必须由部署环境独立配置，禁止回退租户 API。
- token cookie 使用 `global-admin-auth-access-token`，与 RAG Admin 隔离。

## 后端授权

`GlobalAdminGuard` 先复用 AuthGuard 的 JWT 验签和过期校验，再校验配置的 appCode。Global Admin API 和静态路径排除 TenantMiddleware，请求不会创建默认租户上下文。

前端不得发送 `supplier`、`supplierCode` 或 `ignore-supplier-check` 来影响范围。后续跨租户能力必须使用显式参数和专用 Service，不能调用依赖 TenantContext 的租户 Service。

## 请求封装

`src/api/http.ts` 通过 `createHttpClient` 注入动态 token 和 401 logout。业务方法位于 `src/api/global-admin.ts`，页面只调用业务方法。403 在页面展示无权限状态，401 清理 token 并重新进入登录流程。
