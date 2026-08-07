## Why

现有 RAG Admin 绑定 JWT `supplierCode` 与 `TenantContext`，无法安全承载不区分租户的总管理员能力。后续平台治理需要一个独立登录、独立构建且不会回退默认租户的总控台入口。

## What Changes

- 新增 `apps/global-admin` Vue/Vite 总控台，使用专用 `GLOBAL` appCode 登录并复用前端共享包。
- 新增只读、脱敏的租户列表与详情 API，以及对应列表和 URL 可恢复详情抽屉。
- 新增 `GlobalAdminGuard`，在现有 JWT 校验后严格限制专用 appCode。
- 将 Global Admin API 与静态资源排除在 `TenantMiddleware` 外，禁止构造默认租户上下文。
- 更新 workspace 命令、静态资源输出、治理入口和前端共享包消费者文档。

## Capabilities

### New Capabilities

- `global-admin-console`: 独立总控台的登录授权、运行边界、页面框架和静态部署能力。
- `global-admin-tenant-directory`: 总管理员读取脱敏租户列表与详情的 API 和前端交互。

### Modified Capabilities

无。

## Non-goals

- 不支持租户创建、编辑、启停或动态维护集成密钥。
- 不提供跨租户 RAG 文档、会话或业务数据查询。
- 不增加角色、菜单或按钮级权限模型。

## Impact

影响 `apps/api` 的 Guard、模块注册和 middleware 路由边界；新增 `apps/global-admin` 及其静态产物；更新根脚本、lockfile、AI 治理文档和两个前端共享包的消费者说明。不涉及 Prisma schema 或现有租户接口契约。
