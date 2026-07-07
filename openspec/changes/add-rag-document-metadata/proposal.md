## Why

RAG 文档目前只有文件路径、类型扩展名和索引状态，缺少可运营维护的业务分类和标签。管理端需要能查看并编辑文档 `type` 与 `tag`，让后续文档筛选、治理和人工标注有稳定数据来源。

## What Changes

- 为 `aplus_documents` 增加 `type` 和 `tag` 字段，默认均为空字符串。
- 文档入库时从 `raw/<tenant>/<type>/file` 的 `<type>` 推导默认 `type`。
- 重新入库已有文档时保留人工编辑过的 `type` 和 `tag`。
- RAG Admin 文档列表展示 `type`、`tag`，并支持编辑保存。
- 新增管理端文档元数据更新 API。

## Capabilities

### New Capabilities

- `rag-document-metadata`: 管理 RAG 文档的业务分类 `type` 与标签 `tag`。

### Modified Capabilities

- 无。

## Non-goals

- 不调整 RAG 检索排序、切片生成或 embedding 内容。
- 不新增按 `type` 或 `tag` 筛选的搜索能力。

## Impact

- 影响 RAG PostgreSQL schema、RAG ingest 服务、RAG Admin API、RAG Admin 文档管理页和相关单元测试。
