## Why

业务 Agent 目前只能检索知识库，无法查询或模拟操作一件代发订单。原 WMS 前端中的 DS 订单接口依赖外部 OMS，不能在本项目内独立演示工具调用和订单状态流转。

## What Changes

- 在 API 内新增按租户隔离的一件代发订单内存 Mock 能力。
- 复刻订单列表、详情、日志、审核和取消 5 个 JSON 接口，保留原 `/oms/admin/dsOrder/*` 地址。
- 将 5 个能力注册为 Business Agent 工具，并补充工具使用提示。
- 审核和取消更新当前进程内的 Mock 状态并追加操作日志。

## Capabilities

### New Capabilities

- `mock-ds-order-api`: 提供租户隔离的一件代发订单查询和状态流转 Mock API。
- `ds-order-agent-tools`: 将订单列表、详情、日志、审核和取消暴露为 Agent 工具。

## Impact

- 影响 `apps/api/src/agent/` 下的模块注册、工具聚合和 Agent 系统提示词。
- 不访问外部 OMS/WMS，不新增数据库、环境变量或依赖。
- 不实现导入、导出接口，不修改 RAG Admin 和原 WMS 项目。
