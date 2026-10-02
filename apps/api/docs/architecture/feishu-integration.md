# 飞书集成边界

当前飞书能力只服务两类公共基础设施：异常告警和固定密钥表格鉴权。业务域不得恢复其他已删除的机器人、文档同步、事件回调或外部渠道入口。

## 保留实现

- `common/feishu/clients/`：`AlertClient` 与通用 `FeishuClient`。
- `common/feishu/helper/`：消息、表格和底层 data/API helper。
- `common/feishu/card/`：通用卡片与异常告警卡片。
- `common/feishu/table/`：多维表格基础访问。
- `common/table/client-secret-table.ts`：固定 token、租户和模块权限查询。
- `common/feishu/type/` 与 `utils.ts`：上述能力所需类型和异常上报工具。

`ClientFactory.create(FeishuApp.AlertClient)` 是告警客户端入口。新增飞书能力前必须确认它直接服务知识问答或业务Agent，并按 OpenSpec 评估外部集成和权限风险。

## 配置

告警应用配置位于全局或租户 `robots.AlertClient`，固定密钥表格配置位于 `feishuTables.AplusNodeAdminAppToken`。业务代码通过 `NodeConfigService` 读取配置，不硬编码 app id、secret、app token 或 table id。
