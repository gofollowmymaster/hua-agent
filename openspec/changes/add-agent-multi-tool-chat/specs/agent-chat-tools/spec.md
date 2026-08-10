## ADDED Requirements

### Requirement: 知识库工具
Agent SHALL 能调用知识搜索、文档详情和切片查询工具，并基于当前租户数据执行。

#### Scenario: 搜索知识
- **WHEN** Agent 调用 `search_knowledge`
- **THEN** 返回当前租户命中的知识片段

### Requirement: 通用工具
Agent SHALL 能调用当前时间和安全计算工具。

#### Scenario: 当前时间
- **WHEN** Agent 调用 `get_current_time`
- **THEN** 返回 Asia/Shanghai 当前时间

#### Scenario: 安全计算
- **WHEN** Agent 调用 `calculate`
- **THEN** 返回正确计算结果或拒绝非法表达式
