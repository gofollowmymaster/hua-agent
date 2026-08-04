## 1. 配置与类型

- [x] 1.1 增加 rerank endpoint、API key、模型和超时的集中配置、类型与环境模板
- [x] 1.2 扩展内部查询选项、重排输入和结果诊断类型

## 2. 模型策略与降级

- [x] 2.1 实现并注册 `Qwen3Reranker`，完成 DashScope 请求、响应校验和候选映射
- [x] 2.2 重构 `RagRerankService`，实现请求模式优先级及 model → rule → fused 降级链

## 3. 链路透传与观测

- [x] 3.1 在检索 facade 的兼容入口和阶段方法中透传 `rerankMode`
- [x] 3.2 在 LangGraph 重排节点中透传模式并记录非敏感模式与 fallback 诊断

## 4. 测试与验证

- [x] 4.1 增加 Qwen3 请求、响应校验、空候选和异常路径单元测试
- [x] 4.2 增加模式优先级、两级降级、facade 透传和工作流诊断测试
- [x] 4.3 运行相关 Jest、TypeScript 检查、`pnpm build:dev`、完整测试、OpenSpec strict validation 和 `git diff --check`
