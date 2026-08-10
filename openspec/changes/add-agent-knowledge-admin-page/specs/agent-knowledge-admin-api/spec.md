## ADDED Requirements

### Requirement: 封装文档分页查询
API 层 SHALL 提供查询业务 Agent 知识库文档分页列表的方法，支持 `keyword`、`category`、`status` 和分页参数。

#### Scenario: 查询当前租户文档
- **WHEN** 调用分页查询方法并传入分类 `yurex`
- **THEN** 请求发送到 `/agent/knowledge/documents` 并返回分页结果

### Requirement: 封装入库和删除方法
API 层 SHALL 提供触发入库和删除文档的方法，入库请求支持 `force` 参数。

#### Scenario: 强制重建索引
- **WHEN** 调用入库方法且 `force=true`
- **THEN** 请求发送到 `/agent/knowledge/ingest` 并携带 `{ force: true }`

#### Scenario: 删除文档
- **WHEN** 调用删除方法并传入文档 ID
- **THEN** 请求发送到对应的文档删除地址

### Requirement: 封装知识检索方法
API 层 SHALL 提供知识检索方法，支持查询文本、模式、分类和 `topK` 参数。

#### Scenario: 混合检索
- **WHEN** 调用检索方法并传入 `mode=hybrid`
- **THEN** 请求发送到 `/agent/knowledge/search` 并返回命中片段
