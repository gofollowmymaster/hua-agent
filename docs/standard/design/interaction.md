# 交互与视觉默认规范

## 详情展示

- 详情统一采用抽屉展示，不新建页面私有详情抽屉。
- 详情必须支持 URL 分享：复制链接、新标签打开或刷新后，抽屉仍能根据 URL 恢复。
- 当前 RAG Admin 落地：使用全局 `LayoutDrawer`，通过 `useLayoutDrawer().open(key, params)` 写入 `drawer` / `drawerCode` query，关闭时通过 `useLayoutDrawer().close()` 移除 query。
- 复杂详情内容按现有目录规范放入对应页面的 `sections/`，不把详情区块堆入列表页主组件。

## 颜色规范

- 颜色严格遵循主题颜色规范体系，常规页面不出现主题颜色体系以外的颜色；确需新增颜色时，先补充到统一预设并通过变量引用，不在页面中引入临时色值。
- 当前 RAG Admin 落地：色值统一来自 `apps/rag-admin/src/config/theme-color-token.ts` 的 `ThemeColor` 预设，通过 Less 变量或 `aplusModifyVars` 引用。
