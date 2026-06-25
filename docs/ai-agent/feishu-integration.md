# 飞书集成分层

本文说明项目中飞书能力的分层方式。任何新增飞书相关功能前，都应先阅读本文。

## 总体原则

飞书集成代码集中在 `src/common/feishu`，业务模块通过 helper、table adapter、card builder 和 type 复用能力。

不要在业务 Service 中直接散写飞书 OpenAPI URL、鉴权、分页、字段映射或卡片 JSON。底层细节应封装在公共飞书层或业务 adapter/table 中。

## 目录分层

- `clients/`：飞书应用客户端。每个客户端对应一个飞书应用身份，统一通过 `ClientFactory.create(FeishuApp.Xxx)` 获取单例。
- `helper/`：飞书 OpenAPI 能力封装，如消息、表格、用户、部门、wiki、docx、file、auth、media、openapi。
- `table/`：飞书多维表格基础封装。
- `card/`：飞书卡片结构和卡片模板。
- `type/`：飞书 API、事件、卡片、wiki、docx、bitable 等类型。
- `utils.ts`：飞书相关通用工具，如异常上报等。

## ClientFactory 与 FeishuApp

`src/common/feishu/clients/index.ts` 定义：

- `FeishuApp`：飞书应用枚举，如 `AlertClient`、`XiaoAClient`、`AilyAplusClient`、`AuthClient`、`WikiClient`。
- `ClientFactory`：客户端工厂，按应用名创建并缓存客户端实例。

业务模块应通过以下形式注入对应应用能力：

```ts
FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AlertClient))
```

选择哪个 `FeishuApp` 应参考现有模块：

- 告警相关：`AlertClient`
- 小 A/机器人管理：`XiaoAClient`
- Aily/Aplus AI：`AilyAplusClient`
- Wiki/文档相关：`WikiClient` 或模块中既有配置

## FeishuHelperModule

`FeishuHelperModule.forRoot(client)` 会注册一组 helper：

- `FeishuMessageHelper`
- `FeishuTableHelper`
- `FeishuUserHelper`
- `FeishuDepartmentHelper`
- `FeishuWikiHelper`
- `FeishuAilyHelper`
- `FeishuDocxHelper`
- `FeishuFileHelper`
- `FeishuAuthHelper`
- `FeishuOpenapiHelper`
- `FeishuMediaHelper`

新增模块需要飞书能力时，优先 imports 该动态模块，再在 Service、table adapter 或 handler 中注入具体 helper。

## 飞书表格访问

表格访问通常分两层：

1. `FeishuTableHelper` 封装飞书多维表格 API 的基础请求。
2. 具体 table adapter 封装某张表的 app token、table id、字段映射和业务语义。

现有 table adapter 分布在：

- `src/common/table`
- `src/alert/common/table`
- `src/admin/mtable/table`
- `src/manage/common/table`
- `src/demo-plugin/table`

新增表格能力时：

- 表格配置优先放 `src/config/index.ts` 或租户配置中。
- 读取配置优先使用 `NodeConfigService.getFeishuTableConfig`。
- 若表格是跨模块复用，adapter 放 `src/common/table`。
- 若表格仅属于一个业务域，adapter 放对应模块内。
- 不要在 Service 中直接写 app token、table id 和字段名映射细节。

## 租户化飞书配置

飞书机器人和表格配置支持全局配置与租户配置两种来源：

- 全局机器人配置在 `globalConfig.robots`。
- 租户机器人配置在 `tenantConfig[tenant].robots`。
- 全局表格配置在 `globalConfig.feishuTables`。
- 租户表格配置在 `tenantConfig[tenant].feishuTables`。

`NodeConfigService.getRobotConfig` 和 `getFeishuTableConfig` 会兼容这两种模式。涉及服务商差异时，不要绕过这些方法直接读配置对象。

## 卡片与消息

卡片模板位于 `src/common/feishu/card`，消息发送能力由 `FeishuMessageHelper` 和相关消息服务封装。

新增卡片时：

- 优先参考现有 alert、warning、project publish、tip card。
- 卡片结构应独立成可复用 builder 或模板，不要把大段卡片 JSON 写进业务流程。
- 卡片交互回调应进入对应业务模块的 callback/event handler。

## 事件与回调

现有飞书事件/回调入口包括：

- `src/alert/event`
- `src/alert/feishu-callback`
- `src/doc/event`

新增事件处理时：

- Controller 只做飞书 challenge、请求接收和 Service 调用。
- 具体事件分发放 Service 或 handler。
- 幂等处理优先复用 `RedisService.idempotent`。
- 异常上报优先复用项目已有飞书异常通知工具。

## 新增飞书能力检查

- 是否选对飞书应用客户端。
- 是否需要租户化配置。
- 是否已有 helper 可复用。
- 是否需要新增 `type/` 类型。
- 是否需要新增 table adapter 或 card builder。
- 是否处理分页、幂等、异常上报和权限边界。
