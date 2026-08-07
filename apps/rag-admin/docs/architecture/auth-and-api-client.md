# RAG Admin 登录、API Client 与接口契约

本文记录 `apps/rag-admin` 当前登录、token 和请求封装事实，并承载请求封装、token 注入和接口契约变更的开发规则。

## 登录与 token

登录相关代码与 user store 一起位于 `src/stores/modules/user/`：

- `index.ts`：用户登录状态、用户信息和登录生命周期编排。
- `auth.ts`：登录中心初始化和登录流程相关逻辑。
- `tenant-auth.config.ts`：租户域名匹配、认证环境规范化、登录中心和认证 API 地址矩阵。
- `token.ts`：token cookie 的读写和清理。

前端通过用户登录态获取 token，并在请求后端 API 时使用 `Authorization: Bearer <token>`。后端 RAG 管理接口使用 API app 的 Guard 与租户上下文处理用户身份。

### 租户解析

登录前根据当前页面 hostname 选择服务商码和登录中心：

- A：`aplnk.com`、`dev-v2.elnkpro.com`、`test-xw.elnkpro.com`、`uat.elnkpro.com`。
- C：`clouboat.com`、`test-com.elnkpro.com`。
- D：`yurexcc.com`。

匹配使用大小写无关的完整域名或点分后缀，不使用普通字符串包含判断。localhost、空 hostname 和未配置域名统一回退 C。RAG Admin 不提供登录后的租户切换；后端继续从 JWT `supplierCode` 解析真实租户上下文。

### 认证环境与登录地址

认证环境优先使用非空 `VITE_AUTH_ENV`，否则使用 Vite `MODE`。`production` 映射为登录 SDK 的 `prod`，无法识别的环境回退 `dev`。显式配置 `VITE_AUTH_ENV` 可覆盖 Vite mode，例如开发构建连接 UAT 登录中心。

| 租户 | development / dev | test | uat | prod |
| --- | --- | --- | --- | --- |
| A | `http://auth.dev-v2.elnkpro.com/admin.html#/` | `https://auth.test-xw.elnkpro.com/admin.html#/` | `https://auth.uat.elnkpro.com/admin.html#/` | `https://auth.aplnk.com/admin.html#/` |
| C | `http://auth.dev-v2.clouboat.com/admin.html#/` | `https://auth.test-com.elnkpro.com/admin.html#/` | `https://auth.uat-cb.clouboat.com/admin.html#/` | `https://auth.clouboat.com/admin.html#/` |
| D | `http://auth.dev-v2.yurexcc.com/admin.html#/` | `https://auth.test.yurexcc.com/admin.html#/` | `https://auth.uat.yurexcc.com/admin.html#/` | `https://auth.yurexcc.com/admin.html#/` |

SDK 初始化自动跳转、`ensureLogin()` 和 `logout()` 必须复用同一解析结果，并统一携带 `locale`、`supplierCode` 和 `appCode`。

### 登录 SDK API 地址

登录 SDK 的 `apiUrl` 与登录中心地址使用同一个租户和认证环境解析结果，不从 RAG 业务请求的 `VITE_API_BASE_URL` 推导。`development` 使用空地址以保留当前 origin 和本地代理行为。

| 租户 | development | dev | test | uat | prod |
| --- | --- | --- | --- | --- | --- |
| A | 空地址 | `http://api.dev-v2.elnkpro.com` | `https://api.test-com.elnkpro.com` | `https://api.uat.elnkpro.com` | `https://api.aplnk.com` |
| C | 空地址 | `http://api.dev-v2.elnkpro.com` | `https://api.test-com.elnkpro.com` | `https://api.uat-cb.clouboat.com` | `https://api.clouboat.com` |
| D | 空地址 | `http://api.dev-v2.elnkpro.com` | `https://api.test-com.elnkpro.com` | `https://api.uat.yurexcc.com` | `https://api.yurexcc.com` |

## 请求封装

通用 axios、业务 envelope 和 401 处理能力位于 `@aplus-sql/http-client`。`src/api/http.ts` 负责创建 RAG Admin 实例并注入 base URL、user store/cookie token 和 logout；业务 API 方法位于 `src/api/rag-admin.ts`。

## API 路径

RAG Admin 默认同源调用 API。开发态由 Vite proxy 将 `/ai` 请求转发到 API 后端；生产态由 API app 同时提供静态资源和后端接口。

当前 RAG 管理接口前缀属于 API app 的 `ai/rag/admin` 能力。

## 敏感信息

前端环境变量和构建产物不可包含数据库连接串、机器人 secret、JWT secret、后端固定 token 等敏感信息。只有 `VITE_` 前缀变量会被 Vite 暴露给浏览器。

## 请求入口规则

- axios 实例通过 `createHttpClient` 在 `src/api/http.ts` 统一创建，不在页面或业务 API 文件中重复配置 interceptor。
- 业务请求方法维护在 `src/api/` 下的业务文件中。
- 页面组件只调用业务 API 方法，不直接创建 axios 实例。
- API 文件只负责请求、响应类型和轻量参数整理，不承担页面状态和展示逻辑。
- 单个 API 文件不超过 400 行；超过时按业务子域拆分。

## Token 与鉴权规则

- token 读写统一通过 `src/stores/modules/user/token.ts`。
- 租户、登录中心和登录 SDK API 地址统一通过 `src/stores/modules/user/tenant-auth.config.ts` 解析，不在页面、store 或环境文件中固定服务商码。
- 请求头注入统一由 `@aplus-sql/http-client` 完成，token 获取与 logout 回调由 RAG Admin 适配层注入。
- 不在页面组件中手动拼接 `Authorization`。
- 登录初始化和跳转逻辑放在 `src/stores/modules/user/auth.ts` 或路由守卫相关位置。

## 契约变更规则

修改请求路径、HTTP 方法、参数字段、响应字段、错误语义或鉴权方式时：

- 同步检查后端 DTO、Controller、Service 和 Guard。
- 同步检查所有前端调用方。
- 必要时更新 shared 类型。
- 按跨端变更执行验证。
- 命名保持前后端语义一致，避免同一字段在前端使用另一套含义相近的名称。

## 错误与空状态

- 业务 API 方法应保留后端错误的可排查信息。
- 页面负责展示用户可理解的错误、加载和空状态。
