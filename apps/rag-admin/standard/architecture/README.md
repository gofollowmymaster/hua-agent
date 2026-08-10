# RAG Admin 架构说明

`apps/rag-admin/standard/architecture/` 是本 app 的架构入口；RAG Admin 特有架构事实见本目录 `custom/`。两个前端 app（RAG Admin、Global Admin）共用的架构约定见 `docs/standard/frontend/architecture/README.md`，目录与模块代码文件组织结构规范见 `docs/standard/frontend/development/directory-structure.md`。其余页面开发规范见 `apps/rag-admin/standard/development/`。

## 阅读顺序

0. `docs/standard/frontend/architecture/README.md`：多前端 app 共用架构约定（启动链路、请求/路由/store 规则、数据流、构建运行）。
1. `docs/standard/frontend/development/directory-structure.md`：顶层目录与 src 目录职责、模块代码文件放置规则。
2. `custom/project-architecture.md`：RAG Admin 特有页面、路由组织和 user store 位置。
3. `custom/auth-and-api-client.md`：登录中心、租户解析、token cookie 和登录 SDK 地址矩阵。
4. `custom/build-and-runtime.md`：Vite dev server、proxy、环境变量、构建输出和静态资源访问。

## 适用任务

- 新增或修改 RAG Admin 页面、路由、布局、store、样式或前端请求。
- 调整登录、token 注入、API client、错误处理或代理配置。
- 修改 Vite 构建、静态资源 base、前端环境变量或构建输出目录。

涉及后端接口契约时，同时阅读 `apps/api/docs/architecture/README.md` 和 `AGENTS.md`。
