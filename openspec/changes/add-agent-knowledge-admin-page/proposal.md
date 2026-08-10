## Why

业务 Agent 知识库后端已提供入库、检索、分页和删除接口，但 RAG Admin 的 `/business-agent/knowledge` 仍是占位页，运营人员无法查看、触发入库或删除业务知识文档。

## What Changes

- 在 `apps/rag-admin` 新增业务 Agent 知识库 API 封装，覆盖文档分页、入库、删除和知识检索接口。
- 将 `/business-agent/knowledge` 占位页替换为真实列表管理页：搜索、分页、触发入库、强制重建索引和删除。
- 更新路由副标题，移除“模块骨架”文案。

## Capabilities

### New Capabilities

- `agent-knowledge-admin-api`: 封装 RAG Admin 对业务 Agent 知识库后端接口的请求方法。
- `agent-knowledge-admin-page`: 提供业务知识库管理列表页面。

### Modified Capabilities

无。

## Impact

- 影响 `apps/rag-admin/src/api/`、`apps/rag-admin/src/views/business-agent/knowledge/` 和 `apps/rag-admin/src/router/routes.ts`。
- 后端 `apps/api/src/agent/knowledge` 接口已存在，本次不修改后端契约。

## Non-goals

- 不新增业务 Agent 助手问答页面。
- 不修改后端接口、DTO 或数据库结构。
