## 1. 数据库与配置

- [x] 1.1 在 `apps/api/prisma/rag/schema.prisma` 新增 `AgentDocument`、`AgentChunk` 模型
- [x] 1.2 在 `apps/api/prisma/rag/schema.sql` 新增 `agent_documents`、`agent_chunks` 表及索引
- [x] 1.3 新增迁移 `apps/api/prisma/rag/migrations/202608100001_add_agent_knowledge.sql`
- [x] 1.4 在 `apps/api/src/config` 新增 `agentKnowledge` 配置类型、默认值和环境变量模板
- [x] 1.5 调整 `category` 派生规则为 docs 二级目录并去除租户前缀

## 2. Agent 知识库后端模块

- [x] 2.1 新增 `apps/api/src/agent/knowledge/type/` 类型定义
- [x] 2.2 新增文档扫描、frontmatter 解析、内容清洗、切分和向量化入库 Service
- [x] 2.3 新增全文、向量和混合检索 Service
- [x] 2.4 新增管理列表和删除 Service
- [x] 2.5 新增 Controller、DTO 并在 `AgentModule` 注册

## 3. 独立入库程序与命令

- [x] 3.1 新增 `apps/api/scripts/agent-knowledge-ingest.ts`
- [x] 3.2 在 `apps/api/package.json` 新增 `agent:ingest` 脚本
- [x] 3.3 在根目录 `package.json` 新增 `agent:ingest` 转发命令

## 4. 测试与验证

- [x] 4.1 为 frontmatter 解析和 Markdown 清洗补充单元测试
- [x] 4.2 为入库 Service 补充非 md 跳过和幂等逻辑测试
- [x] 4.3 为检索 Service 补充全文、向量、混合模式测试
- [x] 4.4 运行 `pnpm pg` 生成 RAG Prisma client
- [x] 4.5 运行 `pnpm --filter @aplus-sql/api lint:check`
- [x] 4.6 运行 `pnpm --filter @aplus-sql/api test`
