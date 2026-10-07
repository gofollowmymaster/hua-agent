# Spec Delta

## ADDED Requirements

### Requirement: Workspace 使用统一 AI SDK 7 运行时

所有直接使用 AI SDK 的 TypeScript app 和 package SHALL 使用同一 AI SDK 7 版本族，不得混用 AI SDK 6 transport 与 AI SDK 7 hooks。

#### Scenario: 解析 workspace 依赖
- **WHEN** 检查各聊天 app 和 package 的依赖树
- **THEN** `ai` 解析为 `7.0.130`，React 和 Vue hooks 分别使用与其匹配的 4.x 版本

### Requirement: 实时 reasoning 保持可见

React 和 Vue 聊天界面 SHALL 在实时流期间展示 reasoning，并在流完成后保留其内容与原始事件顺序。

#### Scenario: reasoning 后生成正文
- **WHEN** 服务端依次发送 reasoning、工具状态和正文事件
- **THEN** 客户端在正文完成前展示 reasoning，完成后仍按原始顺序展示全部 parts

### Requirement: 后端协议保持兼容

NestJS 与 FastAPI SHALL 继续输出可由 AI SDK 7 transport 消费的 UI Message SSE。

#### Scenario: 正常与失败流
- **WHEN** 客户端消费正常流或运行期失败流
- **THEN** 正常流保留既有事件和终止语义，失败流产生既有脱敏 error 事件
