## 1. 契约与持久化

- [x] 1.1 定义有序 Agent 消息 part 类型，并扩展 RAG Prisma schema、初始化 SQL 和迁移
- [x] 1.2 扩展会话记忆服务与历史 API，持久化并返回新助手消息的 parts

## 2. 流式顺序

- [x] 2.1 在 Agent Chat stream 中按可见事件顺序维护 timeline，并在事件边界分隔 text/reasoning stream id
- [x] 2.2 保留最终 content 与 toolCalls 的现有语义

## 3. RAG Admin 回放

- [x] 3.1 扩展 Agent Chat API 类型，adapter 优先映射有序 parts，并保留旧记录回退

## 4. 验证

- [x] 4.1 补充 API 流式顺序与历史持久化测试
- [ ] 4.2 补充前端 adapter 回放测试，运行 Prisma generate、相关测试和构建（`pnpm pg` 被运行中的 API 进程锁定）
