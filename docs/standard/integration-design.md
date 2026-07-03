# 集成设计规范

本文规定飞书和外部系统集成的开发规范。现有飞书集成分层和入口说明见 `docs/architecture/feishu-integration.md`。

## 基本原则

- 数据库、Redis、飞书、外部 HTTP API 不应在 Controller 中直接访问。
- 不要在业务 Service 中直接散写飞书 OpenAPI URL、鉴权、分页、字段映射或卡片 JSON。
- 底层细节应封装在 helper、table、adapter 或 card builder 中。
- 新增外部系统能力前，先搜索现有 helper、table、adapter、service 和 type。

## 飞书能力接入

- 新增模块需要飞书能力时，优先 imports `FeishuHelperModule.forRoot(...)`，再在 Service、table adapter 或 handler 中注入具体 helper。
- 选择 `FeishuApp` 时先参考 `docs/architecture/feishu-integration.md` 中现有模块对应关系。
- 新增飞书 API 类型放 `src/common/feishu/type/`。
- 新增飞书基础 OpenAPI 能力放 `src/common/feishu/helper/`。

## 飞书表格

- 表格配置优先放 `src/config/index.ts` 或租户配置中。
- 读取配置优先使用 `NodeConfigService.getFeishuTableConfig`。
- 跨模块复用的表格 adapter 放 `src/common/table`。
- 单业务域私有表格 adapter 放对应模块内。
- 不要在 Service 中直接写 app token、table id 和字段名映射细节。

## 卡片与消息

- 新增卡片优先参考现有 alert、warning、project publish、tip card。
- 卡片结构应独立成可复用 builder 或模板。
- 不要把大段卡片 JSON 写进业务流程。
- 卡片交互回调应进入对应业务模块的 callback/event handler。

## 事件与回调

- Controller 只做 challenge、请求接收、来源校验和 Service 调用。
- 具体事件分发放 Service 或 handler。
- 幂等处理优先复用 `RedisService.idempotent`。
- 异常上报优先复用项目已有飞书异常通知工具。
- 公开 webhook/callback 必须确认签名、challenge、来源校验、幂等和异常上报策略。

## 新增集成检查

- 是否选对飞书应用客户端。
- 是否需要租户化配置。
- 是否已有 helper、table、adapter、type 可以复用。
- 是否需要新增 table adapter 或 card builder。
- 是否处理分页、幂等、异常上报和权限边界。
- 是否避免在多个 Service 中复制签名、分页、字段映射、重试逻辑。
