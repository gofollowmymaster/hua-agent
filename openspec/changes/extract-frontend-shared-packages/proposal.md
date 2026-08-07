## Why

RAG Admin 的公共 Vue 组件、hooks 和 axios 封装目前位于 app 内，后续新增前端项目时会产生复制代码、认证耦合和维护分叉。需要建立明确的 workspace 前端共享包边界，让多个 Vue 应用复用同一套 UI 与请求基础能力。

## What Changes

- 新增 `@aplus-sql/ui-kit`，承载跨项目 Vue 组件与 hooks，并从 RAG Admin 迁移现有顶层公共实现。
- 新增 `@aplus-sql/http-client`，通过工厂和回调注入 token、401 处理及运行时配置。
- RAG Admin 改为消费两个 workspace 包，业务 API、Pinia、认证和页面私有模块继续留在 app 内。
- 补充包级构建、测试、静态检查、根命令路由与架构文档。

## Capabilities

### New Capabilities

- `frontend-shared-packages`: 定义同 monorepo Vue 应用共享 UI、hooks 和 HTTP client 的公共接口、依赖边界与消费方式。

### Modified Capabilities

无。

## Non-goals

- 不发布 npm 包或生成独立分发产物。
- 不迁移页面私有 hooks、components、业务 API、store 或认证 SDK。
- 不修改后端接口、鉴权协议或用户可见业务行为。

## Impact

- 新增 `packages/ui-kit`、`packages/http-client` 及 workspace 依赖。
- 调整 RAG Admin 公共组件、hooks、请求实例的导入与配置位置。
- 更新根脚本、lint-staged、lockfile、AI 治理和前端目录文档。
