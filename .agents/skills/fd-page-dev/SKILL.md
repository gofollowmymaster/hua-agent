---
name: fd-page-dev
description: 根据需求文档、UI设计图和接口代码，在 RAG Admin（apps/rag-admin）中完成页面开发，统一承接列表页（搜索/表格/分页/批量操作/导出）、表单页（新增/编辑/校验/提交/详情回填）和详情页（只读展示/ApDescriptions/详情动作）及混合页。适用于从需求到代码的完整开发流程，负责判断页面类型并进入对应执行分支。
---

# RAG Admin 页面开发总入口

本 skill 负责“从需求、UI、接口到页面代码”的执行，统一承接列表页、表单页、详情页及混合页开发。技术标准不在本 skill 中重复定义，必须先遵循根层标准和 RAG Admin 规则。

**门禁通过后，直接完成页面开发，不只输出方案。**

## Agent 会话优先收尾

本 skill 必须把编码阶段的进度、验证、遗留风险和下一组任务调度留在 Agent 会话内完成：

- 最终回复必须显式列出 `待用户审核`、`需用户澄清的问题`、`待处理事项`、`下一步建议` 和 `推荐指令`。
- 每次完成一组或一批任务，就必须说明已勾选任务、剩余任务、验证结果和风险；不得让用户自行打开任务清单判断下一步。
- 若存在待接口补齐、验证未执行或产品口径不确定，必须在最终回复中逐项列出并要求用户在当前会话确认。
- `推荐指令` 必须可直接复制发送；任务未完成时推荐继续 `fd-page-dev`，全部完成时才推荐进入交付复核或 OpenSpec 变更收尾。

## 必须遵循

- 根目录 `AGENTS.md`
- `apps/rag-admin/AGENTS.md`
- `docs/standard/frontend/architecture/README.md`
- `docs/standard/frontend/README.md`
- `docs/standard/frontend/development/page-development.md`
- `docs/standard/frontend/development/page-structure-blueprint.md`
- `docs/standard/frontend/development/page-implementation-best-practices.md`
- `docs/standard/frontend/development/naming-conventions.md`
- `docs/standard/design/README.md`

按页面类型追加：

- 列表页：`docs/standard/frontend/development/table-pattern.md`。
- 表单页：`docs/standard/frontend/development/form-pattern.md`。
- 详情页：`docs/standard/frontend/development/detail-pattern.md`。

涉及 `AgGrid`、`ApForm`、`ApDescriptions`、`ApLabel`、`ApStatus` 等 `@aplus-frontend/ui` 能力时，同时使用 `aplus-ui` skill 查询 API / demo，不凭记忆猜 props。

## 本 skill 负责

- 收集并解析需求、UI、接口和目标页面信息。
- 判断页面类型（列表 / 表单 / 详情 / 混合），进入对应执行分支。
- 在 `apps/rag-admin` 内完成页面、路由、API 接线和必要复用封装。
- 只读消费已有 API 封装，缺接口、字段或签名时记录为待补齐。
- 按 RAG Admin 验证口径执行校验，并输出交付说明。

## 本 skill 不负责

- 重新定义页面、表单、列表、命名等技术标准。
- 绕过 `apps/rag-admin/AGENTS.md`、`docs/standard/frontend/development/` 或根 `AGENTS.md` 中的禁止项。
- 手工修改后端 DTO、Controller、Service 或跨端 shared 契约；契约变化先走 OpenSpec 工作流。
- 在聚合根目录执行 `pnpm dev`、`pnpm build`、`pnpm install`。
- 处理线上问题或测试期缺陷的专属流程；如项目无专属流程，按通用交付流程处理。

## 输入收集

最小必要输入：

- 需求文档、PRD、任务描述或直接粘贴的需求内容。
- UI 设计图、链接、截图或标注图。
- 接口文档、后端 API 定义、mock 或字段约定。
- 参考页面或相邻模块；若未提供，主动搜索当前仓库相近实现。

按页面类型补充收集：

- 列表页：新增还是改造已有页面；是否多 Tab；是否包含导出、批量操作、日志、弹窗、权限、埋点。
- 表单页：新增、编辑、详情、只读中的哪些页面；新增页和编辑页是否复用同一表单组件；字段分组、校验规则、默认值、联动规则、详情回填规则；是否包含提交、保存草稿、取消确认、删除、启停、权限。
- 详情页：路由参数、详情查询主键和返回路径；标题、状态、主按钮、更多动作、编辑跳转；信息分组、字段展示规则、详情内表格、操作日志、权限。

如果关键输入缺失，先从相邻模块和真实代码推断；无法安全推断时再向用户确认，并在交付说明中写明假设。

## OpenSpec 门禁

- 涉及业务接口、接口契约、数据库、跨模块或 shared 公共能力、构建/部署边界或重要外部集成时，先按 `docs/ai-governance/README.md` 判断是否需要 OpenSpec change。
- 若变更已对应 OpenSpec change，先读 `openspec/changes/<name>/proposal.md`、`design.md`、`tasks.md`，按任务清单调度执行。
- 若 OpenSpec change 缺失但任务触发变更条件，停止开发并先使用 `openspec-propose` skill 产出变更，不得直接修改业务代码。
- 只改注释、文档或小范围无行为变化修正时，可以不新增 OpenSpec，但交付说明中写明验证方式。

