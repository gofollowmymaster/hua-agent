## ADDED Requirements

### Requirement: 查询租户列表
系统 SHALL 向授权的总管理员返回按 A、C、D 排序的只读租户列表。

#### Scenario: 获取租户列表
- **WHEN** GLOBAL 用户请求 `GET /global-admin/tenants`
- **THEN** 系统返回 Aplus、小往和 Yurex 的 supplierCode、tenantCode、displayName 与 hostTag

### Requirement: 查询租户详情
系统 SHALL 返回指定租户的安全基础信息和集成能力配置状态。

#### Scenario: 获取已知租户详情
- **WHEN** GLOBAL 用户请求 `GET /global-admin/tenants/:tenantCode` 且 tenantCode 存在
- **THEN** 系统返回基础字段以及 wiki、auth、aily、wecomBot 布尔状态

#### Scenario: 获取未知租户详情
- **WHEN** tenantCode 不存在
- **THEN** 系统返回 404

### Requirement: 租户配置脱敏
租户目录 API MUST 通过字段白名单构造响应，不得序列化完整 tenant config 或暴露敏感标识。

#### Scenario: 返回列表或详情
- **WHEN** API 构造任意租户响应
- **THEN** 响应不包含 appId、appSecret、token、secret、Wiki/表格 ID 或机器人标识值

### Requirement: 租户列表与详情交互
Global Admin SHALL 使用表格展示租户，并使用 URL query 驱动全局详情抽屉。

#### Scenario: 点击租户行
- **WHEN** 用户点击租户表格行且未选择文本或点击其他操作控件
- **THEN** 应用写入 `drawer=tenant-detail` 和对应 `drawerCode` 并展示详情

#### Scenario: 恢复详情 URL
- **WHEN** 用户刷新或直接打开包含有效详情 query 的 URL
- **THEN** 应用重新加载并展示对应租户详情

#### Scenario: 恢复未知租户 URL
- **WHEN** drawerCode 指向未知租户
- **THEN** 抽屉展示可理解的 404 错误状态且列表保持可用

