## 1. 依赖与类型

- [x] 1.1 添加 `deepagents`、`langchain` 及 peer 依赖，并提升 `@langchain/core`
- [x] 1.2 定义 `AgentChatAgentEvent` 类型并收敛 AGUI writer 类型

## 2. Deep Agents 运行时

- [x] 2.1 实现 `AgentChatAgentService`：模型构建、harness profile、`createDeepAgent` 单例
- [x] 2.2 实现 ordered stream 消费，将 messages/tools 事件转换为 `AgentChatAgentEvent`
- [x] 2.3 精简 `AgentChatToolService`，移除重复 handler 和 `execute()`

## 3. 服务与模块接线

- [x] 3.1 重构 `AgentChatService` 为协议与记忆编排，并映射 deepagents 事件
- [x] 3.2 注册 `AgentChatAgentService` 到 `AgentModule`

## 4. 测试与验证

- [x] 4.1 更新 tool service 测试
- [x] 4.2 新增 agent service 测试
- [x] 4.3 更新 chat service 测试
- [x] 4.4 运行相关 Jest、完整 API 测试与 `pnpm build:dev`
