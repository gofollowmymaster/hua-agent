# Redis key 与缓存使用规范

本文规定新增和使用 Redis key、缓存、限流、幂等、批量扫描删除时必须遵守的规则。Redis 与租户隔离的架构背景见 `docs/architecture/auth-and-tenant.md`。

## 基础入口

Redis key 统一定义在 `src/common/const/redis-key.enum.ts`：

- `RedisPrefix`：项目 Redis key 的基础前缀，当前为 `frontend-node:`。
- `RedisKeys`：业务 key 模板枚举。
- 带 `{tenant}` 的 key 是租户隔离 key。
- 带 `{spaceId}`、`{apiName}`、`{module}`、`{code}` 等占位符的 key 必须通过统一方法替换。

Redis 操作统一优先通过 `src/common/service/redis/redis.service.ts`：

- `buildCacheKey`
- `buildCacheKeyWithTemplates`
- `limiter`
- `idempotent`
- `hasByPattern`
- `getByPattern`
- `delByPattern`
- `getClient`

业务代码不要自行创建 Redis client。

## Key 定义规则

新增业务 Redis key 时，先扩展 `RedisKeys`，再在业务代码中引用枚举值。

Key 命名必须满足：

- 使用 `frontend-node:` 项目前缀，不新增平行项目前缀。
- 按业务域划分命名空间，例如 `wiki`、`feishu-api`、`alert`、`devops`。
- 动态部分使用 `{name}` 占位符，不用字符串拼接散落在业务代码里。
- 需要租户隔离的 key 必须包含 `{tenant}`。
- 确认为全局共享的 key 才可以不带 `{tenant}`，并在调用处能说明不会跨租户污染。

不要把租户码、飞书 app token、table id、用户 token 等动态信息硬编码进 key 模板。

## Key 构造规则

租户化 key 必须优先使用 `RedisService` 构造。构造方法会从 `TenantContext.tenant` 替换 `{tenant}`。

只有一个额外占位符时，使用 `buildCacheKey`：

```ts
const key = this.redisService.buildCacheKey(
  RedisKeys.WIKI_DIRECTORY,
  '{spaceId}',
  spaceId,
);
```

多个占位符时，使用 `buildCacheKeyWithTemplates`。`templateMap` 的 key 不带花括号：

```ts
const key = this.redisService.buildCacheKeyWithTemplates(
  RedisKeys.FEISHU_FIXED_ACCESS_TOKEN,
  {
    module: 'aily',
    code,
  },
);
```

不要在业务代码中手动拼接租户 key。没有 `{tenant}` 的全局 key 如确需使用 `replace`，也应只替换当前枚举模板中的业务占位符，不要临时发明 key 字符串。

## 租户上下文

`buildCacheKey` 和 `buildCacheKeyWithTemplates` 依赖 `TenantContext.tenant`。

在 HTTP 请求中，租户通常由 `TenantMiddleware` 写入上下文。后台任务、定时任务、队列 processor、脚本和 webhook 处理不能默认假设存在正确请求上下文：

- 需要租户隔离时，应显式传入租户或先建立租户上下文。
- 遍历多租户任务时，每个租户分别构造 key。
- 不要依赖默认租户掩盖缺失上下文问题。

涉及权限、租户来源和默认租户规则时，先读 `docs/architecture/auth-and-tenant.md`。

## TTL 与值类型

缓存必须明确 TTL 语义：

- 短期 API 缓存、飞书接口缓存、会话 code 等应使用 `setex` 或设置 `expire`。
- hash、set、zset、list 等值类型通过 `getClient()` 操作时，也要评估是否需要过期时间。
- 长期不失效 key 必须是有意设计，例如业务状态、人工清理缓存或全局计数；不要因为忘记设置 TTL 形成永久缓存。

读取复杂 Redis 类型时，可以通过 `RedisService.getByPattern(pattern, type)` 指定 `RedisValueType`。新增读取方式前，先确认 `RedisService` 是否已有封装；只有底层服务不支持时才使用 `getClient()`。

## 限流

需要固定窗口限流时，优先使用 `RedisService.limiter(key, limit, ttl)`。

注意当前返回值语义：

- `false`：未超过阈值。
- `true`：已超过阈值，应阻断或降级处理。

调用方不要把返回值误解为“是否允许通过”。`key` 应包含足够业务上下文，例如模块、接口、租户或用户标识，避免不同场景互相影响。

## 幂等

回调、事件、重复请求、消息处理等需要一段时间内只处理一次的场景，优先使用 `RedisService.idempotent(tag, handle, expireTime)`。

当前实现语义：

- 首次执行会写入 `handling`。
- 执行成功后写入 `handled`。
- 已处于 `handling` 或 `handled` 的 tag 会直接跳过。
- 执行失败会写入 `failed`，并通过飞书异常上报；后续同一 tag 可以再次尝试。
- 默认过期时间是 24 小时。

`tag` 必须能唯一表达业务事件，建议包含来源系统、事件类型、租户、业务 id。不要使用过宽 tag 导致不同事件互相吞掉。

## Pattern 扫描与批量删除

`hasByPattern`、`getByPattern`、`delByPattern` 基于 Redis `SCAN`。

使用 pattern 时必须足够具体：

- 优先包含 `frontend-node:` 前缀。
- 租户化数据优先包含具体租户。
- 包含业务域前缀，例如 `wiki`、`mtable`、`feishu-api`。
- 通配符只放在必要的末尾或明确动态段。

`delByPattern` 对 pattern 长度有保护，当前长度小于 20 会抛错。这个保护只能拦截明显过宽的删除，不代表 pattern 一定安全。新增批量删除入口时，应先用 `hasByPattern` 或 `getByPattern` 确认范围，并避免从外部参数直接拼接宽泛 pattern。

## 变更检查清单

- 是否先扩展 `RedisKeys`，而不是在业务代码中散写 key。
- 租户数据是否包含 `{tenant}`，并通过 `buildCacheKey` 或 `buildCacheKeyWithTemplates` 构造。
- 后台任务是否显式处理租户上下文。
- TTL 是否有明确业务语义。
- `limiter` 返回值是否按“超过阈值”为 true 使用。
- `idempotent` 的 tag 是否足够唯一，失败重试语义是否符合业务预期。
- `delByPattern` 的 pattern 是否足够具体，是否避免跨租户或跨业务域删除。
- 是否按 `docs/ai-governance/testing-and-verification.md` 完成 Redis、租户和缓存相关验证。
