# Python API 架构说明

`apps/python-api/docs/architecture/` 记录 `apps/python-api` 当前实现的架构事实，包括应用启动、请求处理、领域模块、数据存储和外部依赖。本目录不规定编码写法，开发约束见 `../standard/README.md`。

本文档目录中的 `src/` 默认指 `apps/python-api/src/`，`python_api/` 默认指 `apps/python-api/src/python_api/`。

## 阅读顺序

1. `project-architecture.md`：理解技术栈、目录结构、依赖方向、生命周期和请求链路。
2. `module-and-data-flow.md`：理解七个业务模块及文档入库、检索、对话和工具调用流程。
3. `auth-tenant-and-contract.md`：理解租户、鉴权、HTTP 响应、文件响应和流式协议。
4. `infrastructure-and-runtime.md`：理解数据库、Redis、模型、飞书、文件系统、配置和部署运行。

## 任务阅读路由

| 任务 | 必读文档 |
| --- | --- |
| 修改启动、middleware、异常处理或应用生命周期 | `project-architecture.md`、`auth-tenant-and-contract.md` |
| 新增或修改业务接口 | `module-and-data-flow.md`、`auth-tenant-and-contract.md` |
| 修改 RAG、Agent、文档入库或会话持久化 | `module-and-data-flow.md`、`infrastructure-and-runtime.md` |
| 修改数据库、Redis、飞书、模型或文件目录 | `infrastructure-and-runtime.md`、`auth-tenant-and-contract.md` |
| 修改配置、健康检查、Docker 或启动命令 | `infrastructure-and-runtime.md`、`project-architecture.md` |

## 架构边界

- Python 包保持 `src/python_api/` 布局，模块统一使用 `python_api.*` 绝对导入。
- 应用读取既有 PostgreSQL schema，不在本项目中创建或执行数据库迁移。
- 数据库结构、外部目录和远程服务仅按 Python API 所需契约记录，不展开其内部实现。
- `modules/` 按 auth、rag、agent、business、health 组织能力；业务 API 聚合在 `business/` 下，`core/` 只承载共享机制，`integrations/` 承载外部系统 adapter。
- 所有持久化业务数据都必须显式遵守租户隔离要求。
