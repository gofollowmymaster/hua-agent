## ADDED Requirements

### Requirement: 按租户执行全文检索
检索接口 SHALL 使用 zhparser 对切片内容执行全文检索，且只返回当前租户的文档片段。

#### Scenario: 全文命中当前租户片段
- **WHEN** 当前租户为 `yurex` 且查询词匹配某切片
- **THEN** 返回该切片及其文档来源信息

### Requirement: 按租户执行向量检索
检索接口 SHALL 将查询文本生成 embedding，并使用 pgvector 余弦相似度返回当前租户的相关片段。

#### Scenario: 向量命中语义相关片段
- **WHEN** 查询文本与某切片语义相关但字面不完全一致
- **THEN** 返回按相似度排序的该租户切片

### Requirement: 混合检索合并全文和向量结果
`hybrid` 模式 SHALL 同时执行全文与向量检索，使用 Reciprocal Rank Fusion 合并去重后返回 `topK` 条结果。

#### Scenario: 双路召回合并
- **WHEN** 请求使用 `mode=hybrid`
- **THEN** 响应包含全文和向量两路的合并结果，且同一切片不重复出现

### Requirement: 支持分类过滤和结果上限
检索接口 SHALL 支持可选的 `category` 过滤，并将 `topK` 限制在 1 到 100 之间。

#### Scenario: 按分类过滤
- **WHEN** 请求携带 `category=yurex`
- **THEN** 仅返回 `category` 为 `yurex` 的当前租户片段

#### Scenario: 超过上限
- **WHEN** 请求的 `topK` 大于 100
- **THEN** 接口拒绝请求或按 100 截断
