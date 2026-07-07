## 1. OpenSpec 与数据库

- [x] 1.1 创建 OpenSpec proposal、design、spec 和 tasks。
- [x] 1.2 更新 RAG Prisma schema、初始化 SQL 和迁移脚本。
- [x] 1.3 运行 Prisma client 生成。

## 2. 后端实现

- [x] 2.1 在文档扫描类型中增加 `type` 默认值推导。
- [x] 2.2 更新 ingest 成功和失败写入逻辑，保留已有人工元数据。
- [x] 2.3 文档分页响应返回 `type` 和 `tag`。
- [x] 2.4 新增文档元数据更新 DTO、Controller 和 Service 方法。

## 3. 前端实现

- [x] 3.1 更新 RAG Admin API 类型和元数据更新请求方法。
- [x] 3.2 文档表格展示 `type` 和 `tag`。
- [x] 3.3 增加编辑弹窗并保存后刷新列表。

## 4. 测试与验证

- [x] 4.1 补充 loader、ingest、admin service 单元测试。
- [x] 4.2 运行 RAG 相关 Jest 定向测试。
- [x] 4.3 运行 `pnpm build:dev` 与 `pnpm rag-admin:build`。
