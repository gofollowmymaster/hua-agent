# RAG Admin API Client 规范

本文规定前端请求封装、token 注入和接口契约变更规则。

## 请求入口

- axios 实例统一维护在 `src/api/http.ts`。
- 业务请求方法维护在 `src/api/` 下的业务文件中。
- 页面组件只调用业务 API 方法，不直接创建 axios 实例。

## Token 与鉴权

- token 读写统一通过 `src/auth/token.ts`。
- 请求头注入统一在 axios 封装层完成。
- 不在页面组件中手动拼接 `Authorization`。
- 登录初始化和跳转逻辑放在 `src/auth/auth.ts` 或路由守卫相关位置。

## 契约变更

修改请求路径、HTTP 方法、参数字段、响应字段、错误语义或鉴权方式时：

- 同步检查后端 DTO、Controller、Service 和 Guard。
- 同步检查所有前端调用方。
- 必要时更新 shared 类型。
- 按跨端变更执行验证。

## 错误与空状态

业务 API 方法应保留后端错误的可排查信息；页面负责展示用户可理解的错误、加载和空状态。
