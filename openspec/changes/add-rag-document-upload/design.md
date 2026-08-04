## Context

管理端当前只能触发 `DocumentLoaderService.scanRawFiles()` 全目录扫描，`RagIngestService` 以 `(tenant_code, source_path)` upsert 文档。相同内容位于不同路径时会形成重复索引，当前开发库已存在同租户重复 hash。上传功能横跨 multipart 接口、raw 文件落盘、同步索引、前端交互与破坏性数据迁移。

## Goals / Non-Goals

**Goals:**

- 提供租户隔离的多文件上传、同步索引和逐文件结果。
- 统一上传与扫描的格式、hash 和单文件入库逻辑。
- 清理历史重复数据并从数据库层阻止同租户重复 hash。
- 保持批次部分成功以及现有预览、删除索引和强制重建行为。

**Non-Goals:**

- 不引入异步队列、分片上传或断点续传。
- 不删除 raw 重复文件，不增加解析格式或修改索引算法。
- 不合并重复记录的 type、tag 或来源路径。

## Decisions

### 1. multipart 文件使用磁盘临时存储

接口使用 `FilesInterceptor('files', 20)`，单文件限制 50MB，临时文件写入 OS temp 目录。相比 memory storage，磁盘暂存避免 20 个大文件同时占用 Node.js heap；Service 在 finally 中清理所有未保留临时文件。

### 2. 上传与扫描复用指定文件入库

`DocumentLoaderService` 作为支持格式与 SHA-256 的唯一来源；`RagIngestService` 抽出指定 `RawDocumentFile` 的处理入口。上传 Service 只负责协议后的文件校验、同批防重、租户 raw 落盘和结果映射，不复制解析、切片或 embedding。

### 3. 数据库联合唯一约束负责并发防重

迁移先按 `(tenant_code, file_hash)` 排名，优先保留 ready 且存在实际切片的记录，再按 ready、`ingested_at`、`updated_at`、`id` 选择最新记录，删除其余记录及级联切片，最后建立联合唯一约束。入库前主动查询 hash 以避免无效计算，同时捕获唯一冲突处理并发竞态。

### 4. 同名不同内容不覆盖

上传文件保存到当前租户 raw 根目录。使用排他写入选择原始安全文件名；路径已存在时在扩展名前追加递增序号。上传后索引失败保留 raw 文件，重复或格式错误不落入 raw。

### 5. 前端整批提交并展示逐文件结果

`ApUpload` 面向 OSS 自动上传，难以表达“选择整批后一次提交”；因此弹窗使用 `ApModal`、`ApButton` 与同组件体系的 antdv `Upload.Dragger`，通过 `beforeUpload=false` 管理本地文件列表并构造一个 FormData 请求。

## Risks / Trade-offs

- [Risk] 迁移会永久删除重复数据库记录 → raw 文件保留，迁移前后执行重复统计，保留规则确定且可重跑。
- [Risk] 同步索引多个大文件可能耗时 → 上传请求前端超时设为 10 分钟，批次限制为 20 个且逐文件顺序处理。
- [Risk] 前置 hash 查询存在并发竞态 → 联合唯一约束为最终一致性保障，唯一冲突转换为 duplicate。
- [Risk] raw 中重复副本仍被扫描 → 扫描路径增加同租户 hash 查询并在解析前跳过。

## Migration Plan

1. 执行迁移 SQL 删除重复数据库记录并添加 `aplus_documents_tenant_code_file_hash_key`。
2. 更新 Prisma schema/client 和初始化 schema。
3. 部署支持 hash 跳过和唯一冲突降级的新入库代码，再开放上传入口。
4. 回滚应用不移除联合唯一约束；若必须回滚约束可单独 drop，但已删除记录只能由 raw 文件重新入库恢复。

## Open Questions

无。
