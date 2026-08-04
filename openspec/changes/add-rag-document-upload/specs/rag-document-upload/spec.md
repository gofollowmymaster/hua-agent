## ADDED Requirements

### Requirement: 管理员可以批量上传现有格式文档
系统 MUST 提供受现有管理端鉴权保护的 multipart 上传接口，一次接受最多 20 个文件、单文件最大 50MB，并支持当前文档加载器的 `pdf`、`docx`、`xlsx`、`ppt`、`pptx`、`txt`、`md` 格式。

#### Scenario: 多文件上传
- **WHEN** 管理员从文档管理页面选择多个合法文件并提交
- **THEN** 系统 MUST 将文件保存到当前租户 raw 目录并同步执行索引
- **AND** 系统 MUST 返回每个文件的处理结果

#### Scenario: 请求超过限制
- **WHEN** 上传请求超过 20 个文件或任一文件超过 50MB
- **THEN** 系统 MUST 拒绝整个请求

#### Scenario: 批次包含不支持格式
- **WHEN** 合法批次中包含扩展名不受支持的文件
- **THEN** 系统 MUST 将该文件标记为 failed 并继续处理其他文件

### Requirement: 同租户文档内容必须按 hash 唯一
系统 MUST 使用 SHA-256 `file_hash` 在当前租户内识别重复文档，并 MUST 通过 `(tenant_code, file_hash)` 数据库联合唯一约束阻止并发重复写入。不同租户 MUST 可以保存相同 hash。

#### Scenario: 与现有文档重复
- **WHEN** 上传或扫描文件的 hash 已存在于当前租户
- **THEN** 系统 MUST 在解析和 embedding 前跳过该文件
- **AND** 上传结果 MUST 标记为 duplicate

#### Scenario: 同批次重复
- **WHEN** 同一上传批次包含两个相同 hash 的文件
- **THEN** 系统 MUST 只处理第一份并将后续文件标记为 duplicate

#### Scenario: 并发上传相同内容
- **WHEN** 两个请求并发向同一租户上传相同 hash
- **THEN** 联合唯一约束 MUST 只允许一条文档记录
- **AND** 另一请求 MUST 返回 duplicate 而不是新增失败文档

### Requirement: 历史重复数据必须按确定规则清理
迁移 MUST 对同租户相同 hash 只保留一条记录，优先保留 ready 且存在切片的记录，其次保留其他 ready 记录，再按 `ingested_at`、`updated_at`、`id` 从新到旧选择。

#### Scenario: 删除重复数据库记录
- **WHEN** 迁移发现同租户相同 hash 的多条文档
- **THEN** 系统 MUST 保留排序最高的一条并删除其余记录
- **AND** 被删除文档的切片 MUST 通过外键级联删除
- **AND** raw 原文件 MUST 保留

### Requirement: 上传批次必须支持部分成功
系统 MUST 独立处理每个文件，并返回 indexed、duplicate 或 failed 状态；单个文件的重复、格式错误或索引失败 MUST NOT 阻断其他文件。

#### Scenario: 混合结果批次
- **WHEN** 一个批次同时包含可索引、重复和不可解析文件
- **THEN** 响应 MUST 包含正确的汇总数量与逐文件状态
- **AND** 可索引文件 MUST 正常写入文档和切片

### Requirement: 上传页面必须提供可观测结果
文档管理页面 MUST 支持拖拽和多选文件、移除待上传文件、阻止重复提交，并展示逐文件结果。

#### Scenario: 上传完成刷新列表
- **WHEN** 上传批次处理完成
- **THEN** 页面 MUST 展示每个文件的状态、片段数或失败原因
- **AND** 页面 MUST 刷新文档列表以显示新增文档
