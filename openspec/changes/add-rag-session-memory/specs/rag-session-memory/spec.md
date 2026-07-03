## ADDED Requirements

### Requirement: RAG 会话解析

系统 SHALL 为每次 RAG 问答解析会话上下文，并在同一租户内按渠道和会话键隔离记忆。

#### Scenario: HTTP 使用显式会话上下文

- **WHEN** 调用 `POST /ai/rag/query` 或 `GET /ai/rag/query/stream` 并提供 `conversationId` 和可选 `participantId`
- **THEN** 系统 SHALL 使用当前租户、`http` 渠道、会话 ID 和参与者 ID 解析记忆会话
- **AND** 系统 SHALL 在响应或事件元信息中返回本次使用的 `sessionKey`

#### Scenario: HTTP 未提供会话上下文

- **WHEN** 调用 RAG HTTP 问答接口但未提供 `conversationId`
- **THEN** 系统 SHALL 保持问答可用并生成请求级会话标识
- **AND** 系统 SHALL 不要求调用方改变旧有请求结构

#### Scenario: 机器人渠道按参与者和会话隔离

- **WHEN** 机器人渠道收到文本消息并映射出 `channel`、`conversationId`、`conversationType` 和 `participantId`
- **THEN** 系统 SHALL 使用当前租户、渠道、会话和参与者解析会话
- **AND** 同一参与者在不同渠道会话中的记忆 SHALL 相互隔离

### Requirement: RAG 短期记忆

系统 SHALL 使用 Redis list 保存 RAG 会话短期记忆，并按租户、渠道和会话键隔离。

#### Scenario: 写入短期记忆

- **WHEN** RAG 问答成功生成答案
- **THEN** 系统 SHALL 将用户问题和助手答案按顺序写入 Redis list
- **AND** 系统 SHALL 对该 list 执行裁剪，仅保留最新 20 条消息
- **AND** 系统 SHALL 设置过期时间为 48 小时

#### Scenario: 读取短期记忆

- **WHEN** RAG 问答开始生成 prompt
- **THEN** 系统 SHALL 从当前租户当前会话的 Redis list 读取最新短期记忆
- **AND** 系统 SHALL 将读取到的最近对话提供给 prompt 构造逻辑

#### Scenario: Redis 记忆异常

- **WHEN** Redis 短期记忆读取或写入失败
- **THEN** 系统 SHALL 记录日志并继续完成本次问答
- **AND** 系统 SHALL NOT 因短期记忆异常导致问答接口失败

### Requirement: RAG 长期历史

系统 SHALL 在 RAG PostgreSQL 中持久化会话与消息历史，用于跨进程重启保留问答记录。

#### Scenario: 创建或更新会话

- **WHEN** RAG 问答解析出当前会话
- **THEN** 系统 SHALL 在 `aplus_rag_sessions` 中按 `tenant_code`、`channel`、`session_key` 创建或复用会话
- **AND** 系统 SHALL 更新该会话的 `last_active_at`

#### Scenario: 写入消息历史

- **WHEN** RAG 问答成功生成答案
- **THEN** 系统 SHALL 在 `aplus_rag_messages` 中写入用户问题和助手答案
- **AND** 每条消息 SHALL 关联当前租户和当前会话

#### Scenario: 群聊或多参与者会话回答归属

- **WHEN** 群聊或多参与者渠道会话中用户提问并成功生成答案
- **THEN** 用户消息 SHALL 记录提问参与者 ID 和原始外部消息 ID
- **AND** 助手答案消息 SHALL 记录其回复的原始外部消息 ID
- **AND** 助手答案消息 SHALL 能通过 metadata 或结构化字段识别回答的是哪个参与者的问题

#### Scenario: 长期历史异常

- **WHEN** PostgreSQL 长期历史写入失败
- **THEN** 系统 SHALL 记录错误日志并保留本次问答结果
- **AND** 系统 SHALL NOT 因长期历史异常导致用户无法收到答案

### Requirement: RAG 记忆租户隔离

系统 SHALL 确保 RAG 短期记忆和长期历史均按租户隔离，禁止跨租户读取或写入同一会话数据。

#### Scenario: Redis key 租户隔离

- **WHEN** 系统构造 RAG 短期记忆 Redis key
- **THEN** key SHALL 来自 `RedisKeys`
- **AND** key SHALL 包含当前 `TenantContext.tenant`

#### Scenario: 数据库查询租户隔离

- **WHEN** 系统查询或写入 RAG 长期历史
- **THEN** SQL 或 Prisma 条件 SHALL 包含当前租户
- **AND** 唯一约束 SHALL 包含 `tenant_code`
