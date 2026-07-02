## ADDED Requirements

### Requirement: RAG 文档入库

系统 SHALL 提供接口扫描配置的原始资料目录，抽取支持文件类型的文本内容，切分为片段，生成 embedding，并写入 RAG 专用 pgvector 数据库。

#### Scenario: 初次入库成功

- **WHEN** 调用 `POST /ai/rag/ingest` 且资料目录存在支持的文档
- **THEN** 系统 SHALL 返回扫描文件数、索引文件数、跳过文件数、失败文件数、chunk 总数和逐文件结果
- **AND** 成功文档 SHALL 写入 `aplus_documents`，片段 SHALL 写入 `aplus_chunks`

#### Scenario: 文件未变化时跳过

- **WHEN** 调用入库接口且文档 hash 未变化、状态为 `ready`、`force` 不为 true
- **THEN** 系统 SHALL 跳过该文件并在结果中标记 `skipped`

### Requirement: RAG 问答

系统 SHALL 提供同步问答接口，根据用户问题生成 query embedding，从 pgvector 检索相关片段，并仅基于检索资料生成回答。

#### Scenario: 同步问答成功

- **WHEN** 调用 `POST /ai/rag/query` 并提供 `question`
- **THEN** 系统 SHALL 返回 `answer`、`sources` 和 `chunks`
- **AND** `topK` SHALL 限制在 1 到 20 之间，未传时使用默认值

#### Scenario: 问题为空

- **WHEN** 调用问答接口但 `question` 为空
- **THEN** 系统 SHALL 返回参数错误

### Requirement: RAG 流式问答

系统 SHALL 提供 SSE 流式问答接口，在检索相关片段后以文本 chunk 形式输出模型回答。

#### Scenario: 流式输出成功

- **WHEN** 调用 `GET /ai/rag/query/stream?question=...`
- **THEN** 系统 SHALL 返回 SSE 事件流
- **AND** 每个事件的 `data` SHALL 是模型生成的文本片段

### Requirement: RAG 文档索引管理

系统 SHALL 提供接口查看已入库文档列表，并按文档 ID 删除文档及其关联 chunks。

#### Scenario: 查询文档列表

- **WHEN** 调用 `GET /ai/rag/documents`
- **THEN** 系统 SHALL 返回文档元信息、状态、错误信息、chunk 数和实际 chunk 数

#### Scenario: 删除文档

- **WHEN** 调用 `DELETE /ai/rag/documents/:id` 且文档存在
- **THEN** 系统 SHALL 删除该文档并级联删除 chunks

#### Scenario: 删除不存在文档

- **WHEN** 删除不存在的文档 ID
- **THEN** 系统 SHALL 返回业务参数错误
