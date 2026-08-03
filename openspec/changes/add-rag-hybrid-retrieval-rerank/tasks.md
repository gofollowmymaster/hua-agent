## 1. 检索配置与数据库

- [x] 1.1 扩展 RAG 检索配置类型和默认值。
- [x] 1.2 新增 RAG chunk 全文索引 schema/migration。

## 2. 多路召回与融合

- [x] 2.1 扩展 RAG 检索内部类型，记录召回路由、rank 和分数。
- [x] 2.2 新增 `RagRetrievalService`，实现向量召回、关键词召回、RRF 融合和降级日志。

## 3. 重排抽象

- [x] 3.1 新增 `RagReranker` 抽象、`NoopReranker` 和 `RuleBasedReranker`。
- [x] 3.2 将 `RagRetrievalService` 接入重排模式选择，并预留模型重排切换边界。

## 4. 问答链路接入与验证

- [x] 4.1 将同步和流式 RAG 问答改为调用 `RagRetrievalService`。
- [x] 4.2 注册新增 provider，并补充相关单元测试。
- [x] 4.3 运行 Prisma client 生成和相关 API 测试/构建验证。
