## Why

业务 Agent 的订单工具目前只能以文本和工具详情展示，用户无法在同一对话中直观查看订单状态或执行受控操作。

## What Changes

- 为 React Admin 业务 Agent 增加 A2UI v0.9 订单卡片和确认式操作。
- FastAPI 从受信任的订单工具结果编译并持久化 `data-a2ui` parts。
- 新增仅 FastAPI 提供的订单卡片动作接口；NestJS 不在本 change 范围。

## Impact

- React Admin、React UI Kit 和 Python Agent Chat。
- 不新增数据库字段或迁移，复用 `agent_chat_messages.parts`。
