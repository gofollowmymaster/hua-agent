# 模块设计规范

本文规定新增或修改模块时的结构规范。现有模块职责说明见 `docs/ai-agent/business-modules.md`。

## 模块边界

- 一个业务域优先对应一个 NestJS module。
- 模块内部可以按功能拆 controller、service、dto、table、adapter、schedule、processor。
- 模块间协作应通过公开 Service 或明确 adapter，不要跨目录直接调用内部实现细节。
- 新增公共能力前，必须确认至少有明确的跨模块复用需求。

## 推荐目录结构

较完整的业务模块可采用：

```text
src/<module>/
├── <module>.module.ts
├── <feature>/<feature>.controller.ts
├── <feature>/<feature>.service.ts
├── <feature>/dto/*.dto.ts
├── common/table/*.table.ts
├── common/adapter/*.adapter.ts
├── common/service/*.service.ts
├── common/schedule/*
├── common/processor/*
└── common/type/*.ts
```

小模块可以保持扁平，但当文件数量增长或职责分叉时，应按上面结构逐步拆分。

## Controller 与路由

- 路由前缀应与现有模块风格一致。
- 同一模块内避免出现多个互相冲突的 controller prefix。
- 新增接口优先使用 POST，除非同模块已有明确 REST 风格。
- 每个接口都要确认 Guard、DTO、错误语义和返回结构。

## Service 与业务编排

- Service 不应变成无限膨胀的总控类。
- 多个业务步骤可以拆成私有方法；跨场景复用再抽成独立 service。
- 外部系统适配、字段转换、飞书表格访问不直接混在核心业务流程中。
- 对需要幂等的回调或任务，优先使用 `RedisService.idempotent`。

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

## schedule/processor 放置规则

- 定时任务放业务模块内的 `common/schedule` 或既有 schedule 目录。
- 后台处理器放业务模块内的 `common/processor` 或既有 processor 目录。
- 定时任务和处理器应只负责触发和调度，复杂业务逻辑下沉到 Service。
- 后台任务不能假设存在请求态 `TenantContext`；需要租户时显式传入或遍历租户。

## 模块注册

- 新模块需要在 `AppModule` 或上级模块中注册。
- 新 provider 应在对应 module 的 `providers` 中声明。
- 跨模块复用 provider 时，明确 `exports`。
- 已经由 `GlobalServiceModule` 提供的服务不需要重复注册，除非当前模块已有既有模式且不会引发实例混乱。
