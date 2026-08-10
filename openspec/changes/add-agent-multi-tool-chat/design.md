## Context

现有 RAG 已实现 AGUI 流式聊天、会话记忆和历史会话列表；业务 Agent 知识库已有混合检索、文档详情和切片分页。本次为业务 Agent 建立独立的多工具对话链路。

## Goals / Non-Goals

**Goals:**

- 提供独立的多工具 Agent Chat。
- 持久化 Agent 会话与消息。
- 在 RAG Admin demo 页面展示历史会话和流式回答。

**Non-Goals:**

- 不接外部系统。
- 不改造现有 RAG 会话表。

## Decisions

- **独立会话表**：新增 `agent_chat_sessions` / `agent_chat_messages`，与 `aplus_rag_sessions` 完全隔离。
- **LangChain 工具循环**：使用 `ChatOpenAI.bindTools` + `ToolMessage`，最多 3 轮工具调用，最后流式生成答案。
- **工具集**：知识搜索、文档详情、切片查询、当前时间、安全计算器。
- **AGUI 协议**：`POST /agent/chat` 复用 `createUIMessageStream` 和前端 `Chat`，避免第二套协议。
- **历史上下文**：从独立表加载最近 10 条消息，每次问答持久化用户、工具和助手消息。

## Risks / Trade-offs

- [工具循环可能超时] → 限制最多 3 轮，每轮工具调用同步执行。
- [计算器安全] → 使用自定义递归解析器，不使用 `eval`。
- [会话数据增长] → 会话列表分页，历史消息按会话查询。

## Migration Plan

1. 更新 `schema.prisma`、`schema.sql`，新增迁移 SQL。
2. 运行 `pnpm pg`。
3. 部署后按环境执行迁移。

## Open Questions

无。
