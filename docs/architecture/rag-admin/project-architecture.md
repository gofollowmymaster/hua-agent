# RAG Admin 项目架构

`apps/rag-admin` 是 RAG 管理后台前端，使用 Vue 3、Vite、TypeScript、Vue Router、Pinia、axios 和公司前端 UI/登录相关依赖。

## 启动链路

前端入口位于 `apps/rag-admin/src/main.ts`。应用启动时创建 Vue app，注册路由、状态管理、全局样式和 UI 相关能力，然后挂载到页面根节点。

`App.vue` 是前端根组件，路由页面通过 Vue Router 渲染。当前路由使用 hash 模式，适配由 API app 静态资源目录提供的访问方式。

## 页面结构

当前主要页面包括：

- `DocumentManager.vue`：RAG 文档管理。
- `SessionRecords.vue`：会话与消息记录查看。
- `AssistantDemo.vue`：助手演示页面。

后台布局位于 `src/layouts/AdminLayout.vue`，路由定义位于 `src/router/`。

## 状态与请求

Pinia 初始化位于 `src/stores/`。后端请求通过 `src/api/http.ts` 的 axios 实例和 `src/api/rag-admin.ts` 的业务 API 方法封装。

登录与 token 处理位于 `src/auth/`。页面和业务 API 不直接散写 token 读取、请求头拼接或登录中心初始化逻辑。

## 与 API app 的关系

RAG Admin 开发态通过 Vite proxy 将 `/ai` 请求转发到 API 后端。生产态构建产物输出到 `apps/api/public/rag-admin`，由 API app 的静态资源服务提供访问。

前端与后端通过 HTTP API 契约协作，不直接 import `apps/api/src` 内部实现。
