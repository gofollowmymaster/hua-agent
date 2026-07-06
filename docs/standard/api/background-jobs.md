# 定时任务与队列处理规范

本文规定新增或修改定时任务、BullMQ 队列处理器、后台处理逻辑时必须遵守的规则。后台任务的架构事实见 `docs/architecture/api/project-architecture.md`，租户上下文模型见 `docs/architecture/api/auth-and-tenant.md`。

## 基础入口

项目已有两个全局统一基类：

- 定时任务基类：`src/common/base/base.schedule.ts`
- 队列处理基类：`src/common/base/base.processor.ts`

新增定时任务优先继承 `BaseSchedule`。新增 BullMQ 队列处理器优先继承 `BaseProcessor`。

不要在业务模块中绕过这两个基类新建平行的 cron 注册、worker host、租户上下文或异常告警机制。

## BaseSchedule 约定

`BaseSchedule` 负责：

- 在 `onModuleInit` 阶段注册 cron。
- 通过 `SchedulerRegistry` 避免重复注册同名任务。
- 按 `tenantContextDatas` 遍历租户上下文。
- 通过 `TenantContext.run(...)` 建立任务执行上下文。
- 捕获 `handle` 抛出的异常并发送飞书定时任务报警。
- 提供 `handleCron(force)` 给外部主动触发。

子类必须明确以下字段或方法：

- `cron`：cron 表达式。为空时基类会抛出“定时任务没有配置执行周期”。
- `jobName`：任务唯一名称。名称重复时基类会跳过重复注册。
- `isOpen`：任务开关。需要按环境启停时在子类中覆盖。
- `handle(context, force)`：任务业务逻辑入口。
- `initContext()`：需要自定义租户、空间、业务参数时覆盖。

## 定时任务实现规则

定时任务放在业务模块内的 `common/schedule` 或既有 schedule 目录，并在对应 module 的 `providers` 中注册。

新增定时任务时：

- 继承 `BaseSchedule`。
- 注入 `TenantContext` 和 `SchedulerRegistry`，并传给 `super(tenantContext, schedulerRegistry)`。
- 复杂业务逻辑下沉到 Service，schedule 只负责触发、遍历和调度。
- `jobName` 必须稳定且能表达业务含义。
- `cron` 必须有明确来源。来自环境变量时，按 `configuration.md` 维护配置。
- 生产专用任务应通过 `isOpen` 明确控制，不在 `handle` 内隐式返回来替代任务开关。

示例结构：

```ts
@Injectable()
export default class ExampleSchedule extends BaseSchedule {
  protected readonly isOpen = ['prod', 'production'].includes(process.env.NODE_ENV);
  protected readonly cron = process.env.EXAMPLE_CRON || '0 0 16 * * *';
  protected readonly jobName = 'Example Job';

  constructor(
    protected readonly tenantContext: TenantContext,
    protected schedulerRegistry: SchedulerRegistry,
  ) {
    super(tenantContext, schedulerRegistry);
  }

  protected async handle(context: TenantContextType, force: boolean) {
    // 调用业务 Service
  }
}
```

## 定时任务租户上下文

`BaseSchedule` 默认从 `globalConfig.tenantConfig` 构造 `tenantContextDatas`，逐个租户执行。

当任务只服务单租户、默认租户，或需要携带额外上下文时，必须覆盖 `initContext()`：

- 单租户或默认租户任务：显式写入目标 `tenantCode`。
- 多租户任务：为每个租户写入 `tenantCode`，必要时附加业务参数。
- 依赖飞书空间、表格、机器人等租户配置时，在 `initContext()` 中准备上下文或在 `handle()` 中通过 `NodeConfigService` 读取。

不要让后台任务依赖请求态上下文。定时任务没有 HTTP 请求上下文，必须由基类或子类显式建立 `TenantContext`。

## 手动触发

`BaseSchedule.handleCron(force)` 供外部主动触发。

调用手动触发时：

- 只有 `force=true` 才会执行。
- 当前实现会使用 `tenantContext.getStore()` 作为上下文，并把 `force` 传给 `handle`。
- 暴露给 Controller 或 callback 时，需要确认 Guard、租户来源、幂等和验证要求。

## BaseProcessor 约定

`BaseProcessor` 负责：

- 继承 `WorkerHost`。
- 统一实现 `process(job)`。
- 从 `job.data.tenantCode` 建立 `TenantContext`。
- 调用子类 `handle(data)` 执行业务逻辑。
- 捕获异常并发送飞书队列任务报警。
- 记录 `active`、`completed`、`failed` worker 事件。

子类只实现 `handle(data)`，不要重复实现 `process(job)`。如果必须改写 `process(job)`，应同步评估并更新本文档和基类能力。

## 队列处理器实现规则

新增队列处理器时：

- 使用 `@Processor(queueName)` 标记队列名。
- 继承 `BaseProcessor`。
- 注入 `TenantContext` 并传给 `super(tenantContext)`。
- 只在 `handle(data)` 中写业务逻辑。
- 队列处理器放在业务模块内的 `common/processor` 或既有 processor 目录。
- 在对应 module 的 `providers` 中注册 processor。

示例结构：

```ts
@Processor('example-queue')
export class ExampleProcessor extends BaseProcessor {
  constructor(protected readonly tenantContext: TenantContext) {
    super(tenantContext);
  }

  async handle(data: ProcessorBody): Promise<any> {
    // 调用业务 Service
  }
}
```

## 队列注册与入队

队列模块使用 BullMQ：

- module 中通过 `BullModule.forRoot(...)` 配置 Redis 连接。
- module 中通过 `BullModule.registerQueue({ name })` 注册队列。
- 入队方通过 `@InjectQueue(name)` 注入 `Queue`。
- 入队时调用 `queue.add(jobName, payload)`。

`queueName`、`jobName` 和 processor 命名要稳定一致，便于日志、告警和排查。

入队 payload 必须包含 `tenantCode`，并符合 `src/type/global.ts` 中的 `ProcessorBody`：

```ts
await this.exampleQueue.add('exampleJob', {
  tenantCode: this.tenantContext.tenant,
  // other fields
});
```

没有 `tenantCode` 时，`BaseProcessor` 无法正确建立租户上下文，可能导致跨租户配置、Redis key 或飞书消息错误。

## 异常、重试与告警

基类已经提供统一异常告警：

- `BaseSchedule` 发送“定时任务报警”。
- `BaseProcessor` 发送“队列任务报警”。

业务内部可以捕获局部异常并补充上下文，但不要吞掉关键失败。需要让 BullMQ 重试的错误必须继续抛出。

队列重试、退避、完成后保留数量等由 `BullModule.registerQueue` 的 `defaultJobOptions` 配置。新增队列时应明确 attempts、backoff、removeOnComplete 等策略。

## 变更检查清单

- 定时任务是否继承 `BaseSchedule`。
- 队列处理器是否继承 `BaseProcessor`。
- 是否注册到对应 module 的 `providers`。
- 定时任务是否有稳定 `jobName`、明确 `cron` 和合适 `isOpen`。
- 定时任务是否显式处理租户上下文或覆盖 `initContext()`。
- 队列 payload 是否包含 `tenantCode`。
- 队列名、任务名、processor 是否一致且便于排查。
- 是否避免重复实现 `process(job)`、cron 注册、worker 事件日志和飞书告警。
- 是否按 `docs/ai-governance/testing-and-verification.md` 完成后台任务验证。
