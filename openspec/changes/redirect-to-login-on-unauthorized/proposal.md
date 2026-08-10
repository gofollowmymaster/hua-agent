## Why

RAG Admin 和 Global Admin 在启动无 token 或接口返回 401 时，应统一回到认证中心登录；当前路由守卫依赖 SDK 副作用，聊天流式请求也未处理 401，存在漏跳转和重复跳转风险。

## What Changes

- 两个管理后台的路由守卫显式拦截无 token 场景，调用 `logout()` 并阻止进入后台壳。
- 两个 app 的 `auth.ts` 增加幂等 `redirectToLogin()`，无 token 和 `logout()` 共用，避免并发 401 重复跳转。
- RAG Admin 聊天流式 adapter 的 HTTP 401 也清理 token 并跳转认证中心。
- 不新增应用内登录页，不改后端接口和 `packages/http-client` 公共 API。

## Capabilities

### New Capabilities

- `admin-unauthorized-redirect`: 定义 RAG Admin 与 Global Admin 在无 token、业务 401 和 HTTP 401 时统一清理登录态并跳转认证中心。

### Modified Capabilities

无。

## Non-goals

- 不新增本地登录页或登录表单。
- 不实时监听页面停留期间 token 被外部清除。
- 不修改后端 Guard、接口响应结构或共享 HTTP client 公共接口。

## Impact

- 影响 `apps/rag-admin` 和 `apps/global-admin` 的 router、user auth 与 API 请求层。
- 影响 RAG Admin 聊天流式 adapter。
- 需要补充路由守卫、auth 和聊天请求 401 相关单测。
