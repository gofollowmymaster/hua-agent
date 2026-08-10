## ADDED Requirements

### Requirement: 只扫描 docs 目录下的 Markdown 文件
入库程序 SHALL 递归扫描 `apps/api/src/agent/docs`，仅处理 `.md` 文件，其他扩展名文件 SHALL 被跳过且不写入数据库。

#### Scenario: 目录中存在多种文件类型
- **WHEN** docs 目录中同时存在 `.md`、`.pdf`、`.xlsx` 和图片文件
- **THEN** 仅 `.md` 文件进入清洗和入库流程，其他文件被记录为跳过

### Requirement: 保存 frontmatter 元数据和分类字段
入库程序 SHALL 解析 Markdown frontmatter，将已知元数据写入独立列，并将完整 frontmatter 保存到 `metadata` JSONB；文档的 `category` SHALL 为 docs 二级目录名并去除租户前缀，`tenant_code` SHALL 与顶层目录名一致。

#### Scenario: 带完整 frontmatter 的文档入库
- **WHEN** 文档包含远程文档、文档ID、Wiki节点ID、最后修改时间、文档路径面包屑、source_type 和当前版本
- **THEN** 数据库记录包含对应独立列，且 `metadata` 保留全部字段

#### Scenario: 从二级目录派生分类
- **WHEN** 文档路径为 `yurex/Yurex业务流程/日常业务跟进/POA处理.md`
- **THEN** `category` 为 `业务流程`，`tenant_code` 为 `yurex`

### Requirement: 清洗、切分并向量化 Markdown 内容
入库程序 SHALL 在切分前移除 YAML frontmatter 和纯图片引用，使用 `RecursiveCharacterTextSplitter` 按配置切分，调用 embedding 服务生成向量，并在事务中写入文档和切片。

#### Scenario: 内容清洗后写入切片
- **WHEN** 一个 Markdown 文档包含 frontmatter、正文和图片引用
- **THEN** 切片内容不包含 frontmatter 和纯图片引用，`agent_chunks` 写入切分后的正文与向量

### Requirement: 幂等入库和强制重索引
入库程序 SHALL 按 `(tenant_code, source_path)` 去重；文件哈希未变化且未传 `--force` 时 SHALL 跳过，传入 `--force` 时 SHALL 重建文档切片。

#### Scenario: 文件未变化
- **WHEN** 文档哈希与库中一致且未传 `--force`
- **THEN** 该文档被跳过且不重建切片

#### Scenario: 强制重索引
- **WHEN** 传入 `--force`
- **THEN** 即使哈希未变化也删除并重建该文档的全部切片

### Requirement: 入库失败可追踪
单个文档清洗或向量化失败时，程序 SHALL 不中断整个批次，并将该文档标记为 `failed` 且保存错误信息。

#### Scenario: 单文档处理失败
- **WHEN** 某个 Markdown 文件读取或向量化失败
- **THEN** 其余文档继续处理，失败文档状态为 `failed` 且 `error` 非空
