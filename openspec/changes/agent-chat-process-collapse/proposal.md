## Why

业务 Agent 流式对话把工具调用、检索摘要、模型推理文本和最终答案混在同一个展示区，最终结果出现后过程信息仍常驻，用户需要反复滚动才能看到答案。

## What Changes

- 后端将模型推理文本以 `reasoning` 增量事件输出，并在工具结束时生成检索/切片摘要。
- UI Kit 聊天组件支持把 `reasoning` 和 `data-status` 归入可折叠过程区块，最终答案开始输出后自动收起。
- RAG Admin 业务 Agent Demo 与 `agent-chat-sdk` 默认启用折叠，知识问答 Demo 保持现状。

## Capabilities

### New Capabilities

- `agent-chat-process-collapse`: 业务 Agent 区分过程信息与最终结果，并支持过程信息点击展开。

### Modified Capabilities

- `business-agent-chat-deepagents`: 流式事件新增 `reasoning-start/delta/end`，工具结束追加结果摘要状态。

## Impact

- 影响 `apps/api/src/agent/chat` 流事件适配与 `AgentChatService`。
- 影响 `packages/ui-kit` 的 `chat-demo` 共享组件和公共类型。
- 影响 RAG Admin 业务 Agent Demo 与 `packages/agent-chat-sdk`。

## Non-goals

- 不持久化过程轨迹到历史会话。
- 不新增自定义 AGUI 流事件类型。
- 不改变知识问答 Demo 的既有展示。
