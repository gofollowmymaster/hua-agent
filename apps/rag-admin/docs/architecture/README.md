# RAG Admin 架构说明

`apps/rag-admin/docs/architecture/` 记录 `apps/rag-admin` 当前实现的架构事实；登录/API、目录/模块、路由/状态的具体规则也合并到对应架构文件。其余页面开发规范见 `apps/rag-admin/docs/standard/development/`。

## 阅读顺序

1. `project-architecture.md`：理解 Vue app 启动、插件注册、布局、页面和整体运行链路，以及路由与状态管理规则。
2. `directory-structure.md`：理解 `apps/rag-admin/src` 目录职责，以及页面、组件、请求的放置规则。
3. `auth-and-api-client.md`：理解登录中心、token cookie、axios 请求封装和后端 API 调用，以及 API client 规则。
4. `build-and-runtime.md`：理解 Vite dev server、proxy、环境变量、构建输出和静态资源访问。

## 适用任务

- 新增或修改 RAG Admin 页面、路由、布局、store、样式或前端请求。
- 调整登录、token 注入、API client、错误处理或代理配置。
- 修改 Vite 构建、静态资源 base、前端环境变量或构建输出目录。

涉及后端接口契约时，同时阅读 `apps/api/docs/architecture/README.md` 和 `AGENTS.md`。
