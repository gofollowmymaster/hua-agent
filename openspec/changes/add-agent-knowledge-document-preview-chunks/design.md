## Context

现有 RAG 文档管理已经提供预览弹窗和切片抽屉，业务 Agent 知识库后端只有分页、入库、删除和检索接口，前端 API 全部集中在 `rag-admin.ts`。

## Goals / Non-Goals

**Goals:**

- 为业务 Agent 知识库补齐详情、切片和预览能力。
- 建立 RAG Admin 前端 API 目录规范。
- 复用现有预览弹窗和全局抽屉交互。

**Non-Goals:**

- 不做文件上传和下载接口。
- 不迁移 Global Admin。

## Decisions

- **后端新增详情接口**：`GET /agent/knowledge/documents/:id` 返回文档摘要和实际切片数，切片抽屉依赖它展示摘要。
- **切片分页使用 POST**：`POST /agent/knowledge/documents/:id/chunks/page`，与 RAG 文档管理契约保持一致。
- **预览只支持 Markdown**：业务知识库只入库 `.md`，预览接口返回原始 Markdown 文件并限制路径越界。
- **API 目录规范**：`src/api/common` 放公共 HTTP 客户端和分页类型；`src/api/<module>/<menu>.ts` 放菜单业务请求；页面只按菜单文件导入。

## Risks / Trade-offs

- [API 目录迁移影响现有页面] → 同步更新所有消费方，并运行前端 build/lint 验证。
- [预览路径越界] → 复用 docs 根目录相对路径校验，只允许根目录内文件。

## Migration Plan

1. 后端先新增接口和单元测试。
2. 前端建立 common 目录并迁移 HTTP client。
3. 按菜单拆分知识问答和业务 Agent API。
4. 更新业务知识库页面、抽屉注册表和规范文档。

## Open Questions

无。
