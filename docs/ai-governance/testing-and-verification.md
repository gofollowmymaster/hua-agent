# 测试与验证治理

本文规定 AI 助手交付不同类型变更时的验证要求。代码风格和模块设计规范见 `docs/standard/README.md`。

## 基本原则

- 验证范围应匹配变更风险。
- 优先运行与变更相关的最小测试集。
- 没有相关测试时，选择构建、类型检查、静态检查或人工校验，并说明原因。
- 不要用“只改了一点”替代验证。

## 文档变更

只修改 Markdown 文档时，不需要运行单元测试或构建，但必须做静态校验：

- 使用 `find docs -maxdepth 3 -type f | sort` 查看文档结构。
- 检查新增链接路径是否真实存在。
- 检查文档中引用的关键代码路径是否真实存在。
- 确认文档职责没有重复冲突，例如 `docs/standard` 写开发规范，`docs/ai-governance` 写 AI 治理，`docs/architecture` 写项目架构说明。

## 普通代码变更

优先验证：

- 相关单元测试。
- `pnpm env:test -- pnpm test` 或更小范围测试命令。
- 必要时运行 `pnpm env:dev -- pnpm build:dev`。

若测试无法运行，需要在交付说明中写明原因，例如依赖环境变量、数据库、Redis 或外部服务不可用。

## 接口变更

接口新增或修改时检查：

- Controller 路由、HTTP 方法和模块 prefix 是否符合既有风格。
- Guard 是否选择正确。
- DTO 是否覆盖必要校验。
- Swagger 是否在 dev 环境可生成。
- 成功、失败、未授权、参数错误路径是否有验证。

## 数据库变更

修改 `prisma/schema.prisma` 时：

- 运行 `pnpm pg` 生成 Prisma client。
- 需要迁移时，根据环境使用 `pnpm migrate:dev`、`pnpm migrate:test` 或 `pnpm migrate:prod`。
- 检查迁移是否只包含预期 schema 变化。
- 更新依赖 Prisma model 的 service 或测试。

## Redis 与租户相关变更

涉及 Redis key、缓存、限流、幂等、多租户时，先读 `docs/standard/redis.md`，并检查：

- Redis key 是否来自 `RedisKeys`。
- 是否通过 `RedisService.buildCacheKey` 或 `buildCacheKeyWithTemplates` 构造租户 key。
- 是否避免跨租户读取或删除缓存。
- TTL 是否有明确业务语义，避免无意永久缓存。
- `RedisService.limiter` 返回值是否按“超过阈值”为 true 使用。
- `RedisService.idempotent` 的 tag 是否足够唯一，失败重试语义是否符合业务预期。
- 批量删除是否有足够具体的 pattern、长度保护和范围保护。
- 后台任务是否显式处理租户，而不是依赖请求上下文。

## 飞书集成变更

涉及飞书 API、表格、卡片、事件、回调时检查：

- 是否选对 `FeishuApp` 客户端。
- 是否通过 `FeishuHelperModule.forRoot(...)` 注入 helper。
- 是否复用或新增了 table adapter/card builder/type。
- 是否处理 token、租户配置、分页、幂等和异常上报。
- 回调类接口是否验证来源、challenge 或签名机制。

## 安全与租户变更

涉及鉴权、租户上下文、固定 token、Redis key、租户配置时检查：

- Guard 是否符合 `docs/architecture/auth-and-tenant.md` 中的鉴权使用现状。
- 后台任务是否显式处理租户，而不是依赖请求上下文。
- Redis key 是否租户隔离，批量删除是否有范围保护。
- 租户化配置是否通过 `NodeConfigService` 读取。
- 是否避免跨租户读取数据、污染缓存或错误发送飞书消息。

## 交付说明中的验证格式

交付时建议使用简洁格式：

```text
验证：
- 已运行：pnpm env:test -- pnpm test
- 未运行：pnpm env:dev -- pnpm build:dev（原因：本次仅修改文档）
```

如果只做文档静态检查，也应说明检查过的命令或内容。

完整交付说明要求见 `development-workflow.md`。
