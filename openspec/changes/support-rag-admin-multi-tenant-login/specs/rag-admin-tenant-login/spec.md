## ADDED Requirements

### Requirement: 认证环境解析

RAG Admin MUST 优先使用非空 `VITE_AUTH_ENV`，未指定时使用 Vite `MODE`，并将 `production` 规范化为 `prod`；无法识别的值 MUST 回退 `dev`。

#### Scenario: 显式认证环境覆盖 Vite mode
- **WHEN** `VITE_AUTH_ENV` 为 `uat` 且 Vite `MODE` 为 `production`
- **THEN** 系统使用 `uat` 登录地址

#### Scenario: 生产 mode 规范化
- **WHEN** 未设置 `VITE_AUTH_ENV` 且 Vite `MODE` 为 `production`
- **THEN** 系统使用 `prod` 登录地址

#### Scenario: 未知环境回退
- **WHEN** 有效环境来源为无法识别的值
- **THEN** 系统使用 `dev` 登录地址

### Requirement: 按访问域名识别租户

RAG Admin MUST 使用大小写无关的完整域名后缀规则识别 A、C、D；未匹配域名 MUST 回退 C。

#### Scenario: 识别 A 租户
- **WHEN** hostname 属于 `aplnk.com`、`dev-v2.elnkpro.com`、`test-xw.elnkpro.com` 或 `uat.elnkpro.com`
- **THEN** 系统选择服务商码 A

#### Scenario: 识别 C 租户
- **WHEN** hostname 属于 `clouboat.com` 或 `test-com.elnkpro.com`
- **THEN** 系统选择服务商码 C

#### Scenario: 识别 D 租户
- **WHEN** hostname 属于 `yurexcc.com`
- **THEN** 系统选择服务商码 D

#### Scenario: 未知域名回退 C
- **WHEN** hostname 为 localhost、空字符串或不属于任何配置后缀
- **THEN** 系统选择服务商码 C

#### Scenario: 拒绝伪造后缀
- **WHEN** hostname 仅以文本方式包含配置域名但不满足点分域名边界
- **THEN** 系统不将其识别为对应租户并回退 C

### Requirement: 统一登录跳转配置

RAG Admin MUST 在 SDK 初始化自动跳转、首次登录和退出登录中使用同一个租户配置，并携带 `locale=zh_CN`、解析后的 `supplierCode` 与当前 `appCode`。

#### Scenario: A 租户生产登录
- **WHEN** 用户从 A 生产域名进入且未登录
- **THEN** 系统跳转 `https://auth.aplnk.com/admin.html#/` 并携带服务商码 A

#### Scenario: C 租户退出登录
- **WHEN** C 租户用户退出登录
- **THEN** 系统清除本地 token 并跳转 C 当前认证环境的登录中心，携带服务商码 C

#### Scenario: D 租户首次登录
- **WHEN** 用户从 D 域名首次进入
- **THEN** SDK 初始化和显式登录跳转均使用 D 当前认证环境的地址与服务商码 D
