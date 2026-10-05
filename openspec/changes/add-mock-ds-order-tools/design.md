## Context

原 WMS DS 目录包含 10 个 POST 接口，其中列表、详情、日志、审核和取消为 JSON 业务接口，其余为文件导入导出。本次只迁移 5 个 JSON 接口。Business Agent 已有工具聚合 Service、每轮五次调用限制和仅记录元数据摘要的工具日志中间件。

## Decisions

- 在 `agent/ds-order` 建立独立子模块目录，由 Controller、Mock Service 和 Tool Service 分别承担 HTTP、状态与工具职责。
- HTTP 和工具直接复用同一个 Mock Service，避免进程内回环 HTTP 请求。
- 每个租户首次访问时从固定虚构 fixtures 克隆独立状态；状态只在当前进程存活期间保留。
- Controller 使用 `CompositeAuthOrSecretGuard`，租户从 `TenantContext` 获取，请求参数不能越过当前租户。
- 列表默认按 `createdAt` 倒序，支持源接口的主要筛选和受控字段排序。
- 取消将 `PROCESSING` 或 `IN_DISTRIBUTION` 订单推进到 `CANCEL_PENDING_AUDIT`；审核取消申请通过后进入 `CANCELLED`，驳回后恢复取消前状态。
- `AgentChatToolService` 只聚合 DS Tool Service 返回的工具；Agent 系统提示词要求仅在用户明确提出时执行审核和取消。
- 保留当前停用的 `get_document_chunks`，修正其过期测试但不重新启用。

## Risks / Trade-offs

- 内存状态不支持多实例共享或重启保留，这是 Mock 环境的明确限制。
- Agent 写工具可能改变后续查询结果，通过严格状态校验和系统提示词降低误调用风险。
- 工具返回完整 Mock 详情但 fixtures 不包含真实人员、地址或订单信息。
