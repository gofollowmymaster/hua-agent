## Context

现有业务 Agent 通过 AGUI writer 输出 `data-status` 状态卡片和 `text` 最终答案，deepagents 消息流中的推理文本被直接当作正文；工具返回的检索结果只在状态卡中显示工具名，没有摘要。

## Goals / Non-Goals

**Goals:**

- 在流协议层面区分过程信息与最终结果。
- 最终答案开始输出后自动收起过程信息，保留可展开入口。
- 业务 Agent 所有入口（RAG Admin Demo 与 Web Component）行为一致。

**Non-Goals:**

- 不把过程信息写入 DB，历史会话仍只返回最终答案。
- 不新增 `process` 自定义流事件。

## Decisions

- **复用 AI SDK reasoning 协议**：`AgentChatAgentService` 抽取模型 `reasoning_content` / `reasoning` 内容块并产出 `reasoning_delta`；`AgentChatService` 包装为 `reasoning-start/delta/end`。
- **工具结果摘要使用 data-status**：`tool_end` 时对 `search_knowledge`、`get_document`、`get_document_chunks` 生成文档名或切片数摘要，解析失败回退通用文案。
- **前端按 part 类型分组**：`ChatDemoOptions.collapseProcessAfterAnswer` 开启后，`reasoning` + `data-status` 进入同一个 `details` 过程区块；最终 `text` part 进入 `streaming` 即收起。
- **默认只影响业务 Agent**：RAG Admin 业务 Agent Demo 与 SDK host 开启该选项，知识问答不开启。

## Risks / Trade-offs

- [模型推理文本格式差异] → 同时支持 `additional_kwargs.reasoning_content` 和 `content` 内 `reasoning` 内容块，缺失时静默跳过。
- [工具返回结构变化] → 摘要解析使用容错 JSON 解析，失败只显示工具名，不影响主流程。

## Migration Plan

1. 后端增加 reasoning 抽取和工具摘要，同步更新类型与单测。
2. UI Kit 增加可折叠过程区块与测试。
3. 业务 Agent Demo 与 SDK 开启默认折叠。
4. 运行 API、UI Kit、SDK 和 RAG Admin 验证。

## Open Questions

无。
