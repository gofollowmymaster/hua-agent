## Why

业务 Agent 知识库页面目前只能查看列表和删除文档，无法像 RAG 文档管理一样预览原始 Markdown 或查看切片实况；同时 RAG Admin 的 API 请求集中在 `rag-admin.ts`，不利于按菜单维护。

## What Changes

- 后端新增业务 Agent 文档详情、切片分页和 Markdown 预览接口。
- RAG Admin 前端 API 按“模块目录 + 菜单文件 + common 公共层”重组。
- 业务知识库页面接入文档预览和切片实况抽屉。

## Capabilities

### New Capabilities

- `agent-knowledge-document-detail`: 提供文档详情、切片分页和原始 Markdown 预览接口。
- `rag-admin-api-directory-layout`: 定义 RAG Admin API 按模块目录、菜单文件、common 公共层组织。
- `agent-knowledge-admin-page-actions`: 在业务知识库页面提供预览和切片实况交互。

### Modified Capabilities

无。

## Impact

- 影响 `apps/api/src/agent/knowledge` Controller/Service/DTO。
- 影响 `apps/rag-admin/src/api` 目录和全部 API 消费页面。
- 影响 `apps/rag-admin` 全局抽屉注册表和业务知识库页面。

## Non-goals

- 不新增下载接口和批量操作。
- 不修改 `agent:ingest` 入库逻辑。
- 不迁移 Global Admin API 目录。
