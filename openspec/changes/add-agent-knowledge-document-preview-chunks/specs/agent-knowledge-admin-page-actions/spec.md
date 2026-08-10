## ADDED Requirements

### Requirement: 文档预览
业务知识库页面 SHALL 支持点击文档名预览 Markdown 文件。

#### Scenario: 打开预览
- **WHEN** 用户点击文档名
- **THEN** 打开预览弹窗并加载原始 Markdown

### Requirement: 切片实况抽屉
业务知识库页面 SHALL 支持通过“切片实况”或行点击打开全局抽屉查看切片。

#### Scenario: 查看切片
- **WHEN** 用户点击“切片实况”
- **THEN** 抽屉展示文档摘要和可展开的切片列表

### Requirement: 抽屉可分享
切片抽屉 SHALL 通过 URL query `drawer=agent-knowledge-chunks` 驱动。

#### Scenario: 恢复抽屉
- **WHEN** 页面 URL 携带 `drawer=agent-knowledge-chunks` 和 `drawerCode`
- **THEN** 抽屉自动打开对应文档切片
