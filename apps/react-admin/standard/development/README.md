# React Admin 开发规范

- 业务页面使用 `src/pages/<domain>/<page>/index.tsx`，私有组件和逻辑放同目录。
- 列表页使用 ProTable 的 `request` 模式表达查询、分页和刷新，不在页面中创建 axios 实例。
- 新增、编辑使用 ProForm；确认操作使用 Modal；URL 可恢复详情使用全局 Drawer。
- 异步操作必须提供 loading、成功提示和用户可理解的失败反馈。
- 样式保持管理后台高信息密度，遵循 Ant Design token，不引入第二套 UI 框架。
- 主题色统一从 `src/theme/` 的 Ant Design token、ProLayout token 或业务 CSS 变量读取，不在页面中添加临时硬编码颜色。
- 变更至少运行 `pnpm lint:check`、`pnpm test` 和 `pnpm build`。
