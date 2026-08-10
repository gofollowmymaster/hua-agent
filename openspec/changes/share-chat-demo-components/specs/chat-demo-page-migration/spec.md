## ADDED Requirements

### Requirement: 知识问答 Demo 迁移
`/knowledge/assistant` SHALL 使用 `ChatDemoShell` 和知识问答 adapter，保留文档预览与 reasoning 展示。

#### Scenario: 知识问答提问
- **WHEN** 用户在知识问答 Demo 发送问题
- **THEN** 页面通过共享组件流式展示答案和文档预览

### Requirement: 业务 Agent Demo 迁移
`/business-agent/demo` SHALL 使用 `ChatDemoShell` 和业务 Agent adapter，保留工具调用状态。

#### Scenario: 业务 Agent 提问
- **WHEN** 用户在业务 Agent Demo 发送问题
- **THEN** 页面通过共享组件展示工具调用状态和最终答案
