## ADDED Requirements

### Requirement: 按租户分页查看文档
管理接口 SHALL 返回当前租户的文档分页列表，并支持 `keyword`、`category`、`status` 筛选。

#### Scenario: 按分类分页查询
- **WHEN** 请求 `category=yurex` 且存在多页数据
- **THEN** 返回当前租户 `category=yurex` 的文档及分页信息

### Requirement: 按租户删除文档
删除接口 SHALL 校验文档归属，只能删除当前租户的文档，并级联删除其全部切片。

#### Scenario: 删除当前租户文档
- **WHEN** 删除接口传入当前租户文档 ID
- **THEN** 文档及关联切片被删除

#### Scenario: 删除其他租户文档
- **WHEN** 删除接口传入其他租户文档 ID
- **THEN** 接口返回文档不存在且不删除任何数据
