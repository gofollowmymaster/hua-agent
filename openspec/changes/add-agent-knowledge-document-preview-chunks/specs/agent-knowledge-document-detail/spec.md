## ADDED Requirements

### Requirement: 提供文档详情
系统 SHALL 按租户隔离返回业务 Agent 文档详情及实际切片数。

#### Scenario: 查询当前租户文档
- **WHEN** 请求当前租户文档 ID
- **THEN** 返回文档元数据、状态和实际切片数

#### Scenario: 查询其他租户文档
- **WHEN** 请求其他租户文档 ID
- **THEN** 返回文档不存在且不泄露数据

### Requirement: 提供切片分页
系统 SHALL 按 `page/pageSize` 分页返回当前租户文档的切片。

#### Scenario: 分页查询切片
- **WHEN** 请求文档切片分页接口
- **THEN** 返回 `list/total/page/pageSize` 和切片内容

### Requirement: 提供 Markdown 预览
系统 SHALL 返回当前租户文档对应的原始 Markdown 文件，并禁止路径越界。

#### Scenario: 预览 Markdown
- **WHEN** 请求当前租户 Markdown 文档预览
- **THEN** 返回 `text/markdown` 文件内容

#### Scenario: 路径越界
- **WHEN** 文档 `sourcePath` 指向 docs 根目录之外
- **THEN** 接口拒绝访问且不返回文件
