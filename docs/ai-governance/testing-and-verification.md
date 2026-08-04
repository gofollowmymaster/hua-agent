# 测试与验证治理

本文规定 AI 助手交付不同类型变更时的验证要求。代码风格和模块设计规范见对应子项目的 `docs/standard/`。

## 基本原则

- 验证范围应匹配变更风险和受影响子项目。
- 优先运行与变更相关的最小测试集。
- 没有相关测试时，选择构建、类型检查、静态检查或人工校验，并说明原因。
- 不要用“只改了一点”替代验证。

## 代码注释检查

涉及 AI 新增或实质修改类、类方法时，代码评审必须检查：

- 受影响的类和类方法是否按 `development-workflow.md` 添加了简洁 JSDoc。
- 注释是否准确说明职责、关键业务语义或副作用，并与当前实现一致。
- 注释是否避免复述声明和类型，以及是否同步更新了因实现变化而失效的旧注释。

## 文档变更

只修改 Markdown 文档时，不需要运行单元测试或构建，但必须做静态校验：

- 使用 `find apps packages docs -maxdepth 5 -type f -name '*.md' | sort` 查看文档结构。
- 检查新增链接路径是否真实存在。
- 检查文档中引用的关键代码路径是否真实存在。
- 确认文档职责没有重复冲突，例如 `apps/api/docs/standard` 写 API 规范，`apps/rag-admin/docs/standard` 写前端规范，`packages/shared/docs/standard` 写 shared 规范，`docs/ai-governance` 写 AI 治理。

## Workspace 变更

涉及根脚本、workspace 配置、依赖放置、部署/构建边界时检查：

- 根 `package.json`、`pnpm-workspace.yaml` 和受影响 app 的 `package.json` 是否一致。
- API 命令是否正确使用环境加载器。
- RAG Admin 命令是否使用前端脚本，不混用 API dotenv。
- 跨包引用是否符合 `AGENTS.md`。
- 根据受影响子项目追加 API、RAG Admin 或 shared 验证。

## API 代码变更

优先验证：

- 相关单元测试。
- `pnpm test` 或更小范围 API 测试命令。
- 必要时运行 `pnpm build:dev`。

若测试无法运行，需要在交付说明中写明原因，例如依赖环境变量、数据库、Redis 或外部服务不可用。

## RAG Admin 前端变更

优先验证：

- `pnpm rag-admin:build`。
- 涉及 dev server、proxy、登录跳转或运行时交互时，必要时运行 `pnpm rag-admin:dev` 并做人工或浏览器验证。

若构建无法运行，需要说明原因，例如依赖未安装、网络受限或环境变量缺失。

## Shared 包变更

修改 `packages/shared` 时检查：

- 是否符合 `packages/shared/docs/standard/package-design.md` 的导出和依赖边界。
- 是否搜索并更新所有消费者。
- API 消费者受影响时运行相关 API 验证。
- RAG Admin 消费者受影响时运行 `pnpm rag-admin:build`。

## Cross-app 变更

涉及前后端接口契约、登录 token、静态资源发布、shared 类型消费时检查：

- 后端 Controller 路由、HTTP 方法、Guard、DTO、返回结构和错误语义。
- 前端 API client、调用页面、路由、store 和错误/空状态。
- shared 导出类型是否仍匹配所有消费者。
- 至少执行受影响 API 验证和 `pnpm rag-admin:build`，无法执行时说明原因。

## 接口变更

接口新增或修改时检查：

- Controller 路由、HTTP 方法和模块 prefix 是否符合既有风格。
- Guard 是否选择正确。
- DTO 是否覆盖必要校验。
- Swagger 是否在 dev 环境可生成。
- 前端调用方是否同步更新。
- 成功、失败、未授权、参数错误路径是否有验证。

## 数据库变更

修改 `apps/api/prisma/schema.prisma` 或 `apps/api/prisma/rag/schema.prisma` 时：

- 运行 `pnpm pg` 生成 Prisma client。
- 需要迁移时，根据环境使用 `pnpm migrate:dev`、`pnpm migrate:test` 或 `pnpm migrate:prod`。
- 检查迁移是否只包含预期 schema 变化。
- 更新依赖 Prisma model 的 service 或测试。

## Redis 与租户相关变更

涉及 Redis key、缓存、限流、幂等、多租户时，先读 `apps/api/docs/standard/redis.md`，并检查：

- Redis key 是否来自 `RedisKeys`。
- 是否通过 `RedisService.buildCacheKey` 或 `buildCacheKeyWithTemplates` 构造租户 key。
- 是否避免跨租户读取或删除缓存。
- TTL 是否有明确业务语义，避免无意永久缓存。
- `RedisService.limiter` 返回值是否按“超过阈值”为 true 使用。
- `RedisService.idempotent` 的 tag 是否足够唯一，失败重试语义是否符合业务预期。
- 批量删除是否有足够具体的 pattern、长度保护和范围保护。
- 后台任务是否显式处理租户，而不是依赖请求上下文。

## 定时任务与队列处理变更

涉及定时任务、BullMQ 队列处理器、后台任务时，先读 `apps/api/docs/standard/background-jobs.md`，并检查：

- 定时任务是否继承 `BaseSchedule`，并配置稳定 `jobName`、明确 `cron` 和合适 `isOpen`。
- 定时任务是否通过 `initContext()` 或默认 `tenantContextDatas` 明确租户上下文。
- 手动触发路径是否确认 `force`、Guard、租户来源和异常处理。
- 队列处理器是否继承 `BaseProcessor`，并只实现 `handle(data)`。
- 入队 payload 是否包含 `tenantCode`，符合 `ProcessorBody`。
- `BullModule.registerQueue` 是否配置队列名、重试、退避和完成保留策略。
- 异常是否能触发基类告警，关键失败是否没有被吞掉。

## 飞书集成变更

涉及飞书 API、表格、卡片、事件、回调时检查：

- 是否选对 `FeishuApp` 客户端。
- 是否通过 `FeishuHelperModule.forRoot(...)` 注入 helper。
- 是否复用或新增了 table adapter/card builder/type。
- 是否处理 token、租户配置、分页、幂等和异常上报。
- 回调类接口是否验证来源、challenge 或签名机制。

## 安全与租户变更

涉及鉴权、租户上下文、固定 token、Redis key、租户配置、前端登录 token 时检查：

- API Guard 是否符合 `apps/api/docs/architecture/auth-and-tenant.md` 中的鉴权使用现状。
- RAG Admin token 读取、保存和请求头注入是否集中在 `src/auth` 与 `src/api`。
- 后台任务是否显式处理租户，而不是依赖请求上下文。
- Redis key 是否租户隔离，批量删除是否有范围保护。
- 租户化配置是否通过 `NodeConfigService` 读取。
- 是否避免跨租户读取数据、污染缓存或错误发送飞书消息。

## 交付说明中的验证格式

交付时建议使用简洁格式：

```text
验证：
- 已运行：pnpm rag-admin:build
- 未运行：pnpm test（原因：本次仅修改前端样式）
```

如果只做文档静态检查，也应说明检查过的命令或内容。
