## MODIFIED Requirements

### Requirement: 保存完整文档与清洗后的检索内容
入库程序 SHALL 将去除 UTF-8 BOM 后的原始 Markdown 全文保存到 `agent_documents.content`，并继续使用移除 frontmatter、图片引用和冗余空白后的正文生成切片与向量。

#### Scenario: 原文与切片分别保存
- **WHEN** Markdown 包含 frontmatter、图片引用、多余空行和正文
- **THEN** `agent_documents.content` 保留完整原文，`agent_chunks.content` 只包含清洗和切分后的正文

#### Scenario: 单文档处理失败
- **WHEN** 文档读取成功但后续清洗或向量化失败
- **THEN** 失败文档记录仍保存完整原文，并记录 `failed` 状态和错误信息

### Requirement: 幂等入库和历史内容补齐
入库程序 SHALL 仅在文件哈希、分类、状态和已保存完整内容均一致且未强制重索引时跳过文档。

#### Scenario: 历史记录缺少完整内容
- **WHEN** 文件哈希未变化但数据库中的 `content` 为空
- **THEN** 普通入库重新处理该文档并补齐完整内容

#### Scenario: 完整内容已经一致
- **WHEN** 文件哈希、分类、状态和完整内容均一致且未传入强制参数
- **THEN** 文档被跳过且不重建切片
