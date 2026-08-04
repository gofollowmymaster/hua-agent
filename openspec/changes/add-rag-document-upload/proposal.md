## Why

RAG 管理后台目前只能扫描服务器 raw 目录，管理员无法从文档管理页面直接添加资料，且同租户相同内容可能因路径不同产生重复索引。需要补齐批量上传入口，并将 `file_hash` 防重落实到数据库约束。

## What Changes

- 新增管理端多文件上传接口与上传弹窗，支持现有七种文档格式、20 文件和单文件 50MB 限制。
- 上传后同步执行现有解析、切片、embedding 和索引流程，并返回逐文件成功、重复或失败结果。
- 同租户按 SHA-256 `file_hash` 防重；扫描入库和上传入库统一跳过重复内容。
- 清理历史重复文档及关联切片，建立 `(tenant_code, file_hash)` 联合唯一约束。
- 同名但内容不同的文件保存时自动重命名，避免覆盖 raw 原文件。

## Non-goals

- 不新增异步队列、轮询、断点续传或分片上传。
- 不删除历史重复记录对应的 raw 原文件，不改变现有“删除索引”语义。
- 不新增文档格式，也不修改现有解析、切片或 embedding 算法。

## Capabilities

### New Capabilities

- `rag-document-upload`: 管理端批量上传、同步索引、逐文件结果、同租户 hash 防重和历史数据去重。

### Modified Capabilities

无。

## Impact

- API：新增 multipart 管理接口、上传 Service，并扩展文档加载与入库能力。
- RAG Admin：新增上传弹窗和 multipart API client。
- 数据库：删除同租户重复 hash 文档及其切片，新增联合唯一约束并更新 Prisma schema。
