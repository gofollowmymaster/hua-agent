## MODIFIED Requirements

### Requirement: 知识库文档工具
Business Agent 的 `get_document` 工具 SHALL 返回当前租户文档的元数据和 `agent_documents.content` 中保存的完整原始 Markdown，且不得截断内容。

#### Scenario: 获取完整文档
- **WHEN** Agent 使用文档 ID 调用 `get_document`
- **THEN** 工具返回文档元数据和完整 `content`，包括超过 1200 字符的后半部分

#### Scenario: 跨租户文档不可读取
- **WHEN** Agent 使用其他租户的文档 ID 调用 `get_document`
- **THEN** 工具沿用文档不存在错误，且不返回任何内容

#### Scenario: 管理接口保持轻量
- **WHEN** 后台调用文档列表或详情接口
- **THEN** 响应不包含 `content`，数据库查询不加载完整文本
