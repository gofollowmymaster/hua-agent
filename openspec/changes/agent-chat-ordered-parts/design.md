## Context

`AgentChatService` 将 Deep Agents 事件写为 AI SDK UI stream，但全部文本复用一个 id。`agent_chat_messages` 只保存最终 content 和 toolCalls，历史 adapter 因此无法恢复过程顺序。

## Decisions

- 后端写流时维护一个 timeline；每次写入可见 part 都同时追加到 timeline，数组位置即权威顺序。
- 连续同类 text/reasoning 增量复用同一 stream id；任意其他可见事件关闭活动 text/reasoning，下一段使用新 id。
- 新增可空 JSONB `parts`，只为新助手消息写入。`content` 与 `toolCalls` 继续保存，分别服务模型上下文和旧消费者。
- 历史 API 的 `parts` 为可选字段；前端存在时原样映射，缺失时保留旧的 toolCalls 后接文本回退。

## Risks

- Deep Agents 的消息和工具投影并发消费，只能保证后端队列实际接收并写入的顺序；该顺序定义为用户可见事件的排序语义。
- 旧记录没有足够信息恢复交错顺序，必须显式保留兼容展示。
