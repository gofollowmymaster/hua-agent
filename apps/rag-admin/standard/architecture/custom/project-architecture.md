# RAG Admin 项目架构与路由状态

本文记录 `apps/rag-admin` 的特有架构事实；两个前端 app 共用的架构约定（启动链路、目录职责、路由/store 规则、数据流）见 `docs/standard/frontend/architecture/README.md`。

## 启动链路

前端入口位于 `apps/rag-admin/src/main.ts`。应用启动时创建 Vue app，注册路由、状态管理、全局样式和 UI 相关能力，然后挂载到页面根节点。

`app.vue` 是前端根组件，后台布局位于 `src/layouts/admin-layout.vue`，全局抽屉容器位于 `src/layouts/layout-drawer.vue`，路由定义位于 `src/router/`。当前路由使用 hash 模式，适配由 API app 静态资源目录提供的访问方式。

## 页面结构

当前主要页面包括：

- `knowledge/document-manager/index.vue`：RAG 文档管理。
- `knowledge/session-records/index.vue`：会话与消息记录查看。
- `knowledge/assistant-demo/index.vue`：助手演示页面。
- `business-agent/knowledge/index.vue`：业务知识库管理。
- `business-agent/demo/index.vue`：多工具 Agent 聊天演示。
- `business-agent/skills|sessions|config/index.vue`：业务 Agent 骨架占位页面。

模块公共展示组件位于对应页面目录的 `components/`，业务弹窗、抽屉和页面区块位于 `sections/`；跨页面复用的展示组件位于 `src/components/`，例如文档预览弹窗。

## 路由组织

- `/knowledge/*` 承载知识问答，`/business-agent/*` 承载业务 Agent。
- 旧 `/documents`、`/sessions`、`/assistant` 保留 redirect。

## 状态与请求

- 用户 store 位于 `src/stores/modules/user/index.ts`。
- 登录 SDK、token 持久化（pinia-plugin-persistedstate + `localStorage['authToken']`）与租户认证配置和 user store 一起位于 `src/stores/modules/user/`。
- 后端请求通过 `src/api/common/http.ts` 的 axios 实例封装，业务 API 方法按“模块目录 + 菜单文件”维护在 `src/api/<module>/<menu>.ts`。

## UI 与预览能力

项目使用 `@aplus-frontend/ui` 和 `@aplus-frontend/antdv` 作为公司组件体系；文档预览相关能力来自 `@open-file-viewer/*` 和 `pdfjs-dist`。

## 与 API app 的关系

RAG Admin 开发态通过 Vite proxy 将 `/api` 请求转发到 API 后端并去掉 `/api` 前缀。生产态构建产物输出到 `apps/api/public/rag-admin`，由 API app 的静态资源服务提供访问。

前端与后端通过 HTTP API 契约协作，不直接 import `apps/api/src` 内部实现。

更多页面开发规则见 `apps/rag-admin/standard/development/`。
