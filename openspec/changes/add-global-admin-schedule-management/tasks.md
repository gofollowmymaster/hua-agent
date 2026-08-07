## 1. 数据库与后端基础设施

- [x] 1.1 新增 `ScheduledTask`、`ScheduledTaskLog` Prisma 模型并生成 client，创建迁移
- [x] 1.2 新增 `ScheduleInfo` 装饰器、`ScheduledTaskRegistryService`、`ScheduledTaskSyncService`，注册到 `GlobalServiceModule`
- [x] 1.3 改造 `BaseSchedule` 支持注册与执行日志，为现有 7 个任务补充元数据并注入 registry

## 2. Global Admin 后端 API

- [x] 2.1 新增 `src/global-admin/schedule/` 子模块（Controller/Service/DTO）与单元测试
- [x] 2.2 注册到 `GlobalAdminModule` 并校验 Guard 与路由前缀

## 3. Global Admin 前端

- [x] 3.1 新增 `src/api/schedule.ts` 契约（列表/详情/触发/日志）
- [x] 3.2 新增列表页 `src/views/schedules/index.vue`、路由与菜单项
- [x] 3.3 新增详情抽屉 `src/views/schedules/sections/schedule-detail/index.vue`（信息 + 日志 + 触发）并接入 LayoutDrawer 组件映射

## 4. 验证

- [x] 4.1 运行 API 相关 Jest 测试与 `pnpm build:dev`
- [x] 4.2 运行 Global Admin test、build、lint、format check、stylelint check
