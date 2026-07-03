## Context

当前 RAG 模块已支持多租户知识库：HTTP 请求依赖 `TenantMiddleware` 写入 `TenantContext.tenant`，机器人入口在处理消息前通过 `TenantContext.run({ tenantCode })` 建立租户上下文。RAG 配置已集中到 `NodeConfigService`，`vcHelper` 承载 chunk、topK 等业务参数，Redis key 规范要求统一在 `RedisKeys` 中定义并通过 `RedisService` 构造。

现有问答链路是无状态的：`RagService` 只用当前问题检索 `aplus_chunks`，再将资料片段注入 prompt。该模式无法处理“它呢”“继续说”等连续追问，也不会保留用户历史。

## Goals / Non-Goals

**Goals:**

- 为 RAG 同步问答、SSE 问答和机器人入口增加统一的多渠道会话上下文。
- 短期记忆使用 Redis list 队列，按租户和会话隔离，保留最新 20 条消息并设置 48 小时 TTL。
- 长期记忆使用 RAG PostgreSQL 持久化会话与消息，支持跨进程重启保留历史。
- 保持旧接口兼容：HTTP 调用不传会话上下文字段时仍能问答，但不会形成稳定跨请求记忆。

**Non-Goals:**

- 不做自动事实抽取、用户画像、偏好总结或 embedding 记忆检索。
- 不新增会话管理 API。
- 不改变现有知识库入库、租户过滤和 pgvector 检索规则。

## Decisions

### 1. 新增 `RagMemoryService` 作为唯一记忆编排入口

`RagMemoryService` 放在 `src/ai/rag/services/` 并注册到 `AiModule`。它负责会话解析、Redis 短期记忆读取与写入、PostgreSQL 长期历史落库。`RagService` 只编排问答流程，不直接拼 Redis key 或直接写历史表。

备选方案是把记忆逻辑直接放入 `RagService`，但会让问答、Redis、持久化职责耦合，不符合当前模块分层规范。

### 2. Redis 短期记忆使用租户化、渠道化 list key

新增 `RedisKeys.RAG_SESSION_MEMORY = frontend-node:{tenant}:rag:memory:{channel}:{sessionKey}`。构造 key 时使用 `RedisService.buildCacheKeyWithTemplates`，其中 `channel` 是通用渠道标识，如 `http`、`wecom`、`feishu`、`web`，`sessionKey` 使用安全编码后的会话标识。

写入流程：

1. 每条消息序列化为 JSON，字段包含 `role`、`content`、`createdAt`、`metadata`。
2. 本轮生成成功后按顺序 `RPUSH` user 与 assistant 消息。
3. 执行 `LTRIM key -20 -1` 保留最新 20 条。
4. 执行 `EXPIRE key 172800` 设置 48 小时过期。

读取流程使用 `LRANGE key 0 -1`，解析失败的单条消息跳过并记录 warn，不阻断问答。

### 3. PostgreSQL 长期历史使用两张 RAG 专用表

数据库源文件同步维护 `prisma/rag/schema.sql`、`prisma/rag/schema.prisma` 和新增 migration。

`aplus_rag_sessions`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `BIGSERIAL PRIMARY KEY` | 会话主键 |
| `tenant_code` | `TEXT NOT NULL` | 租户码 |
| `channel` | `TEXT NOT NULL` | 渠道标识，如 `http`、`wecom`、`feishu`、`web` |
| `session_key` | `TEXT NOT NULL` | 会话唯一键 |
| `user_id` | `TEXT` | 用户 ID，可为空 |
| `conversation_id` | `TEXT` | 渠道会话、群聊、单聊或房间 ID，可为空 |
| `conversation_type` | `TEXT` | 渠道会话类型，如 `single`、`group`，可为空 |
| `metadata` | `JSONB NOT NULL DEFAULT '{}'::jsonb` | 扩展信息 |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP` | 创建时间 |
| `updated_at` | `TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP` | 更新时间 |
| `last_active_at` | `TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP` | 最近活跃时间 |

约束和索引：

- `UNIQUE (tenant_code, channel, session_key)`
- `idx_aplus_rag_sessions_tenant_channel`
- `idx_aplus_rag_sessions_last_active`

`aplus_rag_messages`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `BIGSERIAL PRIMARY KEY` | 消息主键 |
| `tenant_code` | `TEXT NOT NULL` | 租户码 |
| `session_id` | `BIGINT NOT NULL REFERENCES aplus_rag_sessions(id) ON DELETE CASCADE` | 会话 ID |
| `role` | `TEXT NOT NULL` | `user` 或 `assistant` |
| `content` | `TEXT NOT NULL` | 消息内容 |
| `sender_id` | `TEXT` | 消息发送人；用户消息为提问人 ID，助手消息为 bot 标识 |
| `external_message_id` | `TEXT` | 外部消息 ID，如企业微信 `msgid` |
| `reply_to_message_id` | `TEXT` | 助手消息回复的外部用户消息 ID |
| `metadata` | `JSONB NOT NULL DEFAULT '{}'::jsonb` | 扩展信息 |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP` | 创建时间 |

约束和索引：

