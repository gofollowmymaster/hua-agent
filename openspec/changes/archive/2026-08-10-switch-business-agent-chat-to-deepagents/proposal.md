## Why

业务 Agent Chat 目前由 `AgentChatService` 手工编排 `ChatOpenAI` 的工具调用循环，逻辑分散在服务内部，后续扩展工具或会话能力成本较高。需要切换到 LangChain Deep Agents（`deepagents`）的成熟 agent harness，并顺势收敛封装。

## What Changes

- 用 `deepagents` 的 `createDeepAgent` 替换手写工具循环，隐藏内置 filesystem/task/subagent 工具，只暴露现有 5 个业务工具。
- 在 chat 模块内新增 `AgentChatAgentService`，负责模型构建、harness profile、deepagents 实例和流事件适配。
- `AgentChatService` 收敛为 AGUI 协议、会话记忆和消息持久化编排；`AgentChatToolService` 只保留工具定义。
- 保持 HTTP、AGUI、DTO、数据库和前端契约不变。

## Capabilities

### New Capabilities
- `business-agent-chat-deepagents`: 业务 Agent Chat 使用 deepagents 运行时执行多工具对话，并保持现有流式协议与会话持久化。

### Modified Capabilities
- 无。

## Non-goals

- 不引入 LangGraph checkpointer、thread_id、人工审批或断点恢复。
- 不修改数据库 schema、会话消息模型和前端调用方式。
- 不将 deepagents 封装沉淀到 `src/common` 或 `src/ai`。

## Impact

- 影响 `apps/api/src/agent/chat/`、`apps/api/src/agent/agent.module.ts` 和相关单元测试。
- 新增 `deepagents`、`langchain` 及 deepagents peer 依赖，并提升 `@langchain/core`。
- 不改变公开 API、数据库和前端契约。
