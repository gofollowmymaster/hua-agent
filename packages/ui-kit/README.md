# UI Kit

`@aplus-sql/ui-kit` 是同 workspace Vue 3/Vite 应用共享的源码包，承载基于 aplus-ui 的稳定组件和 hooks。

架构说明见 `docs/architecture/README.md`，开发规范见 `docs/standard/README.md`。

## Public API

- 根入口：`@aplus-sql/ui-kit`
- 组件入口：`@aplus-sql/ui-kit/components`
- hooks 入口：`@aplus-sql/ui-kit/hooks`
- 当前导出：`TableTopActionBar`、`DocumentPreview`、`useDocumentPreviewModal`、`useRowClickAction` 及相关类型。

```ts
import {
  TableTopActionBar,
  useDocumentPreviewModal,
  useRowClickAction,
} from '@aplus-sql/ui-kit';

const preview = useDocumentPreviewModal({
  loadFile: (item: { fileName: string; id: string }) => loadFile(item.id),
});
```

## Boundary

- 包内不得导入 `apps/*` 源码、业务 API、store、路由表或应用环境变量。
- 文件加载、权限、刷新和 persistence key 等应用行为通过 props/options 注入。
- 消费端必须提供兼容版本的 Vue、Vue Router、aplus-ui、Open File Viewer、pdfjs 和 Less token 配置。
- `ApTable.Setting` 是 AgGrid 官方列设置入口；aplus deprecated scan 对该 import 的提示属于已核对例外，不允许扩展到其他 ApTable 用法。

## Verification

```bash
pnpm ui-kit:build
pnpm ui-kit:test
pnpm ui-kit:lint:check
pnpm ui-kit:stylelint:check
```
