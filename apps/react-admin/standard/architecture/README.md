# React Admin 架构说明

React Admin 是与 Vue RAG Admin 并行的 Umi Max 管理后台，使用 React 18.3.1、Ant Design 6.6.5 和 `@ant-design/pro-components` 3.1.15-5 beta。前端依赖安装与构建要求 Node.js 22.12.0 或更高版本。应用使用 hash history，开发端口为 `5175`，静态资源路径为 `/public/react-admin/`，构建输出到 `apps/api/public/react-admin`。

`src/api/` 封装业务请求，`src/models/` 管理认证状态，`src/layouts/` 承载 ProLayout 和全局 Drawer，`src/pages/` 按路由组织页面，`src/components/` 保存 app 内跨页面 React 组件。应用只复用框架无关的 `@aplus-sql/http-client` 和 `@open-file-viewer/core`。

`.umirc.ts` 只承载构建、插件、环境变量和代理配置，声明式路由位于 `config/routes.ts`。Ant Design 核心组件 API 通过与 antd 版本一致的 `@ant-design/cli` 查询和检查；Umi 插件通过 workspace override 与应用共用 ProComponents 3.1。

认证通过 `POST /auth/login` 建立，持久化兼容 `localStorage['authToken']`，普通请求与流式 fetch 均在 401 时清理状态并跳转登录页。
