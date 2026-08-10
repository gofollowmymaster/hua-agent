# RAG Admin 登录、API Client 与接口契约

本文记录 `apps/rag-admin` 的特有登录与 API 事实；通用请求封装规则（`createHttpClient`、业务 API 文件、页面调用边界、契约变更检查）见 `docs/standard/frontend/architecture/README.md`。

## 登录与 token

登录相关代码与 user store 一起位于 `src/stores/modules/user/`：

- `index.ts`：用户登录状态、用户信息和登录生命周期编排。
- `auth.ts`：登录中心初始化和登录流程相关逻辑。
- `tenant-auth.config.ts`：租户域名匹配、认证环境规范化、登录中心和认证 API 地址矩阵。

前端通过用户登录态获取 token，并在请求后端 API 时使用 `Authorization: Bearer <token>`。两个管理后台统一使用 `pinia-plugin-persistedstate` 将 user store 的 `token` / `userInfo` 持久化到 `localStorage['authToken']`（无平台前缀）。旧 `rag-admin-auth-access-token` cookie 仅在 `authToken` 不存在时迁移一次，迁移后清理。后端 RAG 管理接口使用 API app 的 Guard 与租户上下文处理用户身份。

### 租户解析

登录前根据当前页面 hostname 选择服务商码和登录中心：

- A：`aplnk.com`、`dev-v2.elnkpro.com`、`test-xw.elnkpro.com`、`uat.elnkpro.com`。
- C：`clouboat.com`、`test-com.elnkpro.com`。
- D：`yurexcc.com`。

匹配使用大小写无关的完整域名或点分后缀，不使用普通字符串包含判断。localhost、空 hostname 和未配置域名统一回退 D。RAG Admin 不提供登录后的租户切换；后端继续从 JWT `supplierCode` 解析真实租户上下文。

### 认证环境与登录地址

认证环境优先使用非空 `VITE_AUTH_ENV`，否则使用 Vite `MODE`。`production` 映射为登录 SDK 的 `prod`，无法识别的环境回退 `dev`。显式配置 `VITE_AUTH_ENV` 可覆盖 Vite mode，例如开发构建连接 UAT 登录中心。

| 租户 | development / dev | test | uat | prod |
| --- | --- | --- | --- | --- |
| A | `http://auth.dev-v2.elnkpro.com/admin.html#/` | `https://auth.test-xw.elnkpro.com/admin.html#/` | `https://auth.uat.elnkpro.com/admin.html#/` | `https://auth.aplnk.com/admin.html#/` |
| C | `http://auth.dev-v2.clouboat.com/admin.html#/` | `https://auth.test-com.elnkpro.com/admin.html#/` | `https://auth.uat-cb.clouboat.com/admin.html#/` | `https://auth.clouboat.com/admin.html#/` |
| D | `http://auth.dev-v2.yurexcc.com/admin.html#/` | `https://auth.test.yurexcc.com/admin.html#/` | `https://auth.uat.yurexcc.com/admin.html#/` | `https://auth.yurexcc.com/admin.html#/` |

SDK 初始化自动跳转、`ensureLogin()` 和 `logout()` 必须复用同一解析结果，并统一携带 `locale`、`supplierCode` 和 `appCode`。`auth.ts` 内的 `redirectToLogin()` 是幂等入口：无 token、手动退出和接口 401 都通过它跳转认证中心，同一页面生命周期内最多触发一次。路由守卫 `prepareRagAdminRoute()` 在无 token 时显式清理登录态并阻止进入后台壳。

### 登录 SDK API 地址

登录 SDK 的 `apiUrl` 与登录中心地址使用同一个租户和认证环境解析结果，不从 RAG 业务请求的 `VITE_API_BASE_URL` 推导。`development` 使用空地址以保留当前 origin 和本地代理行为。

| 租户 | development | dev | test | uat | prod |
| --- | --- | --- | --- | --- | --- |
| A | 空地址 | `http://api.dev-v2.elnkpro.com` | `https://api.test-com.elnkpro.com` | `https://api.uat.elnkpro.com` | `https://api.aplnk.com` |
| C | 空地址 | `http://api.dev-v2.elnkpro.com` | `https://api.test-com.elnkpro.com` | `https://api.uat-cb.clouboat.com` | `https://api.clouboat.com` |
| D | 空地址 | `http://api.dev-v2.elnkpro.com` | `https://api.test-com.elnkpro.com` | `https://api.uat.yurexcc.com` | `https://api.yurexcc.com` |

## 请求封装与 API 路径

通用 axios、业务 envelope 和 401 处理能力位于 `@aplus-sql/http-client`。`src/api/common/http.ts` 负责创建 RAG Admin 实例并注入 base URL、user store token 和 logout；聊天流式 adapter 通过 `src/api/common/unauthorized-fetch.ts` 的自定义 fetch 处理 HTTP 401。业务 API 方法按“模块目录 + 菜单文件”维护在 `src/api/<module>/<menu>.ts`，公共类型和参数清洗统一放在 `src/api/common/`。

RAG Admin 开发/测试环境通过 `VITE_API_BASE_URL=/api` 统一携带 `/api` 前缀，开发态由 Vite proxy 将 `/api` 请求转发到 API 后端并去掉前缀；生产态保持同源调用，由 API app 同时提供静态资源和后端接口。

当前 RAG 管理接口前缀属于 API app 的 `ai/rag/admin` 能力。

## 错误与空状态

- 业务 API 方法应保留后端错误的可排查信息。
- 页面负责展示用户可理解的错误、加载和空状态。
