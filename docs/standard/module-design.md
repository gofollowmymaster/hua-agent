# 模块设计规范

本文规定新增或修改模块时的结构规范。现有模块职责说明见 `docs/architecture/directory-structure.md`。

## 模块边界

- 一个业务域优先对应一个 NestJS module。
- 模块内部可以按功能拆 controller、service、dto、table、adapter、schedule、processor。
- 模块间协作应通过公开 Service 或明确 adapter，不要跨目录直接调用内部实现细节。
- 新增公共能力前，必须确认至少有明确的跨模块复用需求。

## 推荐目录结构

新增业务模块或较大功能时，优先采用：

```text
src/<module>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
├── dto/
│   └── *.dto.ts
├── type/
│   └── *.ts
├── table/
│   └── *.table.ts
├── adapter/
│   └── *.adapter.ts
├── common/
│   ├── schedule/
│   ├── processor/
│   └── service/
└── ...
```

小功能可以保持扁平；当出现多个 controller、service、table、adapter，或职责开始分叉时，再按上面结构拆分。

## 分层规则

- Controller：只处理 HTTP 协议层，包括路由、Guard、DTO 接收、调用 Service 和返回结果。
- DTO：承载请求入参结构和校验装饰器，配合全局 `ValidationPipe`。
- Service：承载业务编排、流程控制、权限后的业务判断、事务边界和调用其他服务。
- Table/Adapter：封装飞书表格、外部系统或第三方 API 的访问细节。
- Helper：基础能力封装，尤其是飞书 OpenAPI 级能力。
- Schedule/Processor：定时任务或后台处理逻辑，不要塞进普通 Controller。
- Type：业务内部类型，避免滥用 `any` 或把局部类型放到全局。

## Controller 与路由

- 路由前缀应与现有模块风格一致。
- 同一模块内避免出现多个互相冲突的 controller prefix。
- 新增接口优先使用 POST，除非同模块已有明确 REST 风格。
- 每个接口都要确认 Guard、DTO、错误语义和返回结构。
- 新增接口必须明确选择合适 Guard；公开回调接口必须确认签名、challenge、来源校验或其他可信机制。
- Controller 不写复杂 if/else 流程，不直接调用 Prisma、Redis、飞书 OpenAPI。
- 入参优先定义 DTO；已有 DTO 可复用时不要重新定义近似结构。

## Service 与业务编排

- Service 不应变成无限膨胀的总控类。
- 多个业务步骤可以拆成私有方法；跨场景复用再抽成独立 service。
- 外部系统适配、字段转换、飞书表格访问不直接混在核心业务流程中。
- 对需要幂等的回调或任务，优先使用 `RedisService.idempotent`。
- 需要租户、用户、request 信息时注入 `TenantContext`。
- 需要数据库时注入 `PrismaService`。
- 需要缓存、限流、幂等时注入 `RedisService`。
- 需要日志时注入 `LoggerService` 或使用项目已有 logger 方式。

## DTO 与类型

- 请求参数放 `dto/`。
- 模块内部类型放模块内 `type/` 或 `common/type/`。
- 飞书 OpenAPI 类型放 `src/common/feishu/type/`。
- 跨模块稳定类型才考虑放到 `src/type`。

## table/adapter/helper 放置规则

- 飞书基础 OpenAPI 能力：放 `src/common/feishu/helper`。
- 飞书 API 类型：放 `src/common/feishu/type`。
- 飞书卡片：放 `src/common/feishu/card`。
- 跨模块复用的飞书表格 adapter：放 `src/common/table`。
- 单模块私有表格 adapter：放该模块的 `table` 或 `common/table`。
- 非飞书外部系统 adapter：优先放业务模块内，多个模块复用时再沉淀到 `src/common` 的明确子目录。

新增外部调用时按下面顺序判断：

1. 是否已有 helper、table、adapter 可以复用。
2. 是否属于飞书能力；若是，优先扩展 `src/common/feishu`。
3. 是否是某业务模块独有；若是，放模块内 `adapter/` 或 `table/`。
4. 是否跨多个模块复用；若是，再沉淀到 `src/common` 的明确子目录。

不要在多个 Service 中复制粘贴 HTTP 调用、签名、分页、重试、字段映射等细节。

## schedule/processor 放置规则

- 定时任务放业务模块内的 `common/schedule` 或既有 schedule 目录。
- 后台处理器放业务模块内的 `common/processor` 或既有 processor 目录。
- 定时任务和处理器应只负责触发和调度，复杂业务逻辑下沉到 Service。
- 新增任务应通过对应模块 providers 注册，任务逻辑应保持可测试。
- 定时任务与队列处理器的执行、租户上下文、异常告警和队列 payload 约定见 `background-jobs.md`。

## 新文件放置决策

- 新 HTTP 接口：优先在对应业务模块下新增 controller、service、dto。
- 新飞书 API 封装：优先在 `src/common/feishu/helper` 或 `src/common/feishu/type` 扩展。
- 新飞书表格访问：优先新增或复用 table adapter，不要在 Service 里直接拼表格请求。
- 新租户配置：按 `configuration.md` 判断归属并维护类型。
- 新缓存 key：先扩展 `RedisKeys`，再通过 `RedisService.buildCacheKey*` 构造；具体规则见 `redis.md`。
- 新定时任务或队列处理器：放业务模块的 `common/schedule`、`common/processor` 或已有目录，复用 `background-jobs.md` 中的统一基类。

## 模块落地检查

- 是否放在正确业务模块。
- 是否复用了已有 DTO、table adapter、helper、异常和 Redis key。
- 是否正确处理租户上下文。
- 是否有合适 Guard。

OpenSpec 判断和验证交付要求见 `docs/ai-governance/development-workflow.md` 与 `docs/ai-governance/testing-and-verification.md`。

## 模块注册

- 新模块需要在 `AppModule` 或上级模块中注册。
- 新 provider 应在对应 module 的 `providers` 中声明。
- 跨模块复用 provider 时，明确 `exports`。
- 已经由 `GlobalServiceModule` 提供的服务不需要重复注册，除非当前模块已有既有模式且不会引发实例混乱。
