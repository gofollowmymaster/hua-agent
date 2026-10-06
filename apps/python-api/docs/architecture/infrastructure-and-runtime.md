# 基础设施与运行时

## 配置加载

`config.py` 使用 `PYTHON_API_ENV` 选择 `dev`、`test` 或 `prod`，并兼容 `development`、`production` 别名。配置文件按以下优先级加载，后者覆盖前者：

1. `.env`
2. `.env.{environment}`
3. `.env.{environment}.local`
4. 进程环境变量

`Settings` 在应用导入阶段校验数据库、Redis、JWT 和关联配置。模型、embedding、rerank 与飞书凭据在对应功能被调用时再校验。`SecretStr` 用于避免密钥出现在对象输出中，配置错误只列出字段名。

## PostgreSQL

`core/database.py` 创建全局 async engine 和 `async_sessionmaker`，每个请求通过 `get_db` 获取独立 `AsyncSession`。连接池大小、溢出、等待时间、回收和 pre-ping 均由配置控制。

`models.py` 映射以下既有表：

- `rag_admin_users`。
- `aplus_documents`、`aplus_chunks`。
- `agent_documents`、`agent_chunks`。
- `aplus_rag_sessions`、`aplus_rag_messages`。
- `agent_chat_sessions`、`agent_chat_messages`。

本项目不创建数据库迁移。常规读写优先使用 SQLAlchemy ORM；需要 pgvector、zhparser、JSONB cast 或 PostgreSQL upsert 时使用参数化 `text()`。

向量列维度由 `EMBEDDINGS_DIMENSIONS` 配置，当前默认值为 1024。向量值序列化为 JSON 数组字符串后通过 `CAST(:embedding AS vector)` 写入，禁止拼接 SQL 字面量。

## Redis

`core/redis/redis_service.py` 创建异步 Redis client，并集中维护 key 模板：

- `frontend-node:mtable:{appToken}:{tableId}`：飞书表格缓存基础 key。
- `frontend-node:limiter:{key}`：限流计数。
- `frontend-node:idempotent:{key}`：幂等状态。
- `frontend-node:{tenant}:feishu-api:{apiName}`：租户化飞书 API 缓存。
- `frontend-node:{tenant}:rag:memory:{channel}:{sessionKey}`：RAG 会话记忆。

`RedisService` 提供 key 展开、限流、幂等、SCAN 读取和受保护的批量删除。批量删除使用 SCAN 和固定批次，不允许对过短 pattern 执行删除。

## 模型与检索

Chat 和 embedding 使用 OpenAI-compatible client：

- `OPENAI_*` 配置聊天模型。
- `EMBEDDINGS_*` 配置向量模型，未单独提供 key 时回退到 OpenAI key。
- `RERANK_*` 预留 rerank provider 配置。
- `RAG_*` 和 `AGENT_*` 控制分块、候选数、融合和 prompt 版本。

外部 provider 不可用时必须产生明确错误或执行代码中定义的 fallback，不允许静默返回伪造结果。

## 飞书

`FeishuClient` 延迟创建 lark-oapi client。`ClientSecretTable` 读取固定 token 记录，并在 Redis 中缓存 24 小时；同步 SDK 调用通过 `asyncio.to_thread` 离开事件循环。

`FeishuAlertService` 支持向配置的群聊发送异常卡片，并使用进程内时间窗口限制发送频率。未配置飞书告警参数时直接跳过，不影响核心请求链路。

## 文件系统

- RAG 原始文档位于 `WORKSPACE_ROOT/RAW_DIR/<tenant>`。
- Agent 文档目录由 `AGENT_DOCS_DIR` 配置；相对路径根据代码定义的 workspace 位置解析。
- `/public` 仅在配置对应目录存在时挂载。
- 上传支持 PDF、DOC/DOCX、XLS/XLSX、PPT/PPTX、TXT 和 Markdown；数量与单文件大小受配置限制。

所有文件输入必须校验扩展名、大小和最终解析路径。文件名不能直接作为不受控的绝对路径使用。

## 健康检查

- `GET /health/live`：只表示 HTTP 进程可响应。
- `GET /health/ready`：分别执行 PostgreSQL `SELECT 1` 和 Redis `PING`，全部成功时返回 `ok`，否则返回 `not_ready`。

就绪检查捕获依赖异常并返回布尔状态，不修改数据库或 Redis。

## 启动与部署

根目录提供以下入口：

```bash
pnpm python-api:sync
pnpm python-api:dev
pnpm python-api:start
pnpm python-api:test
pnpm python-api:lint
pnpm python-api:typecheck
pnpm python-api:build
```

`python -m python_api.run` 从 `Settings` 读取 host、port、worker 和 reload 配置并启动 Uvicorn。开发、测试和生产脚本分别显式选择环境。

Docker 镜像使用 Python 3.12 slim 和固定版本 uv，按 `uv.lock` 安装生产依赖，复制 `src/` 后构建项目，默认以 `prod` 环境在 8000 端口运行。容器关闭时由 lifespan 释放 Redis 与数据库连接池。

