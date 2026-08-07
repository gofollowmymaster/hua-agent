## Why

仓库现有 7 个基于 `BaseSchedule` 的定时任务（告警统计、Wiki 目录、DevOps 流水线、飞书 Token 等），元数据散落在代码中，缺少统一视图与运维入口。需要在 Global Admin 总控台提供任务列表、手动触发、详情与执行日志能力，并让新增定时任务在启动时自动入库，避免人工维护任务清单。

## What Changes

- 新增 RAG（PostgreSQL）Prisma 模型 `ScheduledTask`、`ScheduledTaskLog`，持久化任务元数据与执行日志。
- 新增 `ScheduleInfo` 装饰器与任务注册/同步服务：应用启动时自动收集继承 `BaseSchedule` 的定时任务并按 `taskKey` upsert 入库，新增任务自动插入。
- 改造 `BaseSchedule`：cron 执行与手动触发统一记录执行时间、执行结果（成功/失败）与耗时，并刷新任务上次执行信息。
- 新增 Global Admin `schedule` 子模块 API：任务列表（模块、功能描述、执行周期、上次执行时间）、任务详情、手动触发、执行日志分页查询，统一使用 `GlobalAdminGuard`。
- 新增 Global Admin 前端「定时任务管理」页面：AgGrid 列表、LayoutDrawer 详情（任务信息 + 执行日志 + 立即触发）。
- 为现有 7 个定时任务补充模块与功能描述元数据。

## Capabilities

### New Capabilities

- `global-admin-schedule-management`: 定时任务自动收集入库、执行日志记录，以及 Global Admin 上的任务列表/详情/手动触发/日志查询能力。

### Modified Capabilities

无。

## Impact

- `apps/api`：RAG Prisma schema 与迁移、`src/common/decorator/` 与 `src/common/service/schedule-task/`、`RagPrismaService` 全局化、`BaseSchedule`、`src/global-admin/schedule/` 新子模块，以及现有 7 个 schedule 类。
- `apps/global-admin`：新增路由、菜单、API 契约、列表页与详情抽屉。
- 不改变既有业务接口契约与租户边界，不引入新的外部依赖；执行日志写入不影响既有任务行为。
