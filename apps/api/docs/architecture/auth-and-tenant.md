# 权限与多租户

所有 API 路由都经过 `TenantMiddleware`。中间件解析租户后使用 `TenantContext` 的 `AsyncLocalStorage` 保存当前租户、用户和 request；业务代码应注入 `TenantContext`，不要重复解析 header。

## 租户来源

`TenantMiddleware` 按以下顺序解析租户：

1. `supplier` header。
2. Bearer JWT 中的 `supplierCode`。
3. 非 Bearer `Authorization` 固定 token，通过 `ClientSecretTable` 查询服务商。
4. `NodeConfigService.get('defaultTenant')`。

非 dev 环境还会使用租户 `hostTag` 校验请求 host。当前租户为 `aplus`、`boat`、`yurex`。

## Guard

- `AuthGuard`：校验 Bearer JWT、登录时间和过期时间，并把 payload 写入 `request.user`。
- `SystemAdminGuard`：校验 JWT 的 `isSystemAdmin` 标记，仅用于本地用户管理接口。
- `SecretAuthGuard`：通过 `ClientSecretTable` 校验固定密钥、启用状态和请求路径权限。
- `CompositeAuthOrSecretGuard`：Bearer 请求使用 `AuthGuard`，其他请求使用 `SecretAuthGuard`。

知识问答聊天和管理端用户接口使用 `AuthGuard`；需要同时支持后台用户和系统调用的保留接口使用组合 Guard。项目不再提供签名 Guard 或无租户管理后台例外。

## 本地用户认证

- `POST /auth/login` 是公开的本地账号密码登录接口。RAG Admin 按页面 hostname 解析服务商码，并通过 `supplier` header 传递给 `TenantMiddleware`，以兼容开发代理。
- 用户记录保存在 RAG PostgreSQL 的 `rag_admin_users`，按 `tenant_code + username` 唯一，密码仅保存 scrypt 加盐哈希。
- 登录 JWT 继续携带 `userId`、`userCode`、`username`、`loginId`、`supplierCode`、`tenantCode`、`appCode`、`scope` 和 `loginTime`；新增 `isSystemAdmin` 仅用于用户管理边界。
- 首次系统管理员通过 `RAG_ADMIN_BOOTSTRAP_*` 环境变量创建。除 `RAG_ADMIN_BOOTSTRAP_RESET_PASSWORD=true` 外，启动不会覆盖既有管理员密码。
- `POST /auth/users/*` 同时使用 `AuthGuard` 和 `SystemAdminGuard`，查询与写入始终限制在当前租户。

## 租户隔离

- Prisma 查询必须携带当前 `tenantCode`，避免跨租户读取文档、分块、会话或消息。
- Redis key 通过 `RedisService.buildCacheKey` 或 `buildCacheKeyWithTemplates` 构造，并在租户化场景使用 `{tenant}`。
- 租户配置只通过 `NodeConfigService` 读取，不直接 import 单个租户文件。
- 固定 token 与飞书表格访问继续依赖 `ClientSecretTable` 和当前租户配置。
