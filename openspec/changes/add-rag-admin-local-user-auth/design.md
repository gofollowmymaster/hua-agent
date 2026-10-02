## Decisions

1. 用户存储在 RAG PostgreSQL，按 `tenantCode + username` 唯一；禁用采用状态字段，不物理删除。
2. 密码使用 Node `crypto.scrypt` 加盐哈希；首次系统管理员由后端环境变量创建，只有显式开关会重置现存密码。
3. JWT 继续由当前 `JwtService` 和 `JWT_SECRET` 签发，保留 `loginTime`、租户和用户 claims，现有 Guard 无需改变。
4. 前端按当前 hostname 解析服务商码并作为 `supplier` 请求头传给登录 API；后端复用 `TenantMiddleware` 的租户上下文，兼容开发代理。
5. 用户管理 API 由 `AuthGuard` 与 `SystemAdminGuard` 共同保护，所有查询和写入限定当前租户。

## Risks

- 已签发 token 不因禁用即时失效，保持既有 JWT 过期语义。
- 首次管理员密码只能从安全的部署环境变量提供，绝不写入前端或仓库。
