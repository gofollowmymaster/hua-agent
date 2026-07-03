# 权限与多租户

本文说明项目中的鉴权、多租户上下文、租户配置、Redis key 和租户化飞书配置模型。涉及接口权限、服务商差异、Redis key、飞书表格访问时必须阅读。

## 核心模型

项目通过 `TenantMiddleware` 在每个请求开始阶段解析用户与租户，并通过 `TenantContext` 保存到 `AsyncLocalStorage`。

业务代码通过注入 `TenantContext` 获取：

- `tenant`：当前租户码。
- `user`：当前用户上下文。
- `userId`：当前用户 ID。
- `request`：当前 Express request。

## 租户来源

`TenantMiddleware` 按以下来源解析租户：

1. `supplier` header：直接作为服务商编码来源。
2. `Authorization: Bearer <jwt>`：decode JWT，读取用户上下文中的 `supplierCode`。
3. 非 Bearer `Authorization`：作为固定 token，通过 `ClientSecretTable` 查询服务商。
4. 未解析到租户时，使用 `NodeConfigService.get('defaultTenant')`。

`getTenantCode` 会兼容 `tenantCodeMap` 的 key 和 value，当前租户值包括：

- `aplus`
- `boat`
- `yurex`

## 域名与租户校验

非 dev 环境下，`TenantMiddleware` 会用租户配置中的 `hostTag` 校验请求 host 与 token 服务商是否匹配。

如果请求头包含 `ignore-supplier-check: true`，会跳过该域名与服务商匹配检查。

## TenantContext 使用场景

适用场景：

- 构造租户化 Redis key。
- 读取租户级飞书机器人或表格配置。
- 根据当前用户做业务判断。
- 需要当前 request 进行日志或上下文关联。

## Guard 类型

项目当前提供四类可复用 Guard。

### AuthGuard

适用于用户态 Bearer JWT 接口。

行为：

- 只接受 `Authorization: Bearer <token>`。
- 使用 `JwtService.verify` 校验 token。
- 根据 `loginTime` 和 `jwtTokenExpired` 判断登录是否过期。
- 校验通过后把 payload 写到 `request.user`。

适合场景：需要登录用户身份的业务接口，如部分 wiki、Aily session、日志操作接口。

### SecretAuthGuard

适用于固定密钥调用的系统间接口。

行为：

- 直接读取 `authorization` header 作为 token。
- 通过 `ClientSecretTable` 查询 app 信息。
- 校验密钥是否启用。
- 根据请求路径第一段校验 app 的使用范围。

适合场景：内部系统、自动化任务、飞书/工具侧以固定密钥调用的接口。

### SignAuthGuard

适用于带签名的请求体认证。

行为：

- 从 body 中读取 `signature` 和 `appId`。
- 通过 `ClientSecretTable` 查询 app secret。
- 对剩余 body 字段按 key 排序后拼接，并追加 secret 生成 MD5。
- 比对生成签名与传入签名。

适合场景：Aily 等需要请求体签名校验的接口。

### CompositeAuthOrSecretGuard

适用于同时支持用户 JWT 和固定密钥的接口。

行为：

- `authorization` 以 `Bearer ` 开头时走 `AuthGuard`。
- 否则走 `SecretAuthGuard`。

适合场景：同一个接口既允许前端用户调用，也允许内部系统调用。

## 鉴权选择

- 用户登录态接口：使用 `AuthGuard`。
- 内部系统固定密钥接口：使用 `SecretAuthGuard`。
- 第三方或 Aily 风格签名接口：使用 `SignAuthGuard`。
- 同时兼容用户和系统调用：使用 `CompositeAuthOrSecretGuard`。
- 公开 webhook/callback：必须确认来源校验、challenge 处理、幂等和异常上报策略。

没有明确理由，不要新增裸奔接口。

## 租户配置

租户配置位于 `src/config/tenant`，统一由 `src/config/tenant/index.ts` 聚合。

每个租户包含：

- `FeishuWikiSpaceIds`
- `hostTag`
- `WikiBlackListCheckoutGroupId`
- `WikiBlackListCheckoutUserId`
- `robots`
- `feishuTables`

现有读取入口：

- 全局配置使用 `NodeConfigService.get` 或 `getOrThrow`。
- 租户单项配置使用 `NodeConfigService.getTenantConfigItem`。
- 机器人配置使用 `NodeConfigService.getRobotConfig`。
- 表格配置使用 `NodeConfigService.getFeishuTableConfig`。

配置归属规则：

- 所有租户共用一个值时放全局配置。
- 不同租户可能不同的值放 `src/config/tenant` 对应租户配置。
- 敏感值优先来自环境变量，不新增硬编码 secret。

涉及服务商差异时，不要写死 `aplus` 或某个 app token，除非该能力明确只服务单一租户并已在需求中说明。

## Redis key 与租户

Redis key 枚举位于 `src/common/const/redis-key.enum.ts`。

租户化 key 应使用：

- `RedisService.buildCacheKey`
- `RedisService.buildCacheKeyWithTemplates`

这些方法会替换 key 模板中的 `{tenant}`。

`RedisService.delByPattern` 对 pattern 长度有保护，避免误删过宽范围。

新增缓存 key 时先扩展 `RedisKeys`，租户化 key 使用 `RedisService.buildCacheKey` 或 `buildCacheKeyWithTemplates`。不要在业务代码中手动拼接租户 key，避免跨租户缓存污染。

## 飞书表格与租户

固定 token 鉴权和部分飞书表格访问会依赖当前租户上下文：

- `TenantMiddleware` 可通过固定 token 查询服务商。
- `SecretAuthGuard` 使用 `ClientSecretTable` 校验 token 和模块权限。
- 飞书 table adapter 应通过配置服务获取对应租户的 app token/table id。

## 开发检查清单

- 是否正确选择 Guard。
- 是否需要读取 `TenantContext`。
- 是否考虑后台任务没有请求上下文。
- Redis key 是否租户隔离。
- 飞书配置是否通过 `NodeConfigService` 获取。
- 是否避免跨租户数据读取、缓存污染或错误发送飞书消息。
