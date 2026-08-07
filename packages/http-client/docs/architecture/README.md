# HTTP Client 架构说明

`packages/http-client` 是 monorepo 内前端项目共享的 HTTP 基础设施包，通过依赖注入统一 axios、Bearer token、业务 envelope 和未授权响应处理。实现规范见 `packages/http-client/docs/standard/README.md`。

## 当前状态

- 包名：`@aplus-sql/http-client`。
- 目录：`packages/http-client`。
- 入口：`packages/http-client/src/index.ts`。
- 运行时依赖：axios。
- 当前消费者：`apps/rag-admin`、`apps/global-admin`。
- 当前通过 package exports 直接暴露 TypeScript 源码，不生成独立 `dist`。

## 运行模型

- `createHttpClient` 为每个消费 app 创建独立 axios 实例。
- 消费端注入 `baseURL`、`timeout`、`getAccessToken` 和 `onUnauthorized`。
- client 负责 Bearer header、`{ code, body, message }` 解包、业务/HTTP 401 和 Blob 请求。
- 消费 app 保留业务 API、认证数据源、登录跳转和运行时环境配置。

## 阅读入口

- `package-boundary.md`：HTTP Client 允许能力、认证隔离和协议边界。

修改 HTTP Client 时必须检查所有消费者，重点验证请求 header、响应解包、错误传播、401 副作用和文件请求。
