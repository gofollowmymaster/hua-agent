# RAG Admin 开发规范

`docs/standard/rag-admin/` 记录 `apps/rag-admin` 前端实现规范。前端架构事实见 `docs/architecture/rag-admin/README.md`。

## 阅读顺序

1. `code-style.md`：Vue/TypeScript 基本写法、组件和错误处理规则。
2. `module-design.md`：页面、布局、API、auth、store、样式的放置规则。
3. `api-client.md`：axios、token、接口契约和错误处理规范。
4. `routing-and-state.md`：路由和 Pinia 状态管理规范。
5. `styling.md`：全局样式、组件样式和 UI 组件使用规范。

## 验证入口

前端代码变更至少运行：

```bash
pnpm rag-admin:build
```

涉及 API 契约时，同时运行或说明 API 侧验证。具体验证矩阵见 `docs/ai-governance/testing-and-verification.md`。
