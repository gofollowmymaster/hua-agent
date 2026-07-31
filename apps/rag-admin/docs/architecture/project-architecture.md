# RAG Admin 项目架构

`apps/rag-admin` 是 RAG 管理后台前端，使用 Vue 3、Vite、TypeScript、Vue Router、Pinia、axios、`@ai-sdk/vue`、公司前端 UI/登录相关依赖和文件预览能力。

## 启动链路

前端入口位于 `apps/rag-admin/src/main.ts`。应用启动时创建 Vue app，注册路由、状态管理、全局样式和 UI 相关能力，然后挂载到页面根节点。

`App.vue` 是前端根组件，路由页面通过 Vue Router 渲染。当前路由使用 hash 模式，适配由 API app 静态资源目录提供的访问方式。

## 页面结构

当前主要页面包括：

- `DocumentManager.vue`：RAG 文档管理。
- `SessionRecords.vue`：会话与消息记录查看。
- `AssistantDemo.vue`：助手演示页面。

页面私有复用组件位于 `src/views/components/`，例如文档片段抽屉和文档预览弹窗。后台布局位于 `src/layouts/AdminLayout.vue`，路由定义位于 `src/router/`。

## 状态与请求

Pinia 初始化位于 `src/stores/`，当前用户信息 store 位于 `src/stores/modules/user.ts`。后端请求通过 `src/api/http.ts` 的 axios 实例和 `src/api/rag-admin.ts` 的业务 API 方法封装。

登录与 token 处理位于 `src/auth/`。页面和业务 API 不直接散写 token 读取、请求头拼接或登录中心初始化逻辑。

## UI 与预览能力

RAG Admin 页面开发强制优先使用 `@aplus-frontend/ui` 的组件。表格、表单、详情、弹窗、抽屉、分页、筛选、按钮、提示等后台常见场景，默认使用 aplus-ui 的成熟组件或项目中基于 aplus-ui 的既有封装。

项目也引入了 `@aplus-frontend/antdv` 作为公司组件体系的一部分，但它不是页面开发的首选组件来源。只有 aplus-ui 无法满足场景、项目已有 antdv 封装更合适，或存在明确技术限制时，才考虑使用 Ant Design Vue 能力。文档预览相关能力来自 `@open-file-viewer/*` 和 `pdfjs-dist`。

新增 UI 能力应优先复用 aplus-ui 和已有页面模式，避免引入第二套同职责 UI 框架。

## 与 API app 的关系

RAG Admin 开发态通过 Vite proxy 将 `/ai` 请求转发到 API 后端。生产态构建产物输出到 `apps/api/public/rag-admin`，由 API app 的静态资源服务提供访问。

前端与后端通过 HTTP API 契约协作，不直接 import `apps/api/src` 内部实现。
