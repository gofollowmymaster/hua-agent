## Requirements

### Requirement: 文档元数据持久化

系统 SHALL 在 `aplus_documents` 中持久化文档业务分类 `type` 和标签 `tag`，两个字段均为非空字符串，默认值为空字符串。

#### Scenario: 新建文档记录

- **WHEN** RAG 文档首次入库
- **THEN** 文档记录包含 `type` 和 `tag`
- **AND** `tag` 默认为空字符串

### Requirement: 默认 type 推导

系统 SHALL 从租户 raw 目录下的一级业务目录推导文档默认 `type`。

#### Scenario: 文件位于业务目录

- **GIVEN** 文件路径形态为 `raw/<tenant>/<type>/file`
- **WHEN** 扫描该文件
- **THEN** 默认 `type` 为 `<type>`

#### Scenario: 文件位于租户根目录

- **GIVEN** 文件路径形态为 `raw/<tenant>/file`
- **WHEN** 扫描该文件
- **THEN** 默认 `type` 为空字符串

### Requirement: 人工编辑保护

系统 SHALL 在重新入库已有文档时保留已存在的 `type` 和 `tag`。

#### Scenario: 强制重建索引

- **GIVEN** 管理端已修改某文档的 `type` 或 `tag`
- **WHEN** 对该文档重新入库或强制重建索引
- **THEN** 文档的 `type` 和 `tag` 不被默认值覆盖

### Requirement: 管理端编辑

RAG Admin SHALL 展示文档 `type` 和 `tag`，并允许当前租户用户编辑这两个字段。

#### Scenario: 保存元数据

- **WHEN** 用户在文档管理页编辑并保存 `type` 和 `tag`
- **THEN** 系统更新当前租户对应文档
- **AND** 文档列表刷新后展示新值

#### Scenario: 跨租户保护

- **WHEN** 用户尝试更新非当前租户文档
- **THEN** 系统拒绝更新
