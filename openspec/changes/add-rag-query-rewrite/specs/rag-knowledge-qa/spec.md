## MODIFIED Requirements

### Requirement: RAG 问答

系统 SHALL 提供同步问答接口，在加载可用会话短期记忆后，将用户问题改写为适合向量检索的独立查询，根据改写查询生成 query embedding，从当前租户的 pgvector 知识库检索相关片段，并使用用户原始问题结合检索资料生成回答。

#### Scenario: 同步问答使用改写查询检索

- **WHEN** 调用 `POST /ai/rag/query` 并提供 `question`
- **THEN** 系统 SHALL 在检索前根据最近对话和用户原问题生成检索查询
- **AND** 查询改写结果 SHALL 是结构化数据，包含原问题、改写问题、是否使用改写和改写原因
- **AND** 系统 SHALL 使用改写后的查询检索当前租户知识库
- **AND** 系统 SHALL 使用用户原始问题生成最终回答
- **AND** 响应结构 SHALL 保持 `answer`、`sources`、`chunks` 和 `sessionKey`

#### Scenario: 查询改写失败回退

- **WHEN** 查询改写模型调用失败或返回空文本
- **THEN** 系统 SHALL 使用用户原始问题执行检索
- **AND** 系统 SHALL NOT 因查询改写失败中断问答
- **AND** 查询改写结果 SHALL 记录回退原因

#### Scenario: 查询改写处理低质量输入

- **WHEN** 用户问题包含明显错别字、同音字、口语化表达或与问题无关的语句
- **THEN** 系统 SHALL 只在高置信情况下纠正错误并保留真实检索意图
- **AND** 系统 SHALL 去除无检索价值的寒暄、客套、语气词或背景闲聊
- **AND** 系统 SHALL NOT 将无意义、乱码、纯寒暄或与知识库无关的输入强行改写为业务问题

### Requirement: RAG 流式问答

系统 SHALL 提供 SSE 流式问答接口，在加载可用会话短期记忆后，将用户问题改写为适合向量检索的独立查询，根据改写查询检索当前租户相关片段，并以文本 chunk 形式输出基于用户原始问题的模型回答。

#### Scenario: 流式问答使用改写查询检索

- **WHEN** 调用 `GET /ai/rag/query/stream?question=...`
- **THEN** 系统 SHALL 在检索前根据最近对话和用户原问题生成检索查询
- **AND** 查询改写结果 SHALL 是结构化数据，包含原问题、改写问题、是否使用改写和改写原因
- **AND** 系统 SHALL 使用改写后的查询检索当前租户知识库
- **AND** 系统 SHALL 保持现有 SSE 事件结构

#### Scenario: 流式查询改写失败回退

- **WHEN** 流式问答的查询改写模型调用失败或返回空文本
- **THEN** 系统 SHALL 使用用户原始问题执行检索
- **AND** 系统 SHALL 继续现有流式生成或普通生成 fallback 流程
