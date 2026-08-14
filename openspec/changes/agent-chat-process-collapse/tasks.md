## 1. 后端

- [x] 1.1 抽取模型 reasoning 文本并产出 `reasoning_delta`
- [x] 1.2 包装 `reasoning-start/delta/end` 并追加工具结果摘要
- [x] 1.3 补充流事件顺序与摘要单测
- [x] 1.4 `tool_result` 的 `data-status` 携带 `arguments` 与 `result`

## 2. UI Kit

- [x] 2.1 消息列表按 `message.parts` 原始顺序渲染
- [x] 2.2 移除 `collapseProcessAfterAnswer` 与过程区块
- [x] 2.3 reasoning 始终展开，data-status 全量通用状态卡渲染
- [x] 2.4 tool_result 保留工具入参与输出
- [x] 2.5 重写消息列表顺序与工具过程测试

## 3. 业务 Agent 入口

- [x] 3.1 清理 RAG Admin 业务 Agent Demo 折叠选项
- [x] 3.2 清理 SDK host 与 Web Component 折叠配置
- [x] 3.3 更新状态文案优先级与 SDK 类型
- [x] 3.4 RAG Admin 与 SDK 历史 adapter 恢复工具过程

## 4. 验证

- [x] 4.1 运行 API 相关 Jest
- [x] 4.2 运行 UI Kit 测试与类型检查
- [x] 4.3 运行 SDK 测试与 RAG Admin 构建
