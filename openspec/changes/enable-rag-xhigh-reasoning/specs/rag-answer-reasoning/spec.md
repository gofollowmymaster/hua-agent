## ADDED Requirements

### Requirement: 最终答案使用可配置高强度推理

RAG 系统 SHALL 使用集中配置的标准 reasoning effort 生成最终答案，默认值 MUST 为 `xhigh`，并 MUST 通过模型请求向 Qwen 回答模型发送该参数。查询改写模型 MUST NOT 携带 reasoning effort。

#### Scenario: 默认执行 xhigh 推理

- **WHEN** 未显式配置 `RAG_REASONING_EFFORT` 且用户发起 RAG 问答
- **THEN** 最终答案模型请求 MUST 携带 `reasoning_effort: xhigh`
- **AND** 查询改写模型请求 MUST NOT 携带 reasoning effort

#### Scenario: 配置使用标准档位

- **WHEN** 部署环境设置合法的标准 reasoning effort
- **THEN** RAG 系统 SHALL 使用该档位生成最终答案

### Requirement: 推理失败降级普通生成

RAG 系统 MUST 在推理模型调用失败或流式调用未产生有效最终答案时，使用同一回答模型移除 reasoning effort 后执行普通生成。仅当推理与普通生成均失败时，系统 SHALL 沿用现有问答错误处理。

#### Scenario: 同步推理失败

- **WHEN** 同步问答的推理模型调用失败
- **THEN** 系统 MUST 使用不带 reasoning effort 的同一回答模型重试
- **AND** 普通生成成功时同步响应 SHALL 正常完成

#### Scenario: 流式推理无答案

- **WHEN** 流式推理结束但没有产生非空最终答案
- **THEN** 系统 MUST 输出既有 fallback 状态并执行不带 reasoning effort 的普通生成

#### Scenario: 两次生成均失败

- **WHEN** 推理生成与普通生成均失败
- **THEN** 系统 SHALL 使用既有错误处理终止问答

### Requirement: reasoning 与最终答案隔离

RAG 系统 SHALL 从供应商响应中分离 reasoning 与普通文本。reasoning MUST NOT 计入最终答案、同步响应、助手消息、短期记忆或后续 Prompt，且系统 MUST NOT 为缺失的 reasoning 额外生成内容。

#### Scenario: 推理流同时返回 reasoning 和答案

- **WHEN** 供应商流式响应包含 reasoning 内容和普通答案文本
- **THEN** 系统 SHALL 仅将普通答案文本写入最终答案和助手消息
- **AND** reasoning MUST NOT 被持久化或注入后续会话记忆

#### Scenario: 供应商未返回 reasoning

- **WHEN** 推理请求只返回普通答案文本
- **THEN** 系统 SHALL 正常返回答案且 MUST NOT 创建空的思考摘要

### Requirement: 流式协议展示供应商 reasoning

RAG 系统 SHALL 将供应商返回的 reasoning 作为字符串增量输出到 SSE，并 MUST 将其映射为标准 AGUI reasoning 生命周期事件。企微消费者 MUST 继续只展示最终答案。

#### Scenario: SSE 输出 reasoning

- **WHEN** 供应商通过 `reasoning_content` 或标准 reasoning block 返回推理增量
- **THEN** SSE SHALL 输出 `reasoning` 事件且 payload 为对应字符串增量
- **AND** 既有 `status`、`answer` 与 `done` 事件结构 SHALL 保持不变

#### Scenario: AGUI 输出 reasoning 生命周期

- **WHEN** AGUI 流收到一个或多个 reasoning 增量
- **THEN** 系统 MUST 按顺序输出 `reasoning-start`、`reasoning-delta` 和 `reasoning-end`
- **AND** `reasoning-end` MUST 在首个答案文本事件之前或流结束时输出

#### Scenario: 企微忽略 reasoning

- **WHEN** 企微机器人消费包含 reasoning 的 RAG 流
- **THEN** 机器人 MUST 仅发送最终答案文本

### Requirement: RAG Admin 展示思考摘要

RAG Admin SHALL 在消息包含 reasoning part 时展示独立的“思考摘要”区域，生成期间 SHALL 展开，生成完成后 SHALL 默认折叠；消息不包含 reasoning 时 MUST NOT 渲染该区域。

#### Scenario: reasoning 正在生成

- **WHEN** 助手消息包含状态为 `streaming` 的 reasoning part
- **THEN** “思考摘要”区域 SHALL 展开并显示当前 reasoning 文本

#### Scenario: reasoning 生成完成

- **WHEN** reasoning part 状态变为 `done`
- **THEN** “思考摘要”区域 SHALL 默认折叠且用户可以手动展开

### Requirement: 推理观测数据保持非敏感

RAG 工作流 metadata 和降级日志 SHALL 记录 reasoning effort 与 fallback 状态，并 MUST NOT 记录 reasoning、问题、Prompt、答案、文档正文或密钥。

#### Scenario: 推理调用发生降级

- **WHEN** 推理生成失败并触发普通生成
- **THEN** 结构化日志和 LangGraph metadata SHALL 包含 `reasoningEffort` 与 `reasoningFallback`
- **AND** 观测数据 MUST NOT 包含任何问答或文档正文
