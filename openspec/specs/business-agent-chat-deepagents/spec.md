# business-agent-chat-deepagents Specification

## Purpose
业务 Agent Chat 使用 deepagents 运行时执行多工具对话，并保持 AGUI 流式协议与现有 DB 会话持久化。
## Requirements
### Requirement: Deep Agents 运行时执行业务工具对话

业务 Agent Chat 的模型调用与工具循环 SHALL 由 `deepagents` 的 `createDeepAgent` 运行时执行，而不是由 `AgentChatService` 手工编排。

#### Scenario: 多工具调用
- **WHEN** 用户问题需要调用知识库工具和计算工具
- **THEN** deepagents 依次执行工具并将最终答案流式返回

#### Scenario: 工具集合限制
- **WHEN** 业务 Agent 被创建
- **THEN** 模型只看到 `search_knowledge`、`get_document`、`get_document_chunks`、`get_current_time`、`calculate`，看不到内置 filesystem/task/subagent 工具

### Requirement: 保持 AGUI 流式协议与消息持久化

业务 Agent Chat SHALL 保持现有 AGUI writer 事件结构，并继续通过 `AgentChatMemoryService` 加载历史和持久化用户/助手消息。

#### Scenario: 流式状态顺序
- **WHEN** 一次对话包含工具调用和最终回答
- **THEN** writer 依次收到 `analyze_start`、`tool_call`、`generate_start`、文本增量、`text-end` 和 `done`

#### Scenario: 空答案兜底
- **WHEN** deepagents 未产生任何文本内容
- **THEN** 系统返回现有兜底文案并正常结束文本流

### Requirement: 会话记忆保持 stateless

deepagents 运行 SHALL 不配置 checkpointer 或 thread_id，会话历史继续以 RAG DB 中的 `AgentChatSession` 和 `AgentChatMessage` 为单一真源。

#### Scenario: 连续对话
- **WHEN** 用户在同一会话继续提问
- **THEN** 系统从 DB 加载最近 10 条历史后交给 deepagents 执行
