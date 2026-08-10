## 1. 后端接口

- [x] 1.1 新增文档详情、切片分页和预览 DTO/Service/Controller
- [x] 1.2 补充详情、切片、预览租户隔离和路径越界测试

## 2. 前端 API 目录规范

- [x] 2.1 建立 `src/api/common` 并迁移 HTTP client 和公共类型
- [x] 2.2 拆出 `knowledge-qa/documents.ts`、`sessions.ts`、`assistant.ts`
- [x] 2.3 拆出 `business-agent/knowledge.ts` 并新增详情/切片/预览方法
- [x] 2.4 更新全部页面和组件导入

## 3. 页面与抽屉

- [x] 3.1 业务知识库页面接入文档预览
- [x] 3.2 新增切片抽屉面板并注册 `agent-knowledge-chunks`

## 4. 验证

- [x] 4.1 运行 API lint 和完整测试
- [x] 4.2 运行 RAG Admin lint、stylelint、build
