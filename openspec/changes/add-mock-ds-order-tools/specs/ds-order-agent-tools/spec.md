## ADDED Requirements

### Requirement: Agent 可调用 DS 订单工具
Business Agent SHALL 提供订单列表、详情、日志、审核和取消 5 个工具，并复用 Mock API 的业务 Service。

#### Scenario: 查询订单上下文
- **WHEN** 用户询问一件代发订单列表、详情或操作历史
- **THEN** Agent 调用对应只读工具并返回当前租户的紧凑 JSON 结果

#### Scenario: 明确要求写操作
- **WHEN** 用户明确要求审核或取消指定订单并提供必要参数
- **THEN** Agent 调用对应写工具并返回变更后的订单状态

#### Scenario: 未明确要求写操作
- **WHEN** 用户仅询问订单信息或状态
- **THEN** Agent 不调用审核或取消工具
