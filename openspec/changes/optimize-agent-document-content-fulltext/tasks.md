## 1. 数据库索引

- [x] 1.1 在初始化 SQL 和增量迁移中新增文档 content zhparser GIN 索引
- [x] 1.2 扩展 RAG 数据库检查以验证新索引，同时保留 chunk 全文索引

## 2. 双栈查询

- [x] 2.1 NestJS 文档管理关键词查询改为直接匹配 `agent_documents.content`
- [x] 2.2 FastAPI 文档管理关键词查询同步改为直接匹配 `agent_documents.content`

## 3. 文档与测试

- [x] 3.1 更新双栈架构文档，区分管理文档全文索引与 Agent chunk 检索
- [x] 3.2 补充双栈 SQL、组合筛选、租户隔离及 `search_knowledge` 兼容测试

## 4. 验证

- [x] 4.1 运行双栈聚焦/完整测试、构建、lint、mypy 和差异检查
- [x] 4.2 初始化并检查开发数据库，确认文档与 chunk 两个全文索引同时存在
