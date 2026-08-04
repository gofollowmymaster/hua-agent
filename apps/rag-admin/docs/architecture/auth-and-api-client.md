# RAG Admin 登录、API Client 与接口契约

本文记录 `apps/rag-admin` 当前登录、token 和请求封装事实，并承载请求封装、token 注入和接口契约变更的开发规则。

## 登录与 token

登录相关代码位于 `src/auth/`：

- `auth.ts`：登录中心初始化和登录流程相关逻辑。
- `token.ts`：token cookie 的读写和清理。

前端通过用户登录态获取 token，并在请求后端 API 时使用 `Authorization: Bearer <token>`。后端 RAG 管理接口使用 API app 的 Guard 与租户上下文处理用户身份。

## 请求封装

请求基础封装位于 `src/api/http.ts`，业务 API 方法位于 `src/api/rag-admin.ts`。

## API 路径

RAG Admin 默认同源调用 API。开发态由 Vite proxy 将 `/ai` 请求转发到 API 后端；生产态由 API app 同时提供静态资源和后端接口。

当前 RAG 管理接口前缀属于 API app 的 `ai/rag/admin` 能力。

## 敏感信息

前端环境变量和构建产物不可包含数据库连接串、机器人 secret、JWT secret、后端固定 token 等敏感信息。只有 `VITE_` 前缀变量会被 Vite 暴露给浏览器。

## 请求入口规则

- axios 实例统一维护在 `src/api/http.ts`。
- 业务请求方法维护在 `src/api/` 下的业务文件中。
- 页面组件只调用业务 API 方法，不直接创建 axios 实例。
- API 文件只负责请求、响应类型和轻量参数整理，不承担页面状态和展示逻辑。
- 单个 API 文件不超过 400 行；超过时按业务子域拆分。

## Token 与鉴权规则

- token 读写统一通过 `src/auth/token.ts`。
- 请求头注入统一在 axios 封装层完成。
- 不在页面组件中手动拼接 `Authorization`。
- 登录初始化和跳转逻辑放在 `src/auth/auth.ts` 或路由守卫相关位置。

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
