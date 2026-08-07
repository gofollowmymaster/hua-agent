## Context

仓库已有 `BaseSchedule`（`apps/api/src/common/base/base.schedule.ts`）统一承载定时任务：cron 注册、租户上下文（`tenantContextDatas`）、异常飞书告警。7 个任务分布在 `alert`、`devops`、`doc`、`common` 模块，`jobName` 稳定唯一。Global Admin 后端聚合模块（`src/global-admin/`）已有 `GlobalAdminGuard` 与租户目录子模块，前端已有 AgGrid 列表 + 全局 `LayoutDrawer` 详情（URL query 恢复）模式。任务元数据与执行日志落库在 RAG PostgreSQL 库（`apps/api/prisma/rag/schema.prisma`，client 为 `@prisma/rag-client`），`GlobalServiceModule` 是全局模块，提供 `PrismaService`、`RagPrismaService` 等全局服务。

## Goals / Non-Goals

**Goals:**

- 启动时自动收集所有 `BaseSchedule` 任务并按 `taskKey` upsert 入库。
- 提供任务列表、详情、手动触发、执行日志分页 API，全部使用 `GlobalAdminGuard`。
- 每次执行（cron 与手动触发）记录执行时间与结果。
- 前端提供定时任务管理列表与详情抽屉。

**Non-Goals:**

- 不提供任务启停开关：`status` 由代码 `isOpen` 派生，同步时覆盖。
- 不提供编辑 cron、模块或描述的能力（代码是唯一事实来源）。
- 不删除已下线任务的入库记录。
- 不引入第二套调度方案，不改变既有任务执行语义。

## Decisions

### 元数据收集

新增 `ScheduleInfo(module, description)` 装饰器（`src/common/decorator/schedule-info.decorator.ts`），`BaseSchedule` 子类在类声明上标注模块与功能描述。`BaseSchedule` 构造函数注入 `ScheduledTaskRegistryService`，在 `onModuleInit` 中注册 `{ taskKey: jobName, module, description, cron, isOpen, instance }`，与 cron 注册解耦：`isOpen=false` 的任务同样注册并入库（status 为 disabled）。注册时机选在 `onModuleInit`，保证 `jobName`/`cron` 已初始化（`FixedTokenService` 由子类覆盖字段）。

`RagPrismaService` 从 `src/ai/rag/services/prisma/` 提升到 `src/common/service/rag-prisma/` 并由 `GlobalServiceModule` 提供，使跨模块的定时任务注册/同步与 Global Admin 管理接口都能访问 RAG 数据库客户端；`AiModule` 不再自行提供该服务。

### 启动同步入库

`ScheduledTaskSyncService.onApplicationBootstrap` 遍历注册表，按 `taskKey` upsert：新增插入，已有任务更新 `module/description/cron/status`；不删除注册表中不存在的任务，避免误删。两个服务放在 `src/common/service/schedule-task/`，由 `GlobalServiceModule` 提供并导出。

### 数据库与迁移

新增 `ScheduledTask`（表 `scheduled_tasks`）与 `ScheduledTaskLog`（表 `scheduled_task_logs`）模型到 `apps/api/prisma/rag/schema.prisma`，遵循 RAG schema 的 snake_case 映射与 `@db.Timestamptz(6)` 约定；主键使用 `BigInt`，接口序列化为字符串。同步更新 `apps/api/prisma/rag/schema.sql`（全新环境初始化）并新增增量迁移 `apps/api/prisma/rag/migrations/202608070001_add_scheduled_tasks.sql`。RAG 库迁移由运维手动执行（当前环境无数据库权限）。

### 执行日志

`ScheduledTaskRegistryService.recordRun(taskKey, { result, message, costMs })` 写入 `ScheduledTaskLog` 并刷新 `ScheduledTask.lastRunTime/lastRunResult`。`BaseSchedule.execute()`（cron 路径）与 `handleCron(force)`（既有手动触发路径）统一调用，一次租户上下文执行为一条日志；失败记录错误信息并保留原有飞书告警。记录失败不抛出，避免影响业务执行。

### 手动触发

Global Admin 触发接口调用 `entry.instance.execute()`：总控台请求无租户上下文（已排除 `TenantMiddleware`），`execute()` 基于任务自身的 `tenantContextDatas` 执行，比 `handleCron` 的 `getStore()` 更可靠；`handleCron` 保留给既有 SecretAuthGuard 触发接口，同样记录日志。

### 管理 API

`src/global-admin/schedule/` 子模块（Controller/Service/DTO），由 `GlobalAdminModule` 统一注册，路由前缀 `global-admin`，资源标识使用 `taskKey`：

- `GET /global-admin/schedules`：keyword（模块/描述模糊匹配）与 status 过滤，数据量小返回全量数组。
- `GET /global-admin/schedules/:taskKey`：任务详情。
- `POST /global-admin/schedules/:taskKey/trigger`：手动触发，返回触发结果。
- `GET /global-admin/schedules/:taskKey/logs`：分页 + result 过滤。

### 前端

- 路由 `schedules`（菜单组「平台管理」）+ 侧边菜单项。
- `src/api/schedule.ts` 承载类型与请求函数，复用 `src/api/http.ts`。
- 列表页 `src/views/schedules/index.vue`：AgGrid 展示模块、功能描述、执行周期、上次执行时间、状态，行点击/操作列进入详情；触发操作带确认。
- 详情抽屉 `src/views/schedules/sections/schedule-detail/index.vue`：任务信息 `ApDescriptions` + 分页执行日志表格 + 立即触发按钮；通过 `drawer=schedule-detail&drawerCode=<taskKey>` 恢复。

## Risks / Trade-offs

- `recordRun` 依赖数据库可用：任务先于启动同步执行时静默跳过（HTTP 服务就绪前同步已完成，实际影响极小）。
- 修改 `BaseSchedule` 影响所有任务：保持并行执行语义，仅追加日志副作用，并保留异常告警。
- `taskKey` 唯一约束：`jobName` 约定稳定唯一，冲突时 upsert 幂等覆盖。
- 日志持续增长：日志接口分页查询，暂不自动清理，后续可增加保留策略。
- 现有 `handleCron` 触发点（4 处）会开始写日志：符合「每次执行记录」预期，失败路径不吞异常。

## Migration Plan

1. 先执行 RAG 库迁移（新增 `scheduled_tasks`、`scheduled_task_logs` 两表）。
2. 发布后端收集/同步/日志与 Global Admin API。
3. 发布前端页面与路由。
4. 回滚：移除 API 注册与前端路由即可，表数据不影响既有调度；如需彻底回滚再删除两表。

## Open Questions

无。
