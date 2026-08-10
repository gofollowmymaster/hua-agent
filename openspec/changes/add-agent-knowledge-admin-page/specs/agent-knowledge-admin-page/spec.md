## ADDED Requirements

### Requirement: 展示业务知识库文档列表
页面 SHALL 使用搜索表单和表格展示当前租户已入库的业务 Agent 文档，支持按关键词、分类、状态筛选并分页。

#### Scenario: 按分类搜索文档
- **WHEN** 用户选择分类 `yurex` 并点击搜索
- **THEN** 表格仅展示分类为 `yurex` 的当前租户文档

### Requirement: 支持触发入库和强制重建索引
页面 SHALL 提供“触发入库”和“强制重建索引”操作，强制重建前需要二次确认。

#### Scenario: 强制重建索引
- **WHEN** 用户点击“强制重建索引”并确认
- **THEN** 页面调用 `force=true` 的入库接口并刷新列表

### Requirement: 支持删除文档
页面 SHALL 提供删除操作，删除前显示确认信息，成功后刷新列表。

#### Scenario: 删除文档
- **WHEN** 用户点击删除并确认
- **THEN** 文档和关联切片被删除且列表刷新

### Requirement: 更新路由副标题
`/business-agent/knowledge` 路由 SHALL 使用真实功能描述，不再显示“模块骨架”。

#### Scenario: 打开业务知识库页面
- **WHEN** 用户进入 `/business-agent/knowledge`
- **THEN** 页面标题和副标题描述业务知识库管理能力
