# Global Admin 架构说明

`apps/global-admin` 是供总管理员使用的无租户 Vue/Vite 总控台。它拥有独立登录、token、路由和静态输出，不共享 RAG Admin 的租户解析结果。

`apps/global-admin/standard/architecture/` 是本 app 的架构入口；Global Admin 特有架构事实见本目录 `custom/`。两个前端 app 共用的架构约定见 `docs/standard/frontend/architecture/README.md`，目录与模块代码文件组织结构规范见 `docs/standard/frontend/development/directory-structure.md`。

## 阅读顺序

0. `docs/standard/frontend/architecture/README.md`：多前端 app 共用架构约定（启动链路、请求/路由/store 规则、数据流、构建运行）。
1. `docs/standard/frontend/development/directory-structure.md`：顶层目录与 src 目录职责、模块代码文件放置规则。
2. `custom/project-architecture.md`：应用启动、布局、路由和详情抽屉。
3. `custom/auth-and-api-client.md`：GLOBAL appCode、认证地址、HTTP client 和后端边界。
4. `custom/build-and-runtime.md`：开发代理、静态 base 和生产输出。

实现规则见 `docs/standard/frontend/` 共享规范与 `../development/README.md`。涉及后端接口时同时阅读 API 的 `auth-and-tenant.md` 与 `global-admin.md`。