## 执行流程

1. **读取目标规则**
   - 读根目录 `AGENTS.md` 和 `apps/rag-admin/AGENTS.md`。
   - 读 `docs/standard/frontend/README.md`（共享规范索引），再按页面类型读 `docs/standard/frontend/development/` 下对应标准。
   - 涉及 `@aplus-frontend/ui` 时，同时使用 `aplus-ui` skill 查询 API / demo。

2. **解析需求**
   - 提取页面清单、字段定义、接口契约、路由、权限、缓存、导出、日志、弹窗和跨页面复用要求。
   - 对迭代需求区分“本期新增/修改/删除”和“存量复用无需改动”。

3. **判断页面类型**
   - 表格、搜索、分页、批量操作为主（含搜索表格页、多 Tab 列表页、以表格为主体的查询页面）：进入列表页分支。
   - 新增、编辑、可提交表单、只读表单字段为主：进入表单页分支。
   - 只读信息展示、详情头、详情动作、描述列表为主：进入详情页分支。
   - 混合页：按「页面类型执行分支」的混合页规则处理。

4. **定位参考实现**
   - 先按当前项目已有页面和 `page-implementation-best-practices.md` 判断可复用能力。
   - 搜索命令：
     - 列表页：`rg "usePageListAgGrid|<AgGrid" apps/rag-admin/src`
     - 表单页：`rg "ApForm|ApModal" apps/rag-admin/src`
     - 详情页：`rg "ApDescriptions|ApCard" apps/rag-admin/src`
   - 优先同 app、同业务域；其次参考 `@aplus-frontend/ui` 的 API 和 demo。

5. **实现与接线**
   - 按 `page-structure-blueprint.md` 决定目录结构；页面统一使用 `apps/rag-admin/src/views/<page>/index.vue`，文件、目录统一使用 `kebab-case`。
   - API 接线优先复用 `apps/rag-admin/src/api/` 和 `http.ts` 封装；缺接口、字段或签名时记录“待接口补齐”，不手工拼接 URL。
   - 列表页操作列使用 `valueType: 'action'` 和 `fieldProps.actions`，不用 `customRender` 手写按钮组。
   - 涉及行为、接口契约或 shared 类型变化时，同步检查后端 DTO、Controller、Service 和共享类型，并按 OpenSpec 流程处理。

6. **验证与交付**
   - 在 `apps/rag-admin` 内执行 `pnpm build`，或根目录执行 `pnpm admin:build`。
   - 涉及 test mode 行为时执行 `pnpm build:test`。
   - 交付说明列出修改内容、关键文件、验证命令和结果、残留风险。

## 页面类型执行分支

### 混合页处理

- 列表 + 抽屉/弹窗表单：主体走列表页分支，表单部分叠加 `form-pattern.md` 的字段、校验、提交要点，最后集成。
- 列表 → 详情跳转：拆为两个任务，分别走列表页分支和详情页分支。
- 表单内含可编辑表格：主体走表单页分支，表格列配置参考 `table-pattern.md`。

### 列表页分支

- 触发特征：搜索 + 表格 + 分页 + 批量操作 / 导出 / 多 Tab。
- 组件签名：`AgGrid + usePageListAgGrid`；顶部操作用 `#title` 插槽和 `ApButton`/`Space`，按当前 `document-manager/index.vue` 模式。
- 操作列使用 `valueType: 'action'` 和 `fieldProps.actions`。
- 按 `table-pattern.md` 落地。

### 表单页分支

- 触发特征：新增 / 编辑 / 可提交表单 / 只读表单。
- 组件签名：`ApForm + ApCard` 或 `ApModal` 表单；校验失败按 `ApForm` 校验结果定位第一个错误字段。
- 按 `form-pattern.md` 落地。
- 新增、编辑、详情是否复用同一表单组件，按 `form-pattern.md` 判断。

### 详情页分支

- 触发特征：只读信息展示、详情头、描述列表、详情内表格 / 日志 / 附件。
- 组件签名：`ApCard + ApDescriptions`，描述项可按 schema 外置。
- 按 `detail-pattern.md` 落地。

## 收尾输出

最终交付说明必须包含：

- 本次修改文件、路由 / 菜单 / 权限 / API 接线结果。
- 关键假设、风险和待确认项。
- 待接口补齐的接口、字段、类型。
- 执行过的验证命令和结果。
- 下一步建议：任务未完成时推荐继续 `fd-page-dev`；全部完成且涉及 OpenSpec 时推荐按 OpenSpec 流程做变更收尾。

## 参考资源

- `docs/standard/frontend/development/page-development.md`
- `docs/standard/frontend/development/page-structure-blueprint.md`
- `docs/standard/frontend/development/page-implementation-best-practices.md`
- `docs/standard/frontend/development/table-pattern.md`
- `docs/standard/frontend/development/form-pattern.md`
- `docs/standard/frontend/development/detail-pattern.md`
- `docs/standard/frontend/development/naming-conventions.md`
