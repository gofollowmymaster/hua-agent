# 业务模块结构

本文说明现有业务模块职责，以及新增功能时推荐的模块结构。

## 模块职责

- `manage`：管理类能力，包括敏感词、供应商差异、埋点元数据等。
- `robot`：飞书机器人入口，包含消息发送、卡片消息、票据获取、飞书表格记录增删改查等。
- `ai`：AI/Aily 能力，包括 token、session 绑定、日志操作记录等。
- `admin`：管理后台能力，包括缓存管理和管理表格查询。
- `doc`：文档和知识库能力，包括飞书事件、wiki 树、搜索、黑名单、反馈和文档检查处理。
- `alert`：告警领域核心模块，处理 Sentry webhook、飞书事件/回调、告警消息、告警统计、清理和用户同步。
- `fd-copilot`：前端 Copilot 文档同步能力。
- `devops`：DevOps 发布通知、云效回调、发布确认和取消执行等。
- `demo-plugin`：插件演示和 MID 相关逻辑。
- `mock-server`：历史 mock server，当前被 `DiscardMiddleware` 标记为废弃功能。

## 推荐模块结构

新增业务模块或较大功能时，优先采用以下结构：

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

小功能可以保持扁平结构；当出现多个 controller/service/table/adapter 时，再拆子目录。

## 分层规则

- Controller：只处理 HTTP 协议层，包括路由、Guard、DTO 接收、调用 Service 和返回结果。
- DTO：承载请求入参结构和校验装饰器，配合全局 `ValidationPipe`。
- Service：承载业务编排、流程控制、权限后的业务判断、事务边界和调用其他服务。
- Table/Adapter：封装飞书表格、外部系统或第三方 API 的访问细节。
- Helper：基础能力封装，尤其是飞书 OpenAPI 级能力。
- Schedule/Processor：定时任务或后台处理逻辑，不要塞进普通 Controller。
- Type：业务内部类型，避免滥用 `any` 或把局部类型放到全局。

## Controller 开发约定

- 新增接口必须明确选择合适 Guard；公开回调接口也要确认是否有签名、challenge 或来源校验。
- Controller 不写复杂 if/else 流程，不直接调用 Prisma、Redis、飞书 OpenAPI。
- 入参优先定义 DTO；已有 DTO 可复用时不要重新定义一份近似结构。
- 当前项目接口以 POST 为主；新增接口前先参考同模块现有路由风格。

## Service 开发约定

- Service 负责业务用例，不负责底层协议细节。
- 需要租户、用户、request 信息时注入 `TenantContext`。
- 需要数据库时注入 `PrismaService`。
- 需要缓存/限流/幂等时注入 `RedisService`。
- 需要日志时注入 `LoggerService` 或使用项目已有 logger 方式。
- 外部系统调用应通过 helper、adapter、table 类封装。

## 外部系统访问

新增外部调用时按下面顺序判断：

1. 是否已有 helper/table/adapter 可以复用。
2. 是否属于飞书能力；若是，优先扩展 `src/common/feishu`。
3. 是否是某业务模块独有；若是，放模块内 `adapter/` 或 `table/`。
4. 是否跨多个模块复用；若是，再沉淀到 `src/common` 的明确子目录。

不要在多个 Service 中复制粘贴 HTTP 调用、签名、分页、重试、字段映射等细节。

## 定时任务与后台处理

项目已在 `AppModule` 中启用 `ScheduleModule.forRoot()`。现有定时/后台处理分布在：

- `src/alert/common/schedule`
- `src/devops/ali/common/schedule`
- `src/doc/common/schedule`
- `src/doc/common/processor`
- `src/fd-copilot/common/processor`

新增任务时应放在对应业务模块内部，并通过模块 providers 注册。任务逻辑应保持可测试，复杂处理下沉到 Service。

## 新功能落地检查

- 是否需要 OpenSpec change。
- 是否放在正确业务模块。
- 是否复用了已有 DTO、table adapter、helper、异常和 Redis key。
- 是否正确处理租户上下文。
- 是否有合适 Guard。
- 是否新增或更新测试；若不适合测试，需要在交付说明中说明原因。
