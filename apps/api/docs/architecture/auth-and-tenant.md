# 权限与多租户

本文说明项目中的鉴权、多租户上下文、租户配置、Redis key 和租户化飞书配置模型，可作为理解接口权限、服务商差异、Redis key、飞书表格访问的架构上下文。

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

## 鉴权使用现状

- 用户登录态接口通常使用 `AuthGuard`。
- 内部系统固定密钥接口通常使用 `SecretAuthGuard`。
- 第三方或 Aily 风格签名接口通常使用 `SignAuthGuard`。
- 同时兼容用户和系统调用的接口通常使用 `CompositeAuthOrSecretGuard`。
- 公开 webhook/callback 会结合来源校验、challenge 处理、幂等和异常上报策略。

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

配置归属、读取方式、类型维护和敏感信息处理规范见 `apps/api/docs/standard/configuration.md`。

## Redis key 与租户

Redis key 枚举位于 `src/common/const/redis-key.enum.ts`。

租户化 key 构造入口包括：

- `RedisService.buildCacheKey`
- `RedisService.buildCacheKeyWithTemplates`

这些方法会替换 key 模板中的 `{tenant}`。

`RedisService.delByPattern` 对 pattern 长度有保护，避免误删过宽范围。

Redis key、缓存、限流、幂等和批量删除的开发规范见 `apps/api/docs/standard/redis.md`。

## 飞书表格与租户

固定 token 鉴权和部分飞书表格访问会依赖当前租户上下文：

- `TenantMiddleware` 可通过固定 token 查询服务商。
- `SecretAuthGuard` 使用 `ClientSecretTable` 校验 token 和模块权限。
- 飞书 table adapter 通过配置服务读取对应租户的 app token/table id。

## 相关规范入口

- 配置新增与读取规范：`apps/api/docs/standard/configuration.md`
- Redis key、缓存、限流、幂等和批量删除规范：`apps/api/docs/standard/redis.md`
- 模块分层、后台任务和 provider 注册规范：`apps/api/docs/standard/module-design.md`
- 鉴权、租户、Redis、飞书变更的验证要求：`docs/ai-governance/testing-and-verification.md`
