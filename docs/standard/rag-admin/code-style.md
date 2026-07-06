# RAG Admin 代码风格规范

本文规定 `apps/rag-admin` 的 Vue/TypeScript 基本写法。

## TypeScript

- 优先定义明确类型，避免新增无意义的 `any`。
- 接口响应类型优先靠近 API 封装放置；跨端稳定类型才考虑进入 `packages/shared`。
- 使用前端别名 `@` 引用 `apps/rag-admin/src` 内部代码。
- 不引用 `apps/api/src` 内部路径。

## Vue 组件

- 页面级组件放在 `src/views/`。
- 可复用布局放在 `src/layouts/`。
- 组件内复杂请求、鉴权和数据转换逻辑应下沉到 `api/`、`auth/` 或 store。
- 不在模板中堆叠复杂表达式；复杂展示逻辑放入 computed 或局部函数。

## 错误处理

- API 错误统一优先在请求封装或业务 API 层处理。
- 页面可展示用户可理解的错误状态，但不要直接暴露后端敏感错误详情。
- 不吞掉关键错误；需要降级时保留可排查日志或状态。

## 环境变量

- 只读取 `VITE_` 前缀变量。
- 不在前端代码中写死后端 token、secret、数据库连接串或租户敏感配置。
