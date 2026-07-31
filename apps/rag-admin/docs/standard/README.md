# RAG Admin 开发规范

`apps/rag-admin/docs/standard/` 记录 `apps/rag-admin` 前端实现规范。前端架构事实见 `apps/rag-admin/docs/architecture/README.md`。

## 阅读顺序

1. `code-style.md`：Vue/TypeScript 基本写法、组件和错误处理规则。
2. `module-design.md`：页面、布局、组件、API、auth、store、样式的放置规则和单一职责规则。
3. `api-client.md`：axios、token、接口契约和错误处理规范。
4. `routing-and-state.md`：路由和 Pinia 状态管理规范。
5. `styling.md`：全局样式、组件样式和 UI 组件使用规范。

## 高频硬规则

- 页面开发强制优先使用 `@aplus-frontend/ui`。表格、表单、详情、弹窗、抽屉、分页、筛选、按钮、提示等后台常见能力默认使用 aplus-ui 成熟组件。
- 使用 aplus-ui 前先查组件 API、类型和示例；不要凭记忆猜 props。必要时使用 `aplus info <Component> --format json` 和 `aplus demo <Component> ... --format json`。
- 只有 aplus-ui 不满足场景、项目已有封装更合适，或存在明确技术限制时，才使用 `@aplus-frontend/antdv`、原生控件或新增自定义组件，并说明原因。
- 单个 `.vue`、`.ts` 文件不超过 400 行；接近上限时拆分组件、API 类型、工具函数或 store。
- 遵循单一职责原则：页面负责组合和状态编排，API 文件负责请求，store 负责跨页面状态，组件负责展示和局部交互。
- 命名和文件名遵循 `code-style.md` 与 `module-design.md`，不要新增同职责平行目录或随意缩写。

## 验证入口

前端代码变更至少运行：

```bash
pnpm rag-admin:build
```

涉及 API 契约时，同时运行或说明 API 侧验证。具体验证矩阵见 `docs/ai-governance/testing-and-verification.md`。
