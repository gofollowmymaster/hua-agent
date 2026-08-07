## Context

RAG Admin 现有顶层 `src/components`、`src/hooks` 和 `src/api/http.ts` 已具备跨页面复用价值，但组件直接依赖 app API、表格工具栏依赖路由生成存储 key，请求实例直接依赖 Pinia user store。后续前端项目仍位于同一 pnpm workspace，并使用 Vue 3、Vite、aplus-ui 和现有 Less token 体系。

## Goals / Non-Goals

**Goals:**

- 建立独立的 UI 与 HTTP workspace 包，通过公开入口稳定复用。
- 将业务 API、认证实现和运行时配置留在消费 app，通过参数注入解除反向依赖。
- 迁移 RAG Admin 时保持现有请求语义、表格设置数据和用户交互不变。

**Non-Goals:**

- 不生成发布用构建产物或支持 workspace 外安装。
- 不抽取页面私有模块、业务 API、Pinia store、登录 SDK 或主题配置。
- 不替换 aplus-ui、Open File Viewer 或 axios。

## Decisions

### 两个职责包

使用 `@aplus-sql/ui-kit` 承载 Vue 组件与 hooks，使用 `@aplus-sql/http-client` 承载 axios 工厂。相比单一 frontend 包，该方案避免请求层引入 Vue/UI 依赖；相比三个以上细粒度包，当前规模下配置和维护成本更低。

### workspace 源码导出

两个包保持 `private: true`，通过 package exports 直接暴露 TypeScript/Vue 源码，构建命令仅执行 typecheck。该方式与现有 Vite workspace 消费方式一致，并让消费 app 的 Less 配置处理共享组件样式。

### 依赖反转

文档预览 hook 接收 `loadFile(item)`，共享组件不导入业务 API。HTTP 工厂接收 `getAccessToken` 和 `onUnauthorized`，不导入 Pinia、cookie 或登录 SDK。RAG Admin 保留薄适配文件组装这些依赖。

### 公共行为兼容

HTTP client 保留原有 `{ code, body, message }` 解包、Bearer token、业务/HTTP 401 和原始响应行为，并暴露 axios 实例支持上传配置。表格工具栏要求消费端显式传入刷新函数和完整 persistence key，RAG Admin 使用迁移前生成的完整 key 保留 localStorage 数据。

### aplus-ui 表格设置

AgGrid 官方示例仍通过 `ApTable.Setting` 提供列设置，因此共享组件保留该子组件；移除非公开的 `useInjectApTable` 深路径引用。`aplus scan` 对 `ApTable` import 的提示作为已核对的官方例外记录。

## Risks / Trade-offs

- [源码包依赖消费端 Vite/Less 配置] -> peer dependencies 和 README 明确兼容基线，并用 RAG Admin 生产构建验证。
- [HTTP 工厂错误处理影响现有业务] -> 为 envelope、401、原始响应和 Blob 增加单测，RAG Admin 保留原业务 API 签名。
- [表格持久化 key 变化导致设置丢失] -> 消费端传入迁移前的完整 key，并做 localStorage 静态核对。
- [组件迁移出现样式或交互回归] -> 运行包级检查、RAG Admin 构建和本地页面 smoke test。

## Migration Plan

1. 创建两个 workspace 包及公共接口、测试和文档。
2. 将顶层公共组件/hooks 迁移到 UI 包并解除 app 依赖。
3. 将 axios 通用逻辑迁移到 HTTP 包，RAG Admin 保留实例适配。
4. 更新消费端 imports、刷新回调和持久化 key，删除 app 内重复实现。
5. 更新 workspace 配置、lockfile、治理文档并执行完整验证。

回滚时可恢复 RAG Admin 原目录与请求实现并移除两个 workspace 依赖；不涉及数据库或后端部署变更。

## Open Questions

无。
