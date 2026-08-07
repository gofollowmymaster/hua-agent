# Global Admin 架构说明

`apps/global-admin` 是供总管理员使用的无租户 Vue/Vite 总控台。它拥有独立登录、token、路由和静态输出，不共享 RAG Admin 的租户解析结果。

## 阅读顺序

1. `project-architecture.md`：应用启动、布局、路由和详情抽屉。
2. `auth-and-api-client.md`：GLOBAL appCode、认证地址、HTTP client 和后端边界。
3. `build-and-runtime.md`：开发代理、静态 base 和生产输出。

实现规则见 `../standard/README.md`。涉及后端接口时同时阅读 API 的 `auth-and-tenant.md`。
