## MODIFIED Requirements

### Requirement: RAG 问答

系统 SHALL 提供同步问答接口，根据用户问题生成 query embedding，从当前租户的 pgvector 知识库检索相关片段，结合可用会话短期记忆生成回答，并仅基于检索资料回答业务事实。

#### Scenario: 同步问答成功

- **WHEN** 调用 `POST /ai/rag/query` 并提供 `question`
- **THEN** 系统 SHALL 返回 `answer`、`sources`、`chunks` 和本次使用的 `sessionKey`
- **AND** `topK` SHALL 限制在 1 到 20 之间，未传时使用默认值
- **AND** 检索 SHALL 只命中当前租户的知识库片段

#### Scenario: 带会话上下文的连续问答

- **WHEN** 调用 `POST /ai/rag/query` 并提供稳定的 `conversationId` 和 `participantId`
- **THEN** 系统 SHALL 在 prompt 中注入该会话的 Redis 短期记忆
- **AND** 系统 SHALL 在答案生成成功后追加本轮用户问题和助手答案到会话记忆

#### Scenario: 问题为空

- **WHEN** 调用问答接口但 `question` 为空
- **THEN** 系统 SHALL 返回参数错误

### Requirement: RAG 流式问答

系统 SHALL 提供 SSE 流式问答接口，在检索当前租户相关片段后，结合可用会话短期记忆，以文本 chunk 形式输出模型回答。

#### Scenario: 流式输出成功

- **WHEN** 调用 `GET /ai/rag/query/stream?question=...`
- **THEN** 系统 SHALL 返回 SSE 事件流
- **AND** 每个 `answer` 事件的 `data` SHALL 是模型生成的文本片段
- **AND** 系统 SHALL 在事件流中提供本次使用的 `sessionKey`

#### Scenario: 流式问答写入记忆

- **WHEN** 流式问答成功完成并生成非空答案
- **THEN** 系统 SHALL 将本轮用户问题和完整助手答案写入短期记忆和长期历史

#### Scenario: 流式问答失败

- **WHEN** 流式问答检索或生成过程中失败
- **THEN** 系统 SHALL 返回 error 事件或渠道 adapter 的降级提示
- **AND** 系统 SHALL NOT 写入助手答案记忆
