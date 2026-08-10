## Why

业务 Agent 目前只有知识库管理，没有可交互的对话能力。需要提供基于业务知识库的多工具 Agent，并在 RAG Admin demo 页面演示带历史会话的流式聊天。

## What Changes

- 后端新增 `apps/api/src/agent/chat` 多工具 Agent Chat。
- 新增独立 `agent_chat_sessions` / `agent_chat_messages` 表。
- RAG Admin `/business-agent/demo` 改为带历史会话列表的聊天 Demo。

## Capabilities

### New Capabilities

- `agent-chat-api`: 提供 AGUI 流式聊天、会话分页和消息查询接口。
- `agent-chat-tools`: 提供知识搜索、文档详情、切片查询、当前时间和安全计算工具。
- `agent-chat-session-store`: 独立持久化 Agent 会话与消息。
- `agent-demo-page`: RAG Admin 业务 Agent 聊天演示页面。

### Modified Capabilities

无。

## Impact

- 影响 `apps/api/prisma/rag`、`apps/api/src/agent`、`apps/api/src/agent/knowledge` 复用边界。
- 影响 `apps/rag-admin/src/api/business-agent` 和 `/business-agent/demo`。
- 新增 RAG PostgreSQL 表，需要执行迁移和 `pnpm pg`。

## Non-goals

- 不接入外部系统工具。
- 不复用 RAG 会话表。
- 不新增第二套聊天协议。
