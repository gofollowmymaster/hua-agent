# Tasks

## 1. 契约与工程骨架

- [x] 1.1 建立路由清单和 NestJS 行为契约基线
- [x] 1.2 创建 Python 3.12 + uv 项目、配置、应用工厂和质量工具
- [x] 1.3 实现响应包装、异常转换、日志、CORS、静态资源和健康检查

## 2. 共享基础设施

- [x] 2.1 映射 Prisma RAG schema 并建立 async PostgreSQL session/repository
- [x] 2.2 实现兼容 Redis key、TTL、限流和幂等能力
- [x] 2.3 实现租户上下文、JWT、scrypt、管理员和组合鉴权
- [x] 2.4 使用飞书官方 SDK 迁移多维表格、固定 token 缓存和异常告警

## 3. 管理与知识库接口

- [x] 3.1 迁移本地用户登录和用户管理接口
- [x] 3.2 迁移 RAG Admin 文档、上传、预览、切片和会话接口
- [x] 3.3 迁移 Agent 知识库入库、全文/向量检索和文档接口
- [x] 3.4 迁移一件代发订单 Mock 接口和工具
- [x] 3.5 映射用户 Skill 表并迁移系统清单、五个管理接口、所有者隔离和启用限制

## 4. AI 与 Agent

- [x] 4.1 迁移文档解析、切片、embedding、pgvector 和 zhparser 查询
- [x] 4.2 迁移 RAG 路由、改写、混合检索、rerank、工作流和记忆
- [x] 4.3 实现 AI SDK UI Message 流编码与 RAG 聊天接口
- [x] 4.4 迁移 Deep Agents、五次工具限制、工具恢复、日志和严格有序流
- [x] 4.5 按请求动态装载系统 Skill 与 JWT 用户 Skill，固定密钥会话仅装载系统 Skill

## 5. Workspace 与部署

- [x] 5.1 增加根命令、独立 Dockerfile 和生产启动配置
- [x] 5.2 增加 Python app AGENTS、架构、开发和验证文档并更新 workspace 索引
- [x] 5.3 将 Python 配置独立为 dev/test/prod 分层文件并接入核心与可选配置校验

## 6. 验证

- [ ] 6.1 增加 36 个接口的差异契约测试和鉴权/错误场景
- [ ] 6.2 增加 PostgreSQL、Redis、飞书 mock 和跨后端互操作测试
- [ ] 6.3 增加 RAG/Agent 固定 provider 流事件与持久化回归测试
- [ ] 6.4 运行 Python 质量检查、API 测试及前端/SDK 消费验证
- [x] 6.5 增加 Skill schema/service/HTTP/runtime/差异与互操作测试，更新 36 路由清单并完成相关质量和前端构建验证
