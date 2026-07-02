## 1. OpenSpec

- [x] 1.1 创建并校验 proposal、design、spec 和 tasks。

## 2. RAG 模块

- [x] 2.1 新增 `src/ai/rag` 模块、controller、service、DTO、types。
- [x] 2.2 迁移文档加载服务，支持 PDF、DOCX、XLSX、PPT/PPTX、TXT、MD。
- [x] 2.3 新增 pgvector 数据库服务，使用 `RAG_DATABASE_URL`。
- [x] 2.4 在 `AiModule` 注册 RAG controller/providers。

## 3. 数据库、配置和依赖

- [x] 3.1 新增 `database/rag/schema.sql` 和 `scripts/rag-db-init.mjs`。
- [x] 3.2 更新 `package.json` 脚本和 RAG 依赖。
- [x] 3.3 更新环境变量模板/配置说明，不提交真实密钥。

## 4. 资料迁移

- [x] 4.1 将源项目 `raw/` 目录复制到本仓库。

## 5. 验证

- [x] 5.1 安装依赖并更新 lockfile。
- [x] 5.2 运行测试和构建，修复类型或编译问题。
- [x] 5.3 说明 RAG schema 初始化和人工接口验证条件。
