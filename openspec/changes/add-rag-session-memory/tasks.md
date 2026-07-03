## 1. 数据库与类型

- [x] 1.1 在 `prisma/rag/schema.sql` 增加 `aplus_rag_sessions`、`aplus_rag_messages` 表、约束和索引，消息表包含 `sender_id`、`external_message_id`、`reply_to_message_id`。
- [x] 1.2 在 `prisma/rag/schema.prisma` 增加 `AplusRagSession`、`AplusRagMessage` model 并建立 relation。
- [x] 1.3 在 `prisma/rag/migrations/` 新增幂等 SQL migration，创建长期历史表、回复归属字段和索引。
- [x] 1.4 运行 `pnpm env:dev -- pnpm pg`，确认 `@prisma/rag-client` 生成成功。
- [x] 1.5 在 `src/ai/rag/types/rag.type.ts` 增加 `RagSessionInput`、消息、问答选项相关类型，字段使用 `channel`、`conversationId`、`participantId` 等通用抽象。

## 2. Redis 短期记忆

- [x] 2.1 在 `src/common/const/redis-key.enum.ts` 新增租户化 RAG 记忆 key。
- [x] 2.2 新增 `RagMemoryService`，基于通用 `RagSessionInput` 实现会话解析。
- [x] 2.3 在 `RagMemoryService` 实现 Redis list 读取、写入、`LTRIM -20 -1` 和 `EXPIRE 172800`。
- [x] 2.4 在 `RagMemoryService` 实现长期会话 upsert 和消息历史写入。
- [x] 2.5 在 `AiModule` 注册 `RagMemoryService`，并复用现有 `RedisService`、`RagPrismaService`、`TenantContext`。

## 3. 问答链路集成

- [x] 3.1 扩展 `RagQueryDto`，增加可选 `conversationId`、`conversationType`、`participantId`、`metadata` 校验和 Swagger 描述。
- [x] 3.2 调整 `RagController`，将同步问答和 SSE 参数组装为 `RagQueryOptions`。
- [x] 3.3 调整 `RagService.answerQuestion`，加载短期记忆、注入 prompt、返回 `sessionKey`，成功后写入记忆。
- [x] 3.4 调整 `RagService.streamAnswer`，流式累计完整答案，完成后写入记忆并在事件中提供 `sessionKey`。
- [x] 3.5 更新 prompt 模板，加入“最近对话”区块并明确资料片段优先级。
- [x] 3.6 移除 RAG 代码中的临时 `console.log`，改用结构化日志或直接删除。

## 4. 渠道适配集成

- [x] 4.1 扩展 `WecomRagMessageContext`，保留 `msgId`、`chatId`、`chatType`、`userId` 作为构造通用 `RagSessionInput` 的 adapter 输入。
- [x] 4.2 调整 `WecomRagBotService` 调用 `streamAnswer` 时传入 `channel=wecom`、`conversationId`、`conversationType`、`participantId` 和 `messageId`。
- [x] 4.3 确认渠道 adapter 外的 `RagMemoryService` 不包含企业微信专用字段或分支。
- [x] 4.4 确认机器人渠道记忆写入始终发生在 `TenantContext.run({ tenantCode })` 内。
- [x] 4.5 确认空消息、非文本消息和生成失败路径不写入成功对话记忆。
- [x] 4.6 确认群聊或多参与者会话中 assistant 历史消息通过 `reply_to_message_id` 或 metadata 能追溯到被回答的用户问题。

## 5. 测试与验证

- [x] 5.1 为 `RagMemoryService` 增加单元测试，覆盖 Redis key 构造、20 条裁剪、48 小时 TTL、租户隔离和长期历史写入。
- [x] 5.2 更新 `RagService` 测试，覆盖短期记忆注入、旧调用兼容、生成失败不写 assistant 记忆。
- [x] 5.3 更新 `WecomRagBotService` 测试，覆盖多租户上下文、通用渠道会话选项映射和回复归属字段传递。
- [x] 5.4 运行 `pnpm env:test -- pnpm test -- rag`（仓库当前无 `test` script，已用等价命令 `pnpm env:test -- pnpm exec jest rag` 验证）。
- [x] 5.5 运行 `pnpm env:dev -- pnpm build:dev`。
- [x] 5.6 运行 `openspec status --change add-rag-session-memory`，确认 change apply-ready。
