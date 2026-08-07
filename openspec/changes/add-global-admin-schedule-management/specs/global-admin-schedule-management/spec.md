## ADDED Requirements

### Requirement: 定时任务自动收集入库
系统 SHALL 在应用启动时自动收集所有继承 `BaseSchedule` 的定时任务，并按 `taskKey`（即 `jobName`）将任务元数据 upsert 到数据库；新增任务自动插入，已有任务更新模块、功能描述、执行周期与状态。

#### Scenario: 启动时同步任务注册表
- **WHEN** 应用完成启动
- **THEN** 每个已注册任务在 `ScheduledTask` 表中存在且元数据与代码一致
- **AND** 新加入代码的任务被自动插入

### Requirement: 任务列表查询
系统 SHALL 提供定时任务列表接口，支持按关键字（模块/功能描述）与状态过滤，并返回模块、功能描述、执行周期、上次执行时间、状态等字段。

#### Scenario: 查询任务列表
- **WHEN** 总管理员调用 `GET /global-admin/schedules` 且携带可选过滤条件
- **THEN** 返回匹配任务及其列表字段

#### Scenario: 未授权访问
- **WHEN** 请求 JWT 的 appCode 不是已配置的 Global Admin 专用值
- **THEN** 返回 403 且不执行业务逻辑

### Requirement: 任务详情
系统 SHALL 提供单个任务详情接口，返回任务元数据、状态与上次执行信息。

#### Scenario: 查询任务详情
- **WHEN** 总管理员调用 `GET /global-admin/schedules/:taskKey`
- **THEN** 返回该任务详情

#### Scenario: 任务不存在
- **WHEN** `taskKey` 在数据库不存在
- **THEN** 返回 404

### Requirement: 手动触发
系统 SHALL 支持对指定定时任务手动触发执行，并记录本次执行日志。

#### Scenario: 手动触发任务
- **WHEN** 总管理员调用 `POST /global-admin/schedules/:taskKey/trigger`
- **THEN** 任务按自身租户上下文执行
- **AND** 生成对应的执行日志并刷新上次执行时间

#### Scenario: 触发不存在的任务
- **WHEN** `taskKey` 在数据库不存在
- **THEN** 返回 404 且不触发任何执行

### Requirement: 执行日志记录与查询
系统 SHALL 为每次执行记录执行时间与执行结果（成功/失败），并提供按任务分页查询的日志接口。

#### Scenario: 记录执行结果
- **WHEN** 任意定时任务执行完成（cron 或手动触发）
- **THEN** 生成一条执行日志，包含执行时间、结果与失败原因（如有）

#### Scenario: 分页查询执行日志
- **WHEN** 总管理员调用 `GET /global-admin/schedules/:taskKey/logs` 且携带分页参数
- **THEN** 返回分页日志列表与总数
