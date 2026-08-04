## ADDED Requirements

### Requirement: Qwen3 模型重排

RAG 系统 SHALL 在选择 `model` 重排模式时调用配置的 DashScope 原生 API，并 MUST 使用 `qwen3-rerank` 默认模型对融合候选进行相关性评分和排序。

#### Scenario: 模型重排成功

- **WHEN** 非空融合候选以 `model` 模式进入重排且 DashScope 返回有效结果
- **THEN** 系统 SHALL 按响应顺序映射原候选
- **AND** 系统 MUST 将 relevance score 写入候选分数及模型重排诊断

#### Scenario: 空候选跳过外部调用

- **WHEN** 空候选列表进入模型重排
- **THEN** 系统 SHALL 直接返回空结果
- **AND** 系统 MUST NOT 调用 DashScope API

#### Scenario: 模型响应非法

- **WHEN** DashScope 返回非成功状态、空结果、越界或重复 index、非法 relevance score
- **THEN** 系统 MUST 将该次模型重排视为失败
- **AND** 系统 MUST NOT 返回错误映射的候选

### Requirement: 请求级重排模式选择

RAG 内部问答调用 SHALL 支持可选的 `none | rule | model` 重排模式，并 MUST 按请求参数、全局配置、`rule` 默认值的优先级选择策略。

#### Scenario: 请求覆盖全局模式

- **WHEN** 内部调用传入合法重排模式
- **THEN** 系统 SHALL 使用请求模式
- **AND** 系统 MUST NOT 修改 HTTP DTO、SSE query 参数、AGUI 或企微协议

#### Scenario: 使用全局默认模式

- **WHEN** 内部调用未传入重排模式
- **THEN** 系统 SHALL 使用 `RAG_RERANK_MODE`
- **AND** 配置缺失或无效时系统 SHALL 使用 `rule`

### Requirement: 重排降级链

RAG 系统 MUST 在模型重排失败时回退规则重排，并 MUST 在规则重排也失败时返回融合候选前 topK。

#### Scenario: 模型失败后规则成功

- **WHEN** Qwen3 重排失败且规则重排成功
- **THEN** 系统 SHALL 返回规则重排候选
- **AND** 结果状态 MUST 保留模型失败，且 MUST 记录选择模式与规则 fallback 模式

#### Scenario: 模型与规则均失败

- **WHEN** Qwen3 重排和后续规则重排均失败
- **THEN** 系统 SHALL 返回融合候选前 topK
- **AND** 系统 MUST 记录非敏感降级诊断

#### Scenario: 规则模式失败

- **WHEN** 直接选择规则重排且执行失败
- **THEN** 系统 SHALL 返回融合候选前 topK

### Requirement: 模型重排配置与安全日志

RAG 系统 SHALL 通过集中配置读取模型 endpoint、API key、模型名称和超时，并 MUST NOT 在结构化日志或 LangGraph metadata 中记录 query、候选正文、密钥或 Authorization header。

#### Scenario: 模型配置缺失

- **WHEN** `model` 模式缺少 endpoint 或可用 API key
- **THEN** 系统 SHALL 使用项目异常类型报告模型策略失败
- **AND** 系统 SHALL 进入规则降级而不泄露敏感配置

#### Scenario: 记录节点诊断

- **WHEN** LangGraph 重排节点完成或降级
- **THEN** 系统 SHALL 仅记录模式、fallback 模式、状态、耗时、候选数、tenant 和 session 等非敏感字段
