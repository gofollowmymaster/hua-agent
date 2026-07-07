## Context

当前 RAG 文档由 `DocumentLoaderService` 扫描 `raw/<tenant>/...` 后写入 `aplus_documents`。数据库已有 `file_type` 表示扩展名，但缺少业务分类和人工标签。管理端文档页已经具备列表、预览、切片查看和删除索引能力，本次在同一页面补充元数据编辑。

## Goals / Non-Goals

**Goals:**

- 在数据库持久化 `type` 和 `tag`。
- 文档首次入库时自动从租户 raw 目录下一级业务目录推导 `type`。
- 管理端可以修改 `type` 与 `tag`，且后续重新入库不覆盖人工编辑。
- 保持当前租户隔离和管理端鉴权方式。

**Non-Goals:**

- 不改变文档唯一键、chunk 写入策略或检索算法。
- 不把 `type`、`tag` 写入 embedding 或 prompt 上下文。
- 不新增复杂标签体系、多选标签或字典管理。

## Decisions

- `type` 与 `tag` 使用 `TEXT NOT NULL DEFAULT ''`：避免旧数据和接口调用出现 null 分支，前端可直接按字符串展示。
- 默认 `type` 从 `sourcePath` 第一段推导：当前扫描时 `sourcePath` 是相对 `raw/<tenant>` 的路径，`业务分类/a.md` 的第一段就是业务分类。兼容历史 `raw/<tenant>/<type>/file` 形态时，迁移脚本跳过 `raw` 和租户段。
- 入库冲突更新不写 `type`、`tag`：保证管理端人工编辑结果不会被强制重建索引覆盖。
- 新增独立 metadata 更新接口：只允许修改 `type` 和 `tag`，避免误改文件路径、hash、状态或索引内容。

## Risks / Trade-offs

- 旧 `source_path` 格式不完全一致可能导致部分 `type` 回填为空或不准确。缓解方式：迁移脚本覆盖已知两类路径，管理端允许人工修正。
- `type` 使用保留感较强的字段名。缓解方式：Prisma 层使用普通字段映射，SQL 中需要时显式双引号 `"type"`。
- 重新入库不覆盖 `type` 意味着文件移动目录后旧人工分类会保留。缓解方式：这是保护人工编辑的预期行为，如需重置可在管理端手动修改。

## Migration Plan

1. 添加 RAG migration 和 `schema.sql` 字段定义。
2. 更新 Prisma schema 并执行 `pnpm pg` 生成 client。
3. 更新后端 ingest、admin API 与测试。
4. 更新 RAG Admin 类型、表格展示和编辑弹窗。
5. 运行 API 定向测试、`pnpm build:dev` 和 `pnpm rag-admin:build`。
