## Context

RAG Admin 与 Global Admin 已通过 `@aplus-sql/http-client` 统一处理业务 `code===401` 和 HTTP 401，并由各 app 的 `src/api/*/http.ts` 把 `onUnauthorized` 接到 user store `logout()`。当前缺口是：路由守卫只依赖 SDK 的跳转副作用、不检查 `ensureLogin()` 返回值；RAG 聊天流式请求绕过 axios 直接使用 AI SDK `DefaultChatTransport`；并发 401 可能触发多次 `redirectLogin`。

## Goals / Non-Goals

**Goals:**
- 无 token 时由路由守卫显式清理登录态并跳转认证中心。
- axios 常规接口和 RAG 聊天流式接口的 HTTP 401 都统一跳转。
- 同一页面生命周期内最多触发一次认证中心跳转。

**Non-Goals:**
- 不新增应用内登录页。
- 不监听页面停留期间 token 被外部清除。
- 不修改 `packages/http-client` 公共 API 和后端接口。

## Decisions

1. **幂等跳转收敛到 auth.ts**：两个 app 各自在 `stores/modules/user/auth.ts` 增加模块级 `redirecting` 标志和 `redirectToLogin()`，`ensureLogin()` 无 token 与 `logout()` 都调用它，保留 SDK 现有的 `redirectUrl`、`locale`、`supplierCode`、`appCode` 参数。替代方案是在 `http.ts` 单独加锁，但无法覆盖聊天流和路由守卫，因此放在 auth 层。
2. **路由守卫显式拦截**：RAG 新增 `src/router/route-auth.ts` 的 `prepareRagAdminRoute()`，Global 改造 `prepareGlobalAdminRoute()` 返回 `Promise<boolean>`；`ensureLogin()` 返回空值时调用 `logout()` 并返回 false。RAG 认证异常仍返回 false，Global 认证异常仍返回 true 以展示现有错误提示。
3. **聊天流 401 走自定义 fetch**：两个 RAG chat adapter 给 `DefaultChatTransport` 传入自定义 `fetch`，在 `response.status === 401` 时调用 `userStore.logout()`。该逻辑抽到 `apps/rag-admin/src/api/common/unauthorized-fetch.ts`，供两个 adapter 复用并便于单测。HTTP 401 是最小覆盖；流式 body 中的业务错误码不属于本次范围。

## Risks / Trade-offs

- `redirectToLogin()` 一旦置位，本次页面生命周期内后续 `logout()` 不再重复跳转；若首次跳转因环境异常失败，不会自动重试。当前认证中心跳转由 `window.location.replace` 完成，失败概率低，且可接受“仅跳一次”的语义。
- 自定义 fetch 只处理 HTTP 401；若聊天后端改用 HTTP 200 + 业务 code 401，需要后续扩展读取流式 body。
- 路由守卫返回 false 会阻止后台壳渲染，符合未登录不应看到业务页面的一致性要求。

## Migration Plan

- 本次仅前端行为调整，无数据库、接口契约或部署配置变化，可直接随前端发布。
- 回滚时恢复两个 app 的 `router`、`auth.ts` 和 RAG chat adapter 即可，`packages/http-client` 无需回滚。

## Open Questions

- 无。已确认登录页为现有认证中心，触发时机为路由守卫和接口 401。
