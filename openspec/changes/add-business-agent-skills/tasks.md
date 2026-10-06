## 1. 数据与 API

- [x] 1.1 新增用户 Skill Prisma 模型、基线 SQL 和幂等迁移
- [x] 1.2 新增系统 Skill 清单、DTO、类型和 Skill Service
- [x] 1.3 新增受 Bearer JWT 保护的 Skill Controller 并注册模块
- [x] 1.4 覆盖系统清单、CRUD、所有者隔离和启用限制测试

## 2. Agent 运行时

- [x] 2.1 将 Agent 改为按请求组合核心提示词和 Skill 指令
- [x] 2.2 从可信 JWT 上下文传递用户 ID，固定密钥仅装载系统 Skill
- [x] 2.3 回归有序事件、工具日志、五次调用限制和订单写边界测试

## 3. Vue RAG Admin

- [x] 3.1 新增 Skill API 类型与请求封装
- [x] 3.2 在同一页面实现系统 Skill 和用户 Skill 双 Tab
- [x] 3.3 实现只读详情、用户表单、启停与删除交互测试

## 4. React Admin

- [x] 4.1 新增 Skill API 类型与请求封装
- [x] 4.2 在同一页面实现系统 Skill 和用户 Skill 双 Tab
- [x] 4.3 实现只读详情、用户表单、启停与删除交互测试

## 5. 验证与文档

- [x] 5.1 更新路由说明、React 规格和 NestJS/FastAPI 能力差异文档
- [x] 5.2 运行 Prisma generate、聚焦测试、lint、双前端 build 和 diff 检查
