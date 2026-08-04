## ADDED Requirements

### Requirement: 查询改写独立模型

RAG 系统 SHALL 使用独立模型配置执行查询改写，且 MUST NOT 因查询改写模型配置而改变最终答案生成模型。

#### Scenario: 使用默认轻量模型

- **WHEN** 未配置 `RAG_QUERY_REWRITE_MODEL`
- **THEN** 查询改写 SHALL 使用 `qwen-turbo`
- **AND** 最终答案生成 SHALL 继续使用 `MODEL_NAME`

#### Scenario: 覆盖查询改写模型

- **WHEN** 部署环境配置 `RAG_QUERY_REWRITE_MODEL`
- **THEN** 查询改写 SHALL 使用该配置值
- **AND** 系统 SHALL 继续复用现有模型 endpoint 和 API key

#### Scenario: 轻量模型调用失败

- **WHEN** 查询改写模型调用或结构化解析失败
- **THEN** 系统 SHALL 回退使用原始问题进行召回
- **AND** 现有公开接口和流事件 MUST 保持不变
