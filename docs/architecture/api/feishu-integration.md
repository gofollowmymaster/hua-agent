# 飞书集成分层

本文说明项目中飞书能力的现有分层方式、配置来源、事件入口和相关基础设施。

## 当前分层

飞书集成代码集中在 `src/common/feishu`，业务模块通过 helper、table adapter、card builder 和 type 复用能力。

底层 OpenAPI、鉴权、分页、字段映射和卡片结构当前主要封装在 helper、table、adapter 或 card builder 中；开发规范见 `docs/standard/api/module-design.md`。

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

业务模块通常通过以下形式注入对应应用能力：

```ts
FeishuHelperModule.forRoot(ClientFactory.create(FeishuApp.AlertClient))
```

现有模块与 `FeishuApp` 的对应关系：

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

现有模块需要飞书能力时，通常 imports `FeishuHelperModule.forRoot(...)`，再在 Service、table adapter 或 handler 中注入具体 helper。

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

表格配置来源和 adapter 放置规范见 `docs/standard/api/configuration.md` 与 `docs/standard/api/module-design.md`。

## 租户化飞书配置

飞书机器人和表格配置支持全局配置与租户配置两种来源：

- 全局机器人配置在 `globalConfig.robots`。
- 租户机器人配置在 `tenantConfig[tenant].robots`。
- 全局表格配置在 `globalConfig.feishuTables`。
- 租户表格配置在 `tenantConfig[tenant].feishuTables`。

`NodeConfigService.getRobotConfig` 和 `getFeishuTableConfig` 会兼容这两种模式。

## 卡片与消息

卡片模板位于 `src/common/feishu/card`，消息发送能力由 `FeishuMessageHelper` 和相关消息服务封装。

现有卡片包括 alert、warning、project publish、tip card 等类型。卡片模板放置和业务分层规范见 `docs/standard/api/module-design.md`。

## 事件与回调

现有飞书事件/回调入口包括：

- `src/alert/event`
- `src/alert/feishu-callback`
- `src/doc/event`

事件处理分层、幂等、异常上报和公开 callback 的验证要求见 `docs/standard/api/module-design.md`、`docs/standard/api/redis.md` 和 `docs/ai-governance/testing-and-verification.md`。

## 相关规范入口

- 飞书 helper、table、adapter、card 的放置规则：`docs/standard/api/module-design.md`
- 飞书机器人、表格和租户化配置规则：`docs/standard/api/configuration.md`
- 幂等和 Redis key 规则：`docs/standard/api/redis.md`
- 飞书 API、事件、回调变更验证要求：`docs/ai-governance/testing-and-verification.md`
