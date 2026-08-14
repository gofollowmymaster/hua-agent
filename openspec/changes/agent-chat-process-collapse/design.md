## Context

现有业务 Agent 通过 AGUI writer 输出 `data-status` 状态卡片和 `text` 最终答案，deepagents 消息流中的推理文本被直接当作正文；工具返回的检索结果只在状态卡中显示工具名，没有摘要。

## Goals / Non-Goals

**Goals:**

- 所有消息 part 按流式或历史返回的原始顺序展示。
- reasoning、工具过程与最终答案全部保持展开，不折叠。
- 业务 Agent 与知识问答 Demo 行为一致。
- 历史会话展示已持久化的工具状态。

**Non-Goals:**

- 不新增 DB 字段；工具过程复用已持久化的 `toolCalls`，reasoning 与阶段状态不额外持久化。
- 不新增 `process` 自定义流事件。

## Decisions

- **复用 AI SDK reasoning 协议**：`AgentChatAgentService` 抽取模型 `reasoning_content` / `reasoning` 内容块并产出 `reasoning_delta`；`AgentChatService` 包装为 `reasoning-start/delta/end`。
- **工具结果摘要使用 data-status**：`tool_end` 时对 `search_knowledge`、`get_document`、`get_document_chunks` 生成文档名或切片数摘要，解析失败回退通用文案。
- **data-status 统一渲染**：所有 stage 均通过通用状态卡展示，文案由 `formatStatus` 生成；`tool_result` 额外内联展示工具入参与输出。
- **历史会话复用 toolCalls**：RAG Admin 与 SDK 的 `toUiMessages` 把 `toolCalls` 映射为 `tool_result` 过程 part，按顺序出现在最终答案前。
- **前端直接遍历 message.parts**：不引入过程分组，不保留折叠选项，reasoning 使用始终展开的普通区块。

## Risks / Trade-offs

- [模型推理文本格式差异] → 同时支持 `additional_kwargs.reasoning_content` 和 `content` 内 `reasoning` 内容块，缺失时静默跳过。
- [工具返回结构变化] → 摘要解析使用容错 JSON 解析，失败只显示工具名，不影响主流程。

## Migration Plan

1. 后端增加 reasoning 抽取和工具摘要，同步更新类型与单测。
2. UI Kit 改为按原始顺序渲染并移除折叠组件与选项。
3. 历史会话 adapter 恢复工具过程并补充测试。
4. 更新 OpenSpec 与全部验证。

## Open Questions

无。
