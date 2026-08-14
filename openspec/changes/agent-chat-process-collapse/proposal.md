## Why

业务 Agent 流式对话把工具调用、检索摘要、模型推理文本和最终答案按阶段输出，但分组与折叠会打乱消息顺序，用户需要额外点击才能查看过程内容。

## What Changes

- 后端将模型推理文本以 `reasoning` 增量事件输出，并在工具结束时生成检索/切片摘要。
- UI Kit 聊天组件按 `message.parts` 原始顺序渲染 `reasoning`、`data-status` 和 `text`，不分组、不折叠。
- `data-status` 全量 stage 统一通过状态卡渲染，`tool_result` 额外内联保留工具入参与输出，reasoning 始终展开展示。
- RAG Admin 业务 Agent Demo 与 `agent-chat-sdk`、知识问答 Demo 共用同一展示规则。

## Capabilities

### New Capabilities

- `agent-chat-process-order`: 聊天消息按原始顺序完整展示，不折叠任何输出。

### Modified Capabilities

- `business-agent-chat-deepagents`: 流式事件新增 `reasoning-start/delta/end`，工具结束追加结果摘要状态。

## Impact

- 影响 `apps/api/src/agent/chat` 流事件适配与 `AgentChatService`。
- 影响 `packages/ui-kit` 的 `chat-demo` 共享组件和公共类型。
- 影响 RAG Admin 业务 Agent Demo 与 `packages/agent-chat-sdk`。

## Non-goals

- 不额外持久化 reasoning 文本或阶段状态，工具过程复用已保存的 `toolCalls`。
- 不新增自定义 AGUI 流事件类型。
- 不新增 `details` 折叠交互。
