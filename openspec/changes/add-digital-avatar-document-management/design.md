## Context

现有 RAG 文档管理具备上传、预览、切片查看和删除能力，但其表结构、租户过滤和长度切片均不适用于数字分身文档。本期输入为 `data/管理知识文档/` 中的 39 份 UTF-8 txt，按二级标题切片后应得到 268 个切片。

## Decisions

### 1. 使用独立的全局表

新增 `digital_avatar_documents` 与 `digital_avatar_chunks`，不保存 `tenant_code`。路由继续使用 `require_bearer`，所有已登录管理员共享同一文档集合。Prisma schema 和 `schema.sql` 是结构来源，FastAPI 只映射和读写表。

### 2. 章节切片不做长度回退

解析器只把行首 `## ` 识别为分隔符。标题前非空内容单独成片，每个二级标题及正文完整成片，`###` 不分隔，超长章节不二次切分。无二级标题时全文单片且摘要为空；空章节不生成切片。

### 3. 最后一节正文派生摘要

存在二级标题时，最后一节去掉标题行并裁剪首尾空白后的 Markdown 写入 `summary`，完整章节仍是向量切片。人工摘要可为空；任何重新入库都重新派生并覆盖人工摘要。

### 4. 文件先进入受控目录

页面上传和目录导入最终都把 txt 保存到 `WORKSPACE_ROOT/RAW_DIR/digital-avatar`。批量导入复制源文件但不修改 `data/管理知识文档/`；按相对路径幂等更新，按 SHA-256 全局防重。同批文件逐个提交，失败不阻断其余文件。

### 5. React Admin 复用现有管理交互

页面使用紧凑 ProTable、文本预览、Modal 和 URL query 驱动的全局 Drawer。数字分身使用独立 API client 与 `digital-avatar-chunks` Drawer key，不复用知识问答接口。

## Risks / Trade-offs

- 全局数据刻意绕过现有租户隔离规则；通过专用表、专用 Service 和跨租户可见性测试锁定该语义。
- 单章节最长约 4306 字，可能增加 embedding 请求体；需求要求严格一节一片，因此不做长度切分，provider 错误按单文件失败返回。
- 上传与 embedding 同步执行可能较慢；沿用 20 文件、单文件 50MB 和 10 分钟前端超时。

## Migration Plan

1. 通过环境化 `rag:db:init:*` 创建新表和索引，并运行 `rag:db:check:*`。
2. 部署 FastAPI 和 React Admin。
3. 执行环境化数字分身导入命令；开发环境核对 39 个文档、268 个切片和 39 个非空摘要。

