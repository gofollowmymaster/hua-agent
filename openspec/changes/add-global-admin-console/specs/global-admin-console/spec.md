## ADDED Requirements

### Requirement: 独立总控台运行边界
系统 SHALL 提供独立的 Global Admin 前端应用、token 存储、路由、构建输出和静态访问路径，且不得复用 RAG Admin 的租户登录状态。

#### Scenario: 访问总控台静态应用
- **WHEN** 用户访问 `/public/global-admin/`
- **THEN** 系统返回 Global Admin 应用并使用独立于 RAG Admin 的静态资源 base 和 token cookie

### Requirement: 专用 appCode 授权
Global Admin API MUST 在 JWT 验签和过期校验后，仅允许 appCode 为已配置专用值的用户访问。

#### Scenario: GLOBAL 用户访问
- **WHEN** 有效 JWT 的 appCode 为 `GLOBAL`
- **THEN** Global Admin Guard 允许请求继续处理

#### Scenario: 普通后台用户访问
- **WHEN** 有效 JWT 的 appCode 不是 `GLOBAL`
- **THEN** 系统返回 403 且不执行业务 Service

#### Scenario: 无效登录访问
- **WHEN** JWT 缺失、无效或过期
- **THEN** 系统返回 401

### Requirement: Global Admin 不建立租户上下文
系统 MUST 将 Global Admin API 及其静态资源排除在 TenantMiddleware 外，不得回退默认租户或执行租户域名匹配。

#### Scenario: 调用 Global Admin API
- **WHEN** 请求路径为 `/global-admin` 或其子路径
- **THEN** TenantMiddleware 不执行且请求中不存在默认 TenantContext

#### Scenario: 访问 Global Admin 静态资源
- **WHEN** 请求路径为 `/public/global-admin` 或其子路径
- **THEN** TenantMiddleware 不执行

#### Scenario: 调用现有租户接口
- **WHEN** 请求路径不属于 Global Admin 排除范围
- **THEN** TenantMiddleware 继续按现有 supplierCode、默认租户和 hostTag 规则运行

### Requirement: 无租户异常处理
Global Admin 请求的日志、异常过滤和告警路径 MUST 在没有 TenantContext 时正常工作，不得为告警构造默认租户。

#### Scenario: Global Admin API 抛出异常
- **WHEN** Global Admin Controller 或 Service 抛出异常
- **THEN** 系统返回标准错误 envelope 并且异常处理链路不产生二次错误

