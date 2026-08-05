# RAG Admin 规范索引

`apps/rag-admin/docs/standard/` 记录 `apps/rag-admin` 的页面开发规范。整体产品设计规范位于根目录 `docs/standard/design/`；登录/API、目录/模块、路由/状态规范已合并到 `apps/rag-admin/docs/architecture/` 对应文件；架构事实入口见 `apps/rag-admin/docs/architecture/README.md`。

## 阅读顺序

1. `development/code-style.md`：Vue/TypeScript 基本写法、组件和错误处理规则。
2. `../architecture/directory-structure.md`：目录结构事实、页面/组件/请求放置规则和单一职责规则。
3. `development/page-structure-blueprint.md`：新增和复杂页面的目录标准。
4. `development/page-development.md`：页面开发通用规则和复用边界。
5. `development/page-implementation-best-practices.md`：组件、hooks、AgGrid、表单、弹框、详情展示的推荐写法。
6. `development/table-pattern.md` / `development/form-pattern.md` / `development/detail-pattern.md`：按页面类型落地的列表、表单、详情方案。
7. `development/naming-conventions.md`：路由、页面、API、类型、常量和未来权限/埋点命名。
8. `../architecture/auth-and-api-client.md`：登录、token、axios、接口契约和错误处理规范。
9. `../architecture/project-architecture.md`：项目架构、路由和 Pinia 状态管理规范。
10. `development/styling.md`：全局样式、组件样式和 UI 组件使用规范。

整体产品设计规范见 [根目录产品设计规范](../../../../docs/standard/design/README.md)。

## 高频硬规则

- 页面开发强制优先使用 `@aplus-frontend/ui`。表格、表单、详情、弹窗、抽屉、分页、筛选、按钮、提示等后台常见能力默认使用 aplus-ui 成熟组件。
- 使用 aplus-ui 前先查组件 API、类型和示例；不要凭记忆猜 props。必要时使用 `aplus info <Component> --format json` 和 `aplus demo <Component> ... --format json`。
- 只有 aplus-ui 不满足场景、项目已有封装更合适，或存在明确技术限制时，才使用 `@aplus-frontend/antdv`、原生控件或新增自定义组件，并说明原因。
- 单个 `.vue`、`.ts` 文件不超过 400 行；接近上限时拆分组件、API 类型、工具函数或 store。
- 遵循单一职责原则：页面负责组合和状态编排，API 文件负责请求，store 负责跨页面状态，组件负责展示和局部交互。
- 命名和文件名遵循 `development/code-style.md` 与 `../architecture/directory-structure.md`，不要新增同职责平行目录或随意缩写。

## 验证入口

前端代码变更至少运行：

```bash
pnpm build
```

在根目录可运行：

```bash
pnpm admin:build
```

涉及 API 契约时，同时运行或说明 API 侧验证。具体验证矩阵见 `docs/ai-governance/testing-and-verification.md`。