- `idx_aplus_rag_messages_tenant_session_created`
- `idx_aplus_rag_messages_external_message`
- 可选检查约束 `role IN ('user', 'assistant')`

Prisma model 命名为 `AplusRagSession`、`AplusRagMessage`，字段使用 camelCase 并通过 `@map` 对齐 SQL 字段。

### 4. 多渠道会话抽象

核心服务只识别通用 `RagSessionInput`，不写渠道特定分支：

| 字段 | 说明 |
| --- | --- |
| `channel` | 渠道标识，如 `http`、`wecom`、`feishu`、`web` |
| `conversationId` | 渠道会话、群聊、单聊、房间或页面会话 ID |
| `conversationType` | 会话类型，如 `single`、`group` |
| `participantId` | 提问用户或参与者 ID |
| `messageId` | 当前用户问题的外部消息 ID |
| `replyToMessageId` | 当前消息回复的外部消息 ID，可为空 |
| `metadata` | 渠道扩展信息 |

`sessionKey` 由通用规则生成：

1. 如果 `conversationId` 和 `participantId` 存在，使用 `${conversationType || 'conversation'}:${conversationId}:${participantId}`。
2. 如果只有 `conversationId`，使用 `${conversationType || 'conversation'}:${conversationId}`，适用于明确共享上下文的会话。
3. 如果缺少 `conversationId`，生成请求级匿名会话键；该键只用于本次请求，不作为稳定业务会话承诺。

HTTP adapter：

- `RagQueryDto` 新增可选 `conversationId`、`conversationType`、`participantId`、`metadata`。
- SSE query 新增可选 `conversationId`、`conversationType`、`participantId`。
- 将 HTTP 入参映射成 `channel = 'http'` 和通用会话上下文字段。
- 未传 `conversationId` 时生成请求级匿名会话键；旧调用保持可用，但不会形成稳定跨请求连续上下文。

机器人 adapter：

- 渠道适配层负责把平台字段映射为通用 `RagSessionInput`。
- 以现有企业微信入口为例：`channel = 'wecom'`，`conversationId = chatId`，`conversationType = chatType`，`participantId = userId`，`messageId = msgId`。
- 用户消息写入长期历史时，`sender_id = participantId`，`external_message_id = messageId`。
- 助手消息写入长期历史时，`reply_to_message_id = messageId`，metadata 记录 `answeredParticipantId`、`conversationId`、`conversationType`、`channel`，用于明确群聊中“回答的是谁的问题”。
- 在 `TenantContext.run({ tenantCode })` 内调用 `RagService.streamAnswer` 并传入记忆选项。

### 5. Prompt 注入策略

`RagService` 在检索前读取短期记忆，在构造 prompt 时增加“最近对话”区块。该区块仅用于理解连续追问、代词和用户上下文；回答事实仍必须以“资料片段”为准。无短期记忆时填入“无最近对话。”。

生成成功后才调用 `appendTurn`。同步问答写入完整 answer；流式问答累积 answerContent 后写入。模型调用失败或无有效回答时不写 assistant 消息，避免污染上下文。

### 6. 配置与常量

短期记忆最大长度 20、TTL 172800 秒是本次需求固定值，可先作为 `RagMemoryService` 内部常量；如果后续需要环境化，再按 `docs/standard/configuration.md` 放入 `vcHelper` 并同步类型。不要在业务代码散读 `process.env`。

### 7. 现有代码清理

实现过程中移除 RAG 服务中残留的临时 `console.log`，必要诊断改用 `LoggerService`，日志字段包含 `tenantCode`、`sessionKey`、`channel`，不输出完整用户问题或回答正文。

## Risks / Trade-offs

- [Redis 写入成功但 PostgreSQL 写入失败] → 问答不应失败；记录 error 日志，短期记忆仍可支撑近期上下文。
- [PostgreSQL 成功但 Redis 失败] → 问答不应失败；记录 warn/error，当前轮仍返回答案，后续短期上下文可能缺失。
- [匿名 HTTP 会话无法跨请求连续] → 调用方需要传入稳定 `conversationId`；系统不强行绑定 IP 或用户，避免错误串话。
- [Redis list 中消息过多或内容过长] → 固定裁剪 20 条；实现时可限制单条写入内容长度，超长时截断并在 metadata 标记。
- [多租户串读] → Redis key、SQL 唯一约束和查询条件都包含 `tenant_code`；机器人渠道必须保持在 `TenantContext.run` 内解析和写入记忆。

## Migration Plan

1. 新增 RAG PostgreSQL migration，创建 `aplus_rag_sessions`、`aplus_rag_messages` 及索引。
2. 同步更新 `prisma/rag/schema.sql` 和 `prisma/rag/schema.prisma`。
3. 运行 `pnpm env:dev -- pnpm pg` 生成 Prisma client。
4. 发布代码后，先通过 HTTP 带 `conversationId`、`participantId` 的问答验证 Redis 和历史表写入，再验证现有机器人渠道的多租户路径。
5. 回滚时可先回滚应用代码；新增表不影响旧逻辑，可保留。若需清理，单独执行向后兼容的数据清理脚本。

## Open Questions

- 是否需要对长期历史设置保留周期或归档策略；本次先不清理。
- 是否需要后续增加会话历史查询和清空接口；本次不做。
