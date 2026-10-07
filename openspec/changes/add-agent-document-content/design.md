## Context

Agent 文档由 NestJS 和 FastAPI 独立入库，但共享 Prisma 管理的 PostgreSQL schema。读取文件后，两套实现都会移除 frontmatter 和图片引用再切片；原始文本当前没有持久化。管理接口和 Agent 工具复用文档 Service，直接扩展现有详情响应会把大文本暴露给后台页面。

## Decisions

- 新列使用 `TEXT NOT NULL DEFAULT ''`，使已有行和滚动部署期间的旧写入保持兼容；初始化 SQL 同时使用 `ADD COLUMN IF NOT EXISTS` 升级已有数据库。
- `content` 保存去除 UTF-8 BOM 后、未清洗的 Markdown 全文，保留 frontmatter、图片引用和原始换行；现有清洗正文继续用于切片。
- 未强制入库时，仅当哈希、分类、状态和已保存原文均一致才跳过。迁移产生的空内容会触发正常重入库。
- 管理查询不选择全文；NestJS 和 FastAPI 分别增加工具专用的租户隔离查询，只有 `get_document` 工具读取并返回完整内容。
- `get_document.content` 不截断。工具过程摘要仍只使用文件名，日志不得记录全文。

## Risks / Trade-offs

- 完整文档会增加数据库容量和模型上下文占用，但这是工具读取全文的明确需求。
- 历史数据需要源 Markdown 仍然存在，并在后续入库时补齐；不能从切片无损恢复。
- 默认空字符串允许旧版本服务继续写入，完整性由新版入库逻辑和自动补齐条件保证。
