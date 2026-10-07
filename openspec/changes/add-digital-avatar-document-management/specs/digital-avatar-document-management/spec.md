## ADDED Requirements

### Requirement: 数字分身文档全局管理

系统 SHALL 使用独立于知识问答和业务 Agent 的全局文档与切片表，所有 Bearer 登录管理员 SHALL 访问同一数据集合，数据 SHALL NOT 按租户过滤。

#### Scenario: 不同租户管理员查看文档
- **WHEN** 两个有效登录用户来自不同租户
- **THEN** 两者查看到相同的数字分身文档集合

### Requirement: txt 按二级标题固定切片

系统 SHALL 仅接受 UTF-8 txt，并 SHALL 仅以行首 `## ` 分隔章节。每个章节 SHALL 形成一个不可继续按长度拆分的切片，标题前内容 SHALL 单独成片。

#### Scenario: 文档包含多级标题
- **WHEN** 文档同时包含 `##` 和 `###` 标题
- **THEN** 只有 `##` 开始新切片，`###` 保留在所在切片中

#### Scenario: 文档没有二级标题
- **WHEN** txt 不包含 `## `
- **THEN** 全文形成一个切片且摘要为空

### Requirement: 最后一节生成可编辑摘要

存在二级标题时，系统 SHALL 把最后一节去掉标题行后的原 Markdown 写入摘要，并 SHALL 同时把完整最后一节作为普通切片。人工摘要 SHALL 可编辑，重新入库 SHALL 用文档内容重新生成并覆盖人工摘要。

#### Scenario: 重新入库人工编辑过的文档
- **WHEN** 管理员修改摘要后触发重新入库
- **THEN** 摘要恢复为当前 txt 最后一节正文

### Requirement: 管理页面提供完整文档操作

React Admin SHALL 提供数字分身顶级菜单和文档管理子页，支持分页搜索、txt 批量上传、原文预览、摘要编辑、切片抽屉、单文档重建和删除。

#### Scenario: 管理员核验切片
- **WHEN** 管理员从文档列表打开切片实况
- **THEN** URL SHALL 保存 Drawer 状态并展示文档摘要和分页切片

### Requirement: 目录导入可重复执行

系统 SHALL 提供 dev/test/prod 环境化命令，把指定目录中的 txt 复制到受控目录并幂等入库，且 SHALL 不修改源目录文件。

#### Scenario: 重复执行首批导入
- **WHEN** 源文件内容未变化且再次执行导入
- **THEN** 系统 SHALL 跳过重复 embedding 并保持单份文档记录

