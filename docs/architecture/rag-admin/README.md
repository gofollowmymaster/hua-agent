# RAG Admin 架构说明

`docs/architecture/rag-admin/` 记录 `apps/rag-admin` 的前端架构事实。前端实现规范见 `docs/standard/rag-admin/README.md`。

## 阅读顺序

1. `project-architecture.md`：理解 Vue app 启动、插件注册、布局、页面和整体运行链路。
2. `directory-structure.md`：理解 `apps/rag-admin/src` 目录职责。
3. `auth-and-api-client.md`：理解登录中心、token cookie、axios 请求封装和后端 API 调用。
4. `build-and-runtime.md`：理解 Vite dev server、proxy、环境变量、构建输出和静态资源访问。

## 适用任务

- 新增或修改 RAG Admin 页面、路由、布局、store、样式或前端请求。
- 调整登录、token 注入、API client、错误处理或代理配置。
- 修改 Vite 构建、静态资源 base、前端环境变量或构建输出目录。

涉及后端接口契约时，同时阅读 `docs/architecture/api/README.md` 和 `docs/architecture/workspace.md`。
