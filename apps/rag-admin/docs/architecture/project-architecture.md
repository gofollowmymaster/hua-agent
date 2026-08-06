# RAG Admin 项目架构与路由状态

`apps/rag-admin` 是 RAG 管理后台前端，使用 Vue 3、Vite、TypeScript、Vue Router、Pinia、axios、`@ai-sdk/vue`、公司前端 UI/登录相关依赖和文件预览能力。本文记录项目架构事实，并承载路由与 Pinia 状态管理规则。

## 启动链路

前端入口位于 `apps/rag-admin/src/main.ts`。应用启动时创建 Vue app，注册路由、状态管理、全局样式和 UI 相关能力，然后挂载到页面根节点。

`app.vue` 是前端根组件，路由页面通过 Vue Router 渲染。当前路由使用 hash 模式，适配由 API app 静态资源目录提供的访问方式。

## 页面结构

当前主要页面包括：

- `document-manager/index.vue`：RAG 文档管理。
- `session-records/index.vue`：会话与消息记录查看。
- `assistant-demo/index.vue`：助手演示页面。
- `business-agent/knowledge|skills|sessions|config|demo/index.vue`：业务 Agent 骨架占位页面。

模块公共展示组件位于对应页面目录的 `components/`，业务弹窗、抽屉和页面区块位于 `sections/`，跨项目稳定复用组件位于 `src/components/`，例如文档预览弹窗。后台布局位于 `src/layouts/admin-layout.vue`，全局抽屉容器位于 `src/layouts/layout-drawer.vue`，路由定义位于 `src/router/`。

## 状态与请求

Pinia 初始化位于 `src/stores/`，当前用户信息 store 位于 `src/stores/modules/user.ts`。后端请求通过 `src/api/http.ts` 的 axios 实例和 `src/api/rag-admin.ts` 的业务 API 方法封装。

登录与 token 处理位于 `src/auth/`。

## UI 与预览能力

项目使用 `@aplus-frontend/ui` 和 `@aplus-frontend/antdv` 作为公司组件体系；文档预览相关能力来自 `@open-file-viewer/*` 和 `pdfjs-dist`。

## 与 API app 的关系

RAG Admin 开发态通过 Vite proxy 将 `/ai` 请求转发到 API 后端。生产态构建产物输出到 `apps/api/public/rag-admin`，由 API app 的静态资源服务提供访问。

前端与后端通过 HTTP API 契约协作，不直接 import `apps/api/src` 内部实现。

更多页面开发规则见 `../standard/development/`。

## 路由规则

- 路由配置集中维护在 `src/router/routes.ts`。
- 路由实例和全局守卫维护在 `src/router/index.ts`。
- 当前前端使用 hash 路由，避免 API 静态资源服务下刷新路径失效。
- 新增路由时确认页面标题、布局、鉴权要求和默认跳转行为。
- 路由 `name` 使用稳定语义化名称，优先 `camelCase` 或同文件既有风格；页面组件文件使用 `kebab-case.vue`。
- 路由 path 使用短横线 kebab-case，避免拼音、无意义缩写或过深层级。
- 路由按一级模块组织：`/knowledge/*` 承载知识问答，`/business-agent/*` 承载业务 Agent；旧 `/documents`、`/sessions`、`/assistant` 保留 redirect。

## 状态管理规则

- Pinia 初始化位于 `src/stores/`。
- 跨页面共享或需要统一缓存的数据可以进入 store。
- 页面内一次性查询、筛选、弹窗状态优先留在组件内。
- store 不直接处理 DOM 或路由跳转细节。
- store 模块文件使用业务名，放在 `src/stores/modules/`。
- store action 负责状态生命周期和数据获取编排，不承担复杂展示格式化；展示格式化优先放在页面 computed 或组件内。

## 数据流

推荐数据流：

```text
view -> api method -> http client -> API app
view -> store -> api method -> http client -> API app
```

不要让页面绕过 API 封装直接请求后端，也不要让 store 依赖后端内部源码。
