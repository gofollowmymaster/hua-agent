## ADDED Requirements

### Requirement: 本地租户用户登录

系统 MUST 根据请求租户查找启用用户并校验密码，成功时签发与既有 Guard 兼容的 Bearer JWT。

#### Scenario: 登录成功

- **WHEN** 用户在所属租户提交有效用户名和密码
- **THEN** 系统返回含既有用户、租户和 `loginTime` claims 的 JWT

#### Scenario: 无效凭据

- **WHEN** 用户不存在、被禁用或密码错误
- **THEN** 系统返回统一的无效账号或密码错误

### Requirement: 系统管理员用户管理

系统 MUST 仅允许系统管理员在自己的租户内查询、创建、更新用户状态及重置密码。

#### Scenario: 跨租户用户不可见

- **WHEN** 系统管理员查询或修改用户
- **THEN** 操作仅作用于当前租户的用户
