## Why

管理后台需要新增独立的“数字分身”业务模块，用专门的章节切片规则管理管理类课程文档。现有知识问答文档按租户和长度切片，无法表达全局共享、按二级标题固定切片以及文档摘要等需求。

## What Changes

- 新增 React Admin“数字分身 > 文档管理”页面，不扩展 Vue 管理端。
- 新增仅由 FastAPI 暴露的数字分身文档管理接口，接口要求 Bearer 登录但数据全局共享。
- 新增独立的数字分身文档和切片表，由 Prisma RAG schema 与初始化 SQL 统一管理。
- txt 文档按 `## ` 二级标题严格切片，最后一节正文同时写入摘要并参与向量化。
- 新增目录批量导入命令和页面 txt 批量上传、预览、摘要编辑、切片查看、重建与删除能力。

## Non-goals

- 不实现数字分身问答、人物设定、语音、视频、训练或发布。
- 不支持 txt 以外的文档格式。
- 不新增 Vue 页面或 NestJS HTTP 接口，不修改现有知识问答和业务 Agent 数据。

## Capabilities

### New Capabilities

- `digital-avatar-document-management`: 全局数字分身文档、固定章节切片、摘要和管理页面。

### Modified Capabilities

- `product-module-boundary`: 管理后台增加第三个顶级业务模块“数字分身”。

## Impact

- 数据库：新增两张全局表、向量与全文索引。
- FastAPI：新增模块、八个管理接口和批量导入命令。
- React Admin：新增菜单、路由、API client、页面及切片 Drawer。

