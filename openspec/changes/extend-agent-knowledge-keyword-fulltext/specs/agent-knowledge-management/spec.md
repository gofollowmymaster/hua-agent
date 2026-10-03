## MODIFIED Requirements

### Requirement: 按租户分页查看文档
管理接口 SHALL 返回当前租户的文档分页列表，支持 `keyword`、`category`、`status` 筛选；`keyword` SHALL 匹配文件名、路径、面包屑或文档切片正文全文。

#### Scenario: 正文全文命中文档
- **WHEN** 当前租户使用关键词查询，关键词未出现在文档元数据但命中某个切片正文
- **THEN** 分页结果包含该切片所属文档，且同一文档只返回一次

#### Scenario: 组合筛选保持租户隔离
- **WHEN** 同时传入关键词、分类和状态
- **THEN** 只返回当前租户内同时满足分类、状态及元数据或正文关键词条件的文档

#### Scenario: 无有效全文词元
- **WHEN** 关键词无法产生 zhparser 有效词元但能命中文档元数据
- **THEN** 分页结果仍包含元数据命中的文档
