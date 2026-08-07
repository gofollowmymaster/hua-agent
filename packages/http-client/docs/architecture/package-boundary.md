# HTTP Client 包边界

本文记录 `packages/http-client` 的架构边界。

## 适合放入 HTTP Client 的内容

- axios 实例创建、通用 timeout 和 request/response interceptor。
- 通过回调获取 access token 并注入标准 Bearer header。
- workspace 统一使用的 `{ code, body, message }` 响应 envelope 解包。
- 业务 code 或 HTTP status 为 401 时触发的未授权回调。
- 与业务域无关的 `get`、`post`、`del`、`getBlob` 方法和公共类型。

## 不适合放入 HTTP Client 的内容

- 具体业务 URL、请求参数 DTO、响应业务模型或分页转换。
- Pinia store、cookie key、登录 SDK、租户解析、路由跳转或消息提示。
- 直接读取 `import.meta.env`、window、localStorage 或消费 app 配置文件。
- Vue composable、组件状态、页面 loading 或业务错误文案映射。
- 服务端 HTTP client、NestJS provider 或跨端 API 契约定义。

## 认证与副作用边界

- token 必须在每次请求时通过 `getAccessToken` 动态获取，包内不缓存或持久化凭证。
- `onUnauthorized` 只负责通知消费端；清 cookie、退出 store 和跳转登录由消费 app 决定。
- 包不得记录 token、请求敏感数据或认证响应。
- 未配置 token 或未授权回调时，client 仍应支持无认证请求并正常传播错误。

## 响应协议边界

- 数字 `code` 的对象按业务 envelope 处理：`200` 返回 `body`，其他 code 使用 `message` 拒绝。
- 业务 code 和 HTTP status 为 `401` 时调用 `onUnauthorized`，同时保留原错误拒绝语义。
- 不满足 envelope 形状的响应直接返回 `response.data`，避免破坏 Blob 或第三方原始响应。
- 特殊上传、下载和 axios 配置通过公开的原始 `http` 实例或方法 config 参数完成。

## 当前约束

HTTP Client 面向浏览器前端，并与当前后端 envelope 约定绑定。改变成功 code、错误类型或解包规则属于公共行为变更，必须通过 OpenSpec 评估并同步验证全部消费者。
