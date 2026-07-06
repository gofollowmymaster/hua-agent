# RAG Admin 登录与 API Client

本文记录 `apps/rag-admin` 当前登录、token 和请求封装事实。

## 登录与 token

登录相关代码位于 `src/auth/`：

- `auth.ts`：登录中心初始化和登录流程相关逻辑。
- `token.ts`：token cookie 的读写和清理。

前端通过用户登录态获取 token，并在请求后端 API 时使用 `Authorization: Bearer <token>`。后端 RAG 管理接口使用 API app 的 Guard 与租户上下文处理用户身份。

## 请求封装

请求基础封装位于 `src/api/http.ts`，业务 API 方法位于 `src/api/rag-admin.ts`。

页面组件应调用业务 API 方法，不直接散写 URL、请求头、token 注入或 axios 拦截器。

## API 路径

RAG Admin 默认同源调用 API。开发态由 Vite proxy 将 `/ai` 请求转发到 API 后端；生产态由 API app 同时提供静态资源和后端接口。

当前 RAG 管理接口前缀属于 API app 的 `ai/rag/admin` 能力。修改接口字段、响应结构、鉴权方式或错误语义时，需要同时检查前端调用方和后端 DTO/Controller/Service。

## 敏感信息

前端环境变量和构建产物不可包含数据库连接串、机器人 secret、JWT secret、后端固定 token 等敏感信息。只有 `VITE_` 前缀变量会被 Vite 暴露给浏览器。
