## Why

业务知识库文档列表的 `keyword` 当前只对文件名、路径和面包屑做包含匹配，无法通过正文中的业务术语找到对应文档。知识库切片已经建立 zhparser 全文索引，但管理列表尚未使用该能力。

## What Changes

- 扩展 `GET /agent/knowledge/documents` 的 `keyword` 语义，同时匹配文档元数据和切片正文全文。
- 复用现有 `agent_chunks` zhparser GIN 索引，不新增表或索引。
- 保持租户、分类、状态、分页和响应结构不变。
- 更新管理端关键词输入提示，使可搜索范围与接口行为一致。

## Capabilities

### Modified Capabilities

- `agent-knowledge-management`: 文档分页列表的关键词筛选支持切片正文全文检索。

## Impact

- 影响业务知识库分页查询 Service、相关单元测试和 RAG Admin 搜索提示。
- 不修改 API 路径、参数名、响应结构或数据库 schema。
