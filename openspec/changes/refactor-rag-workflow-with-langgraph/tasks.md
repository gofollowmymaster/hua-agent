## 1. 依赖与图状态

- [x] 1.1 添加 `@langchain/langgraph` 依赖并更新 workspace lockfile
- [x] 1.2 定义 RAG 工作流输入、状态、输出和 custom stream 类型

## 2. 检索节点能力

- [x] 2.1 将向量和关键词召回拆为可独立调用且带诊断结果的方法
- [x] 2.2 将候选融合和 rerank 拆为图节点可调用的方法并保持降级语义

## 3. LangGraph 主链路

- [x] 3.1 实现完整 RAG StateGraph 和并行召回 fan-out/fan-in
- [x] 3.2 实现同步 invoke、custom 流输出、生成 fallback 和 trace 元数据
- [x] 3.3 将同步、SSE、AGUI 与企微入口切换到共享工作流并完成 NestJS 注册
- [x] 3.4 合并同步与流式协议适配服务，由 `RagQueryService` 统一持有共享工作流

## 4. 测试与验证

- [x] 4.1 补充检索阶段诊断、单路失败、融合和 rerank 降级测试
- [x] 4.2 补充图拓扑、同步结果、消息顺序、流式事件及 fallback 测试
- [x] 4.3 运行相关 Jest、完整 API 测试和 `pnpm build:dev`
