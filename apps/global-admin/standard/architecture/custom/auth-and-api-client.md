# Global Admin 鉴权与 API Client

本文记录 `apps/global-admin` 的特有鉴权与请求事实；通用请求封装规则（`createHttpClient`、业务 API 文件、页面调用边界、契约变更检查）见 `docs/standard/frontend/architecture/README.md`。

## 登录与 token

登录相关代码与 user store 一起位于 `src/stores/modules/user/`：

- `index.ts`：用户登录状态、用户信息和登录生命周期编排。
- `auth.ts`：登录 SDK 初始化和登录流程相关逻辑。
- `auth.spec.ts`：登录相关单测。

前端通过登录 SDK 获取 token，并在请求后端 API 时使用 `Authorization: Bearer <token>`。Global Admin 与 RAG Admin 共用 `pinia-plugin-persistedstate`，将 user store 的 `token` / `userInfo` 持久化到 `localStorage['authToken']`。旧 `global-admin-auth-access-token` cookie 仅在 `authToken` 不存在时迁移一次，迁移后清理。

### 登录参数

- SDK platform：`VITE_AUTH_PLATFORM`，默认 `global-admin`。
- appCode：`VITE_AUTH_APP_CODE`，默认 `GLOBAL`。
- 登录参数只包含 `locale: 'zh_CN'` 和 `appCode`，不包含 supplierCode。
- 初始化自动跳转、`ensureLogin()` 和 `logout()` 必须复用同一套参数。`auth.ts` 内的 `redirectToLogin()` 是幂等入口，无 token、手动退出和接口 401 都通过它跳转认证中心，同一页面生命周期内最多触发一次。
- 路由守卫 `prepareGlobalAdminRoute()` 在无 token 时显式清理登录态并返回 false 阻止进入后台壳。

### 认证环境与登录地址

认证环境优先使用非空 `VITE_AUTH_ENV`，否则使用 Vite `MODE`。`production` 映射为 `prod`，无法识别的环境回退 `dev`。登录地址由 `src/config/global-auth.config.ts` 维护：

| 环境 | 登录地址 |
| --- | --- |
| development / dev | `http://auth.dev-v2.elnkpro.com/console.html` |
| test | `http://auth.test-com.elnkpro.com/console.html` |
| uat | `http://auth.uat.elnkpro.com/console.html` |
| prod | `http://auth.elnkpro.com/console.html` |

### 认证 API 地址

登录 SDK 的 `apiUrl` 由 `VITE_AUTH_API_URL` 独立提供，必须由部署环境显式配置（见 `.env.development`、`.env.production`、`.env.test`），禁止回退到租户 API 或从业务请求的 `VITE_API_BASE_URL` 推导；缺失时 `requireAuthApiUrl` 直接报错阻止初始化。

## 后端授权

`GlobalAdminGuard` 先复用 AuthGuard 的 JWT 验签和过期校验，再校验配置的 appCode。Global Admin API 和静态路径排除 `TenantMiddleware`，请求不会创建默认租户上下文。

前端不得发送 `supplier`、`supplierCode` 或 `ignore-supplier-check` 来影响范围。后续跨租户能力必须使用显式参数和专用 Service，不能调用依赖 TenantContext 的租户 Service。

## 请求封装与 API 路径

通用 axios、业务 envelope 和 401 处理能力位于 `@aplus-sql/http-client`。`src/api/http.ts` 负责创建 Global Admin 实例并注入 base URL、user store token 和 logout；业务 API 方法位于 `src/api/global-admin.ts`（租户目录）和 `src/api/schedule.ts`（定时任务）。

Global Admin 默认同源调用 API。开发态由 Vite proxy 将 `/global-admin` 请求转发到 API 后端；生产态由 API app 同时提供静态资源和后端接口。当前 Global Admin 接口前缀属于 API app 的 `global-admin` 能力（见 `apps/api/docs/architecture/global-admin.md`）。

## 错误与空状态

- 403 在页面展示无权限状态，401 清理 token 并重新进入登录流程。
- 业务 API 方法应保留后端错误的可排查信息。
- 页面负责展示用户可理解的错误、加载和空状态。
