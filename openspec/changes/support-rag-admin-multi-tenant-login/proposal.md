## Why

RAG Admin 的登录跳转当前固定携带租户 C，并写死 C 的登录中心地址，导致同一套管理端代码无法部署给 A、C、D 三个租户。需要根据访问域名识别租户并统一维护各认证环境的登录地址，同时保持后端基于 JWT 的租户隔离不变。

## What Changes

- 新增 A、C、D 租户认证配置和基于 hostname 的租户解析。
- 认证环境优先使用 `VITE_AUTH_ENV`，否则规范化 Vite `MODE`。
- 登录初始化、首次登录和退出统一使用解析后的登录地址与 `supplierCode`。
- 移除固定租户构建变量 `VITE_SUPPLIER_CODE`。
- 为环境、域名和登录跳转参数补充自动化测试与架构文档。

## Capabilities

### New Capabilities

- `rag-admin-tenant-login`: 定义 RAG Admin 按域名识别租户、按环境选择登录中心及统一跳转参数的行为。

### Modified Capabilities

无。

## Impact

影响 `apps/rag-admin` 的认证配置、登录 SDK 初始化、环境声明、测试依赖和登录架构文档；不修改后端 API、JWT、数据库或租户上下文。

## Non-goals

- 不提供登录后的租户切换。
- 不改变后端鉴权与数据隔离逻辑。
