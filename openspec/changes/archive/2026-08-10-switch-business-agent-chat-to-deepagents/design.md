## Context

当前 `AgentChatService` 直接持有 `ChatOpenAI`，并手工实现最多 3 轮工具调用、流式回答和同步 fallback。工具定义与 `AgentChatToolService` 中的 handler 存在重复逻辑。仓库已使用 LangChain/LangGraph，`deepagents` 与其同一技术栈。

## Goals / Non-Goals

**Goals:**
- 用 `deepagents` 的 `createDeepAgent` 接管工具调用循环，保留现有 5 个业务工具。
- 将模型构建、harness profile、deepagents 流事件适配封装到 chat 模块内的 `AgentChatAgentService`。
- 保持 AGUI writer 事件、会话记忆和消息持久化行为不变。

**Non-Goals:**
- 不引入 checkpointer、thread_id、subagent、filesystem 或任务规划能力。
- 不修改公开 API、DTO、数据库模型和前端。

## Decisions

### 1. 使用 `createDeepAgent` 并隐藏内置工具

通过 `registerHarnessProfile("openai:${modelName}", createHarnessProfile(...))` 隐藏 `ls/read_file/write_file/edit_file/glob/grep/execute/task`，并设置 `generalPurposeSubagent.enabled = false`。这样模型只能看到业务工具，同时保留 deepagents 的工具循环能力。替代方案是继续手工循环或使用底层 `createAgent`，但不符合“切换到 deepAgent”的目标。

### 2. 流式协议使用 `streamMode: ["messages", "tools"]`

`AgentChatAgentService.stream()` 调用 `agent.stream({ messages }, { streamMode: ["messages", "tools"] })`，按 `[mode, data]` 元组顺序消费消息 token 和工具生命周期事件，并转换为 `AgentChatAgentEvent`。替代方案是 `streamEvents(version: "v3")` 的投影 API，但其 message/toolCalls 投影需并发消费，难以保持原有 `tool_call → generate_start` 顺序。

### 3. 保持现有 DB 记忆为单一真源

`AgentChatMemoryService` 继续负责会话解析、最近 10 条历史加载和消息写入。deepagents 每次运行 stateless，不配置 checkpointer，避免业务会话与 LangGraph 状态形成双真源。

### 4. 工具定义与执行解耦

`AgentChatToolService` 删除重复的 `handlers` 和 `execute()`，只保留 `getTools()`。deepagents 直接执行工具，工具调用记录从 `on_tool_end` 事件归一化后交给 `AgentChatMemoryService`。

## Risks / Trade-offs

- [Risk] deepagents 默认能力随版本升级变化 → harness profile 显式隐藏内置工具，并用测试固定工具集合。
- [Risk] 流式事件顺序变化影响前端状态展示 → 使用有序 `streamMode` 数组消费，并用 service 测试固定 writer 事件顺序。
- [Risk] `@langchain/core` 升级影响既有 RAG 能力 → 保持 API 依赖的 LangChain 版本约束兼容，运行 API 全量测试与构建验证。

## Migration Plan

1. 新增依赖并更新 lockfile。
2. 新增 `AgentChatAgentService` 并重构 tool/service/module 注册。
3. 更新相关单元测试。
4. 运行相关 Jest、完整 API 测试和 `pnpm build:dev`；回滚时移除新增依赖并恢复原 Service 实现，不涉及数据回滚。

## Open Questions

- 无。
