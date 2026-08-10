## Context

后端 `apps/api/src/agent/knowledge` 已提供 `/agent/knowledge/documents`、`/agent/knowledge/ingest`、`/agent/knowledge/search` 和删除接口。RAG Admin 的 `/business-agent/knowledge` 路由已存在，但页面仍为占位组件。

## Goals / Non-Goals

**Goals:**

- 在 RAG Admin 提供业务知识库管理列表页。
- 通过 `src/api/` 封装全部业务 Agent 知识库接口。
- 复用现有 `AgGrid + usePageListAgGrid` 列表页模式。

**Non-Goals:**

- 不新增业务 Agent 助手问答页面。
- 不修改后端接口契约。

## Decisions

- **API 封装放在 `src/api/rag-admin.ts`**：当前文件行数仍远低于 400 行上限，沿用统一 HTTP client 和分页参数清洗函数，避免新增平行 API 封装。
- **页面复用文档管理列表模式**：使用 `AgGrid`、`usePageListAgGrid`、`TableTopActionBar` 和 `ApModal.confirm`，与 `knowledge/document-manager` 保持一致。
- **搜索项通过列配置表达**：关键词、分类、状态三列参与查询表单，文件名、片段数、大小、更新时间等仅展示。
- **保留检索 API 封装但不新增检索页面**：`searchAgentKnowledge` 先作为接口方法沉淀，后续业务 Agent 助手或演示页直接复用。

## Risks / Trade-offs

- [页面功能与 RAG 文档管理相似] → 复用同一模式降低维护成本，避免新 UI 方案。
- [检索接口暂未在页面使用] → API 方法和类型已完成接线，后续页面无需再改契约。

## Migration Plan

无需数据迁移。前端构建后 `apps/api/public/rag-admin` 更新即可。

## Open Questions

无。
