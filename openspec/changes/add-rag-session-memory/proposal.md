## Why

现有 RAG 问答每次只基于当前问题检索知识库，无法理解连续追问、指代和用户会话上下文。近期 RAG 已完善多租户能力，适合在租户隔离基础上补齐用户会话级短期记忆与长期历史。

## What Changes

- 新增 RAG 会话记忆能力：短期记忆使用 Redis list，保留最新 20 条消息，TTL 48 小时。
- 新增长期历史能力：在 RAG PostgreSQL 中持久化会话与消息，支持跨重启保留用户问答历史。
- HTTP 同步问答、SSE 流式问答和现有机器人入口均通过统一渠道抽象支持会话上下文。
- Prompt 增加最近对话区块，用于理解追问；知识库事实仍以检索片段为准。
- 不引入破坏性变更；未传会话字段的旧调用保持兼容。

## Capabilities

### New Capabilities

- `rag-session-memory`: RAG 用户会话、短期 Redis 记忆、长期历史持久化、会话上下文注入。

### Modified Capabilities

- `rag-knowledge-qa`: 问答接口与流式问答在兼容旧调用的基础上支持会话记忆。

## Non-goals

- 不做自动用户画像、事实抽取或偏好总结。
- 不新增会话列表、历史查询、清空会话等管理 API。
- 不改变现有文档入库、pgvector 检索和多租户知识库隔离规则。

## Impact

- 影响 `src/ai/rag`、`src/common/const/redis-key.enum.ts`、`src/ai/ai.module.ts`。
- 影响 `prisma/rag/schema.prisma`、`prisma/rag/schema.sql`、`prisma/rag/migrations/` 与 `@prisma/rag-client`。
- 需要补充 RAG、Redis、多租户和现有机器人渠道 adapter 相关单元测试。
