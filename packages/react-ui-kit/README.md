# React UI Kit

`@aplus-sql/react-ui-kit` 是同 workspace React 应用共享的源码包，基于 Ant Design X 提供会话列表、聊天框和完整会话工作区。

## Public API

```tsx
import {
  ChatWorkspace,
  type ChatAdapter,
} from '@aplus-sql/react-ui-kit';

<ChatWorkspace
  adapter={adapter satisfies ChatAdapter}
  participantId={currentUserId}
  assistantName="业务 Agent"
/>;
```

- `ConversationList`：受控会话历史列表。
- `ChatBox`：受控消息列表与发送框。
- `ChatWorkspace`：完整的会话、历史和 AI SDK 流式状态编排。
- `ChatAdapter`：由消费 app 注入 API、鉴权 transport、消息转换和业务格式化。

## Boundary

- 包内不得导入 `apps/*`、Umi、业务 API、认证 storage、路由或环境变量。
- 后端地址、token、会话接口、历史转换和文档预览解析由 adapter 注入。
- 包直接导出 TS/TSX 源码，不生成 `dist`，只服务当前 workspace 的 React 18、antd 6 技术基线。

## Verification

```bash
pnpm react-ui-kit:build
pnpm react-ui-kit:test
pnpm react-ui-kit:lint:check
pnpm react-ui-kit:format:check
```

架构说明见 `docs/architecture/README.md`，开发规范见 `docs/standard/README.md`。
