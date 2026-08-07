## Context

RAG Admin 登录和后端接口以 JWT `supplierCode` 建立 `TenantContext`。`TenantMiddleware` 当前应用于所有请求，未携带服务商码时会回退默认租户；直接复用该链路会让总控台产生虚假的 aplus 上下文，并可能触发 hostTag 误报警。仓库已经具备 Vue/Vite 管理端、`@aplus-sql/ui-kit`、`@aplus-sql/http-client` 和 Nest `/public` 静态托管能力。

## Goals / Non-Goals

**Goals:**

- 建立独立登录、路由、构建和 token 存储的 Global Admin app。
- 以专用 `GLOBAL` appCode 保护无租户 API。
- 提供只读、显式脱敏的租户目录。
- 保持现有租户接口和 TenantMiddleware 行为不变。

**Non-Goals:**

- 不增加租户主数据表、动态配置或启停能力。
- 不复用 TenantContext 执行跨租户查询。
- 不提供细粒度权限和跨租户 RAG 数据。

## Decisions

### 独立 app 与源码包复用

新增 `apps/global-admin`，沿用 RAG Admin 的 Vue 3/Vite/aplus-ui 基线，但只复用工程模式和共享包。认证、store、路由、API 与详情抽屉保持 app 私有，避免两个后台共享租户语义。

### 专用 appCode Guard

`GlobalAdminGuard` 先调用现有 `AuthGuard`，再检查 `request.user.appCode` 是否等于 `GLOBAL_ADMIN_APP_CODE`（默认 `GLOBAL`）。相比修改 `AuthGuard`，组合方式不会改变已有接口；相比只在前端判断，后端 Guard 才是授权边界。

### 在 middleware 注册边界排除总控台

`AppModule.configure()` 对 `/global-admin`、其子路径及 `/public/global-admin` 静态路径排除 `TenantMiddleware`，但保留 LoggerMiddleware 和 DiscardMiddleware。Global Admin 请求不创建默认 TenantContext，也不运行 supplierCode/hostTag 校验。

不向 `tenantCodeMap` 增加 `global`，因为这会让 Redis、飞书 helper 和数据库查询把平台作用域误认为业务租户。也不使用 `ignore-supplier-check`，因为客户端 header 不能承担安全边界。

### 显式安全投影

租户目录从现有静态配置读取，但 Service 逐字段构造 DTO。列表只返回 supplierCode、tenantCode、displayName、hostTag；详情仅追加能力布尔值。任何 ID、token、secret 或表格/机器人标识都不得进入响应。

### URL 驱动详情

租户列表使用 AgGrid；详情沿用全局 LayoutDrawer，通过 `drawer=tenant-detail&drawerCode=<tenantCode>` 恢复状态。该方式满足刷新、分享和新标签打开，不引入独立详情页面。

## Risks / Trade-offs

- [登录中心未签发 GLOBAL appCode] -> API 将返回 403；部署前联调 JWT payload。
- [认证 API 地址缺失] -> 前端启动登录流程时给出明确配置错误，不回退租户地址。
- [新增 Global Admin Service 意外依赖 TenantContext] -> 模块不注入 TenantContext，并用测试断言 middleware 排除和无上下文异常路径。
- [静态配置增加敏感字段后被误暴露] -> DTO 使用字段白名单且测试递归检查敏感 key。

## Migration Plan

1. 先发布 API Guard、租户目录和 middleware 排除规则。
2. 构建 Global Admin 到 `apps/api/public/global-admin`，配置认证 API 与外部域名。
3. 使用 GLOBAL token 验证 200，并用 ADMIN token 验证 403。
4. 回滚时移除 Global Admin 静态产物和模块注册；现有租户链路无需数据回滚。

## Open Questions

无。
