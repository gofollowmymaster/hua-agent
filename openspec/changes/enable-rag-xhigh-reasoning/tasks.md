## 1. 配置与内部契约

- [x] 1.1 新增并校验 `RAG_REASONING_EFFORT` 集中配置、配置类型和环境模板
- [x] 1.2 扩展 RAG 流事件与生成内部类型，保持 reasoning 和 answer 独立

## 2. 回答生成

- [x] 2.1 为最终答案创建携带 reasoning effort 的模型和不携带该参数的普通 fallback 模型
- [x] 2.2 实现同步推理调用及失败后普通生成降级，并记录非敏感诊断
- [x] 2.3 实现流式 reasoning 两种格式提取、答案分离、空答案或异常降级及持久化隔离
- [x] 2.4 在 LangGraph run metadata 和节点日志中增加 reasoning effort 与 fallback 状态

## 3. 协议与界面

- [x] 3.1 将 SSE reasoning 事件映射为 AGUI 标准 reasoning 生命周期，并验证企微继续忽略 reasoning
- [x] 3.2 新增 RAG Admin `AssistantReasoning` 组件，实现生成期间展开、完成后折叠和无内容不渲染
- [x] 3.3 在助手消息页面接入 reasoning part，保持页面职责和既有文本/状态渲染

## 4. 测试与验证

- [x] 4.1 补充 API 单元测试，覆盖模型参数、同步/流式降级、reasoning 提取隔离和协议事件顺序
- [x] 4.2 通过前端类型构建与真实组件预览，覆盖思考摘要渲染、展开状态和无内容不渲染
- [x] 4.3 运行定向与完整 API Jest、TypeScript、`pnpm build:dev` 和 `pnpm admin:build`
- [x] 4.4 运行 OpenSpec strict validation、`git diff --check` 并检查桌面和移动消息布局
