## MODIFIED Requirements

### Requirement: 按租户分页查看文档
管理接口 SHALL 返回当前租户的文档分页列表，支持 `keyword`、`category`、`status` 筛选；`keyword` SHALL 匹配文件名、路径、面包屑或 `agent_documents.content` 原文全文。

#### Scenario: 文档原文命中
- **WHEN** 当前租户使用关键词查询，关键词未出现在文档元数据但命中文档原文
- **THEN** 分页结果包含该文档，且正文匹配不查询 `agent_chunks`

#### Scenario: 组合筛选保持租户隔离
- **WHEN** 同时传入关键词、分类和状态
- **THEN** 只返回当前租户内同时满足分类、状态及元数据或原文关键词条件的文档

#### Scenario: 无有效全文词元
- **WHEN** 关键词无法产生 zhparser 有效词元但能命中文档元数据
- **THEN** 分页结果仍包含元数据命中的文档

#### Scenario: Agent 搜索保持切片语义
- **WHEN** Business Agent 调用 `search_knowledge`
- **THEN** fulltext 和 hybrid 模式仍使用 `agent_chunks.content` 返回切片级命中
