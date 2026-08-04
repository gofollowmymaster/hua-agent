## 1. 路由与 Prompt 能力

- [x] 1.1 定义内部问题路由类型、结构化结果和图状态字段
- [x] 1.2 新增基于 `qwen-turbo` 的问题路由 Service，覆盖保守 RAG 降级和非敏感日志
- [x] 1.3 注册 route 与 direct Prompt，并在 `AiModule` 注册路由 Provider

## 2. LangGraph 条件链路

- [x] 2.1 增加 `route_question` 条件节点和 rag/direct 两条显式分支
- [x] 2.2 保持 RAG 改写、并行召回、融合、重排和 xhigh 生成行为
- [x] 2.3 实现 direct Prompt、普通模型同步/流式生成和空流或异常 fallback
- [x] 2.4 保持两条路径的消息持久化、结果结构和既有协议适配

## 3. 测试与验证

- [x] 3.1 覆盖路由分类、短期记忆、非法响应和异常降级测试
- [x] 3.2 覆盖 rag/direct 图分支、节点调用、流式状态、reasoning 隔离和空来源测试
- [x] 3.3 运行相关 Jest、完整测试、`pnpm build:dev`、OpenSpec strict validation 和 `git diff --check`
