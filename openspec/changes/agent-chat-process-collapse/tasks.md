## 1. 后端

- [x] 1.1 抽取模型 reasoning 文本并产出 `reasoning_delta`
- [x] 1.2 包装 `reasoning-start/delta/end` 并追加工具结果摘要
- [x] 1.3 补充流事件顺序与摘要单测

## 2. UI Kit

- [x] 2.1 新增 `collapseProcessAfterAnswer` 选项
- [x] 2.2 新增可折叠过程区块并接入消息列表
- [x] 2.3 补充过程区块与消息列表组件测试

## 3. 业务 Agent 入口

- [x] 3.1 RAG Admin 业务 Agent Demo 默认开启折叠
- [x] 3.2 SDK host 与 Web Component 默认开启折叠
- [x] 3.3 更新状态文案优先级与 SDK 类型

## 4. 验证

- [x] 4.1 运行 API 相关 Jest
- [x] 4.2 运行 UI Kit 测试与类型检查
- [x] 4.3 运行 SDK 测试与 RAG Admin 构建
