## ADDED Requirements

### Requirement: 独立会话表
系统 SHALL 使用 `agent_chat_sessions` / `agent_chat_messages` 持久化 Agent 会话和消息，与 RAG 会话隔离。

#### Scenario: 新建会话
- **WHEN** 首次发送消息
- **THEN** 按租户、渠道和会话 key 幂等创建会话

### Requirement: 持久化消息
系统 SHALL 持久化用户消息、工具调用记录和助手消息。

#### Scenario: 一轮对话完成
- **WHEN** 一轮问答结束
- **THEN** 会话消息可被查询
